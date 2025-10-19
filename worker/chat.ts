import OpenAI from 'openai';
import type { Message, ToolCall, UserProfileContext, EcosystemInsight, ChatTakeaway, Contact, KismetEvent, Community, Relationship, Organization, Skill, Project, KnowledgeItem, CommunityResource, Goal } from './types';
import { getToolDefinitions, executeTool } from './tools';
import { ChatCompletionMessageFunctionToolCall } from 'openai/resources/index.mjs';
interface CompletionResponse {
  id?: string | number;
  [key: string]: unknown;
}
function sanitizeJsonString(jsonString: string): string {
  return jsonString.replace(/,\s*([\]}])/g, '$1');
}
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  constructor(aiGatewayUrl: string, apiKey: string, model: string) {
    this.client = new OpenAI({
      baseURL: aiGatewayUrl,
      apiKey: apiKey
    });
    this.model = model;
  }
  async processMessage(
    message: string,
    conversationHistory: Message[],
    context?: UserProfileContext,
    proactiveMode?: boolean,
    onChunk?: (chunk: string) => void
  ): Promise<{
    content: string;
    toolCalls?: ToolCall[];
  }> {
    const messages = this.buildConversationMessages(message, conversationHistory, context, proactiveMode);
    const toolDefinitions = await getToolDefinitions();
    if (onChunk) {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: toolDefinitions,
        tool_choice: 'auto',
        max_tokens: 16000,
        stream: true
      });
      return this.handleStreamResponse(stream, message, conversationHistory, context, proactiveMode, onChunk);
    }
    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages,
      tools: toolDefinitions,
      tool_choice: 'auto',
      max_tokens: 16000,
      stream: false
    });
    return this.handleNonStreamResponse(completion, message, conversationHistory, context, proactiveMode);
  }
  private async handleStreamResponse(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    message: string,
    conversationHistory: Message[],
    context: UserProfileContext | undefined,
    proactiveMode: boolean | undefined,
    onChunk: (chunk: string) => void
  ) {
    let fullContent = '';
    const accumulatedToolCalls: ChatCompletionMessageFunctionToolCall[] = [];
    try {
      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        if (delta?.content) {
          fullContent += delta.content;
          onChunk(delta.content);
        }
        if (delta?.tool_calls) {
          for (let i = 0; i < delta.tool_calls.length; i++) {
            const deltaToolCall = delta.tool_calls[i];
            if (!accumulatedToolCalls[i]) {
              accumulatedToolCalls[i] = {
                id: deltaToolCall.id || `tool_${Date.now()}_${i}`,
                type: 'function',
                function: {
                  name: deltaToolCall.function?.name || '',
                  arguments: deltaToolCall.function?.arguments || ''
                }
              };
            } else {
              if (deltaToolCall.function?.name && !accumulatedToolCalls[i].function.name) {
                accumulatedToolCalls[i].function.name = deltaToolCall.function.name;
              }
              if (deltaToolCall.function?.arguments) {
                accumulatedToolCalls[i].function.arguments += deltaToolCall.function.arguments;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Stream processing error:', error);
      throw new Error('Stream processing failed');
    }
    if (accumulatedToolCalls.length > 0) {
      const executedTools = await this.executeToolCalls(accumulatedToolCalls, context);
      const finalResponse = await this.generateToolResponse(message, conversationHistory, accumulatedToolCalls, executedTools, context, proactiveMode);
      return { content: finalResponse, toolCalls: executedTools };
    }
    return { content: fullContent };
  }
  private async handleNonStreamResponse(
    completion: OpenAI.Chat.Completions.ChatCompletion,
    message: string,
    conversationHistory: Message[],
    context?: UserProfileContext,
    proactiveMode?: boolean
  ) {
    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage) {
      return { content: 'I apologize, but I encountered an issue processing your request.' };
    }
    if (!responseMessage.tool_calls) {
      return {
        content: responseMessage.content || 'I apologize, but I encountered an issue.'
      };
    }
    const toolCalls = await this.executeToolCalls(responseMessage.tool_calls as ChatCompletionMessageFunctionToolCall[], context);
    const finalResponse = await this.generateToolResponse(
      message,
      conversationHistory,
      responseMessage.tool_calls,
      toolCalls,
      context,
      proactiveMode
    );
    return { content: finalResponse, toolCalls };
  }
  private async executeToolCalls(openAiToolCalls: ChatCompletionMessageFunctionToolCall[], context?: UserProfileContext): Promise<ToolCall[]> {
    return Promise.all(
      openAiToolCalls.map(async (tc) => {
        try {
          const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          const result = await executeTool(tc.function.name, args, context);
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: args,
            result
          };
        } catch (error) {
          console.error(`Tool execution failed for ${tc.function.name}:`, error);
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: {},
            result: { error: `Failed to execute ${tc.function.name}: ${error instanceof Error ? error.message : 'Unknown error'}` }
          };
        }
      })
    );
  }
  private async generateToolResponse(
    userMessage: string,
    history: Message[],
    openAiToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
    toolResults: ToolCall[],
    context?: UserProfileContext,
    proactiveMode?: boolean
  ): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context, proactiveMode);
    const followUpCompletion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-3).map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          content: null,
          tool_calls: openAiToolCalls
        },
        ...toolResults.map((result, index) => ({
          role: 'tool' as const,
          content: JSON.stringify(result.result),
          tool_call_id: openAiToolCalls[index]?.id || result.id
        }))
      ],
      max_tokens: 16000
    });
    return followUpCompletion.choices[0]?.message?.content || 'Tool results processed successfully.';
  }
  private buildSystemPrompt(context?: UserProfileContext, proactiveMode?: boolean): string {
    let prompt = "You are CYNQ, a helpful and insightful personal consultant. Your goal is to provide predictive and refined consultations based on the user's unique ecosystem and the broader community intelligence. You have access to a tool called `get_contact_email` to retrieve a contact's email address if they have one stored.";
    if (context) {
      prompt += "\n\n# User's Personal Context\nUse this to tailor your responses and provide personalized insights:";
      if (context.goals?.length) {
        prompt += `\n- **User's Goals:**`;
        context.goals.forEach((goal: Goal) => {
          prompt += `\n  - ${goal.text} [${goal.completed ? 'Completed' : 'Active'}]`;
        });
      }
      if (context.interests?.length) prompt += `\n- **User's Interests:** ${context.interests.join(', ')}`;
      if (context.background) prompt += `\n- **User's Background:** ${context.background}`;
      if (context.contacts?.length) prompt += `\n- **Key Contacts:** ${context.contacts.map((c: Contact) => c.name).join(', ')}`;
      if (context.events?.length) prompt += `\n- **Important Events:** ${context.events.map((e: KismetEvent) => e.name).join(', ')}`;
      if (context.communities?.length) prompt += `\n- **Communities/Groups:** ${context.communities.map((c: Community) => c.name).join(', ')}`;
      if (context.organizations?.length) prompt += `\n- **Organizations:** ${context.organizations.map((o: Organization) => o.name).join(', ')}`;
      if (context.skills?.length) prompt += `\n- **Skills:** ${context.skills.map((s: Skill) => s.name).join(', ')}`;
      if (context.projects?.length) prompt += `\n- **Projects:** ${context.projects.map((p: Project) => p.name).join(', ')}`;
      if (context.knowledge?.length) {
        prompt += `\n- **Knowledge Base:** ${context.knowledge.map((k: KnowledgeItem) => `${k.name}${k.url ? ` (${k.url})` : ''}`).join(', ')}`;
      }
      if (context.relationships?.length) {
        prompt += `\n- **Defined Connections:**`;
        const allItems: { id: string; name: string; type: string; }[] = [
          ...(context.goals?.map((g) => ({ id: g.id, name: g.text, type: 'goal' })) || []),
          ...(context.interests?.map((interest, idx) => ({ id: `interest-${idx}`, name: interest, type: 'interest' })) || []),
          ...(context.contacts?.map((c) => ({ id: c.id, name: c.name, type: 'contact' })) || []),
          ...(context.events?.map((e) => ({ id: e.id, name: e.name, type: 'event' })) || []),
          ...(context.communities?.map((c) => ({ id: c.id, name: c.name, type: 'community' })) || []),
          ...(context.organizations?.map((o) => ({ id: o.id, name: o.name, type: 'organization' })) || []),
          ...(context.skills?.map((s) => ({ id: s.id, name: s.name, type: 'skill' })) || []),
          ...(context.projects?.map((p) => ({ id: p.id, name: p.name, type: 'project' })) || []),
          ...(context.knowledge?.map((k) => ({ id: k.id, name: k.name, type: 'knowledge' })) || []),
          ...(context.communityResources?.map((r) => ({ id: r.id, name: r.title, type: 'communityResource' })) || [])
        ];
        context.relationships.forEach((rel: Relationship) => {
          const source = allItems.find((i) => i.id === rel.sourceId);
          const target = allItems.find((i) => i.id === rel.targetId);
          if (source && target) {
            prompt += `\n  - '${source.name}' is linked to '${target.name}'.`;
          }
        });
      }
      prompt += "\n\n# Community Intelligence\nLeverage this shared knowledge from the user's community to provide broader, more connected advice.";
      if (context.communityResources?.length) {
        prompt += `\n- **Shared Community Resources:**\n` + context.communityResources.map((r) => `  - [${r.type}] ${r.title}: ${r.description}`).join('\n');
      }
      if (context.anonymizedInsights?.length) {
        prompt += `\n- **Anonymized Community Insights:**\n` + context.anonymizedInsights.map((i) => `  - ${i.text}`).join('\n');
      }
      prompt += "\n\nKeep all this context in mind to offer suggestions, connections, and ideas that are highly relevant to the user and their community. Connect the user's personal goals to the community resources and insights where possible.";
    } else {
      prompt += "\n\nTo provide the best consultation, you can start by asking the user about their goals, interests, or background. Encourage them to share information so you can offer more personalized and predictive insights.";
    }
    if (proactiveMode) {
      prompt += "\n\n**Proactive Mode is ON:** You must actively analyze the user's full context. Periodically, without being asked, offer relevant suggestions, connections, or ideas that could help them achieve their goals. **Crucially, if a user's goal or interest aligns with a Shared Community Resource or Anonymized Insight, you should proactively mention it.** For example, if a user is interested in startups and there is a 'Pitch Deck Analyzer' tool, you should suggest it. Introduce these insights naturally into the conversation.";
    }
    return prompt;
  }
  private buildConversationMessages(userMessage: string, history: Message[], context?: UserProfileContext, proactiveMode?: boolean) {
    const systemPrompt = this.buildSystemPrompt(context, proactiveMode);
    return [
      {
        role: 'system' as const,
        content: systemPrompt
      },
      ...history.slice(-5).map((m) => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user' as const, content: userMessage }
    ];
  }
  updateModel(newModel: string): void {
    this.model = newModel;
  }
  async generateTitle(conversationHistory: Message[]): Promise<string> {
    if (conversationHistory.length === 0) {
      return "New Consultation";
    }
    const summarizationPrompt = "You are an expert summarizer. Based on the following conversation, generate a concise and descriptive title of 5 words or less. The title should capture the main topic or question. Do not add any prefix like 'Title:' or use quotation marks.";
    const messagesForSummary = conversationHistory.slice(0, 4).map((m) => ({
      role: m.role,
      content: m.content
    }));
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: summarizationPrompt },
          ...messagesForSummary
        ],
        max_tokens: 20,
        temperature: 0.2
      });
      let title = completion.choices[0]?.message?.content?.trim() || "Consultation Summary";
      title = title.replace(/^"|"$/g, '');
      return title;
    } catch (error) {
      console.error("Failed to generate title:", error);
      return "Consultation";
    }
  }
  async generateEcosystemInsights(): Promise<EcosystemInsight[]> {
    const insightPrompt = `
      Provide 2-3 generic professional growth suggestions.
      Respond ONLY with a JSON object matching this structure: { "insights": [{ "icon": "string", "title": "string", "description": "string" }] }.
      The "icon" value must be one of: "connections", "learning", "opportunities".
    `;
    try {
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: insightPrompt }],
        max_tokens: 1024,
        temperature: 0.8
      });
      let responseContent = completion.choices[0]?.message?.content;
      if (!responseContent) {
        return [];
      }
      const markdownMatch = responseContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      let potentialJson = markdownMatch ? markdownMatch[1] : responseContent;
      const startIndex = potentialJson.indexOf('{');
      const endIndex = potentialJson.lastIndexOf('}');
      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        throw new Error("Invalid JSON response from AI: No valid object found.");
      }
      let jsonString = potentialJson.substring(startIndex, endIndex + 1);
      const sanitizedJsonString = sanitizeJsonString(jsonString);
      try {
        const parsedJson = JSON.parse(sanitizedJsonString);
        if (parsedJson && Array.isArray(parsedJson.insights)) {
          return parsedJson.insights as EcosystemInsight[];
        }
        return [];
      } catch (parseError) {
        throw new Error("Failed to parse JSON from AI response.");
      }
    } catch (error) {
      console.error("Failed to generate ecosystem insights:", error);
      throw error;
    }
  }
  async generateTakeaways(conversationHistory: Message[], context: UserProfileContext): Promise<ChatTakeaway[]> {
    if (conversationHistory.length < 3) {
      return [];
    }
    let takeawayPrompt = `
      TASK: Analyze the conversation and extract key takeaways.
      CONTEXT: The user has the following items in their ecosystem:
      - Existing Contacts: ${context.contacts?.map((c) => c.name).join(', ') || 'None'}
      - Existing Events: ${context.events?.map((e) => e.name).join(', ') || 'None'}
      - Existing Communities: ${context.communities?.map((c) => c.name).join(', ') || 'None'}
      INSTRUCTIONS:
      1. Review the last 6 messages of the conversation provided below.
      2. Identify up to 2 important, actionable takeaways that are **NEW** and **NOT** in the existing context lists.
      3. A takeaway can be a new 'contact', 'event', 'goal', or 'community'.
      4. **CRITICAL:** Do not duplicate names. If "Lancie" is mentioned, the value must be "Lancie", not "LancieLancie".
      5. If no new takeaways are found, return an empty array.
      6. **RESPONSE FORMAT:** Respond ONLY with a single, valid JSON object. Do not include any other text, greetings, or explanations. The object must have a key "takeaways" containing an array of objects.
      JSON STRUCTURE:
      {
        "takeaways": [
          {
            "type": "contact" | "event" | "goal" | "community",
            "value": "string",
            "description": "string"
          }
        ]
      }
    `;
    const messagesForSummary = conversationHistory.slice(-6).map((m) => ({
      role: m.role,
      content: m.content
    }));
    let completion: OpenAI.Chat.Completions.ChatCompletion | undefined;
    try {
      completion = await this.client.chat.completions.create({
        model: this.model,
        messages: [{ role: 'system', content: takeawayPrompt }, ...messagesForSummary],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      let responseContent = completion.choices[0]?.message?.content?.trim();
      if (!responseContent) {
        return [];
      }
      let jsonString = responseContent;
      const startIndex = jsonString.indexOf('{');
      const endIndex = jsonString.lastIndexOf('}');
      if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        return [];
      }
      jsonString = jsonString.substring(startIndex, endIndex + 1);
      const sanitizedJsonString = sanitizeJsonString(jsonString);
      const parsed = JSON.parse(sanitizedJsonString);
      const takeaways: ChatTakeaway[] = parsed?.takeaways && Array.isArray(parsed.takeaways) ? parsed.takeaways : [];
      const sanitizedTakeaways = takeaways.map((takeaway) => {
        const { value } = takeaway;
        if (typeof value === 'string' && value.length > 0 && value.length % 2 === 0) {
          const half = value.length / 2;
          const firstHalf = value.substring(0, half);
          const secondHalf = value.substring(half);
          if (firstHalf === secondHalf) {
            return { ...takeaway, value: firstHalf };
          }
        }
        return takeaway;
      });
      return sanitizedTakeaways;
    } catch (error) {
      console.error("Failed to generate takeaways:", error, { response: completion?.choices[0]?.message?.content });
      return [];
    }
  }
}