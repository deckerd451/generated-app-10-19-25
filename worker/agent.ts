import { Agent } from 'agents';
import type { Env } from './core-utils';
import { getAppController } from './core-utils';
import type { ChatState, UserProfileContext, ChatTakeaway } from './types';
import { ChatHandler } from './chat';
import { API_RESPONSES } from './config';
import { createMessage, createStreamResponse, createEncoder } from './utils';
/**
 * ChatAgent - Main agent class using Cloudflare Agents SDK
 *
 * This class extends the Agents SDK Agent class and handles all chat operations.
 */
export class ChatAgent extends Agent<Env, ChatState> {
  private chatHandler?: ChatHandler;
  // Initial state for new chat sessions
  initialState: ChatState = {
    messages: [],
    sessionId: crypto.randomUUID(),
    isProcessing: false,
    model: 'google-ai-studio/gemini-2.5-flash'
  };
  /**
   * Initialize chat handler when agent starts
   */
  async onStart(): Promise<void> {
    this.chatHandler = new ChatHandler(
      this.env.CF_AI_BASE_URL ,
      this.env.CF_AI_API_KEY,
      this.state.model
    );
    console.log(`ChatAgent ${this.name} initialized with session ${this.state.sessionId}`);
  }
  /**
   * Handle incoming requests - clean routing with error handling
   */
  async onRequest(request: Request): Promise<Response> {
    try {
      const url = new URL(request.url);
      const method = request.method;
      // Route to appropriate handler
      if (method === 'GET' && url.pathname === '/messages') {
        return this.handleGetMessages();
      }
      if (method === 'POST' && url.pathname === '/chat') {
        return this.handleChatMessage(await request.json());
      }
      if (method === 'DELETE' && url.pathname === '/clear') {
        return this.handleClearMessages();
      }
      if (method === 'POST' && url.pathname === '/model') {
        return this.handleModelUpdate(await request.json());
      }
      if (method === 'POST' && url.pathname === '/summarize') {
        return this.handleSummarizeSession();
      }
      if (method === 'POST' && url.pathname === '/ecosystem-insights') {
        return this.handleEcosystemInsights(await request.json());
      }
      if (method === 'POST' && url.pathname === '/takeaways') {
        return this.handleGetTakeaways(await request.json());
      }
      return Response.json({
        success: false,
        error: API_RESPONSES.NOT_FOUND
      }, { status: 404 });
    } catch (error) {
      console.error(`[ChatAgent: ${this.name}] Request handling error:`, error);
      return Response.json({
        success: false,
        error: API_RESPONSES.INTERNAL_ERROR
      }, { status: 500 });
    }
  }
  /**
   * Get current conversation messages
   */
  private handleGetMessages(): Response {
    return Response.json({
      success: true,
      data: this.state
    });
  }
  /**
   * Process new chat message
   */
  private async handleChatMessage(body: { message: string; model?: string; stream?: boolean; context?: UserProfileContext; proactiveMode?: boolean }): Promise<Response> {
    const { message, model, stream, context, proactiveMode } = body;
    // Validate input
    if (!message?.trim()) {
      return Response.json({
        success: false,
        error: API_RESPONSES.MISSING_MESSAGE
      }, { status: 400 });
    }
    // Update model if provided
    if (model && model !== this.state.model) {
      this.setState({ ...this.state, model });
      this.chatHandler?.updateModel(model);
    }
    // Fetch community data to enrich the context
    const controller = getAppController(this.env);
    const [communityResources, anonymizedInsights] = await Promise.all([
        controller.listCommunityResources(),
        controller.listAnonymizedInsights()
    ]);
    const enrichedContext: UserProfileContext = {
        ...context,
        communityResources,
        anonymizedInsights,
    };
    const userMessage = createMessage('user', message.trim());
    this.setState({
      ...this.state,
      messages: [...this.state.messages, userMessage],
      isProcessing: true
    });
    try {
      // Process message through chat handler
      if (!this.chatHandler) {
        throw new Error('Chat handler not initialized');
      }
      if (stream) {
        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const encoder = createEncoder();
        // Start processing in background
        (async () => {
          try {
            this.setState({ ...this.state, streamingMessage: '' });
            const response = await this.chatHandler!.processMessage(
              message,
              this.state.messages,
              enrichedContext,
              proactiveMode,
              (chunk: string) => {
                try {
                  this.setState({
                    ...this.state,
                    streamingMessage: (this.state.streamingMessage || '') + chunk
                  });
                  writer.write(encoder.encode(chunk));
                } catch (writeError) {
                  console.error(`[ChatAgent: ${this.name}] Write error:`, writeError);
                }
              }
            );
            const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
            // Update state with final response
            this.setState({
              ...this.state,
              messages: [...this.state.messages, assistantMessage],
              isProcessing: false,
              streamingMessage: ''
            });
          } catch (error) {
            console.error(`[ChatAgent: ${this.name}] Streaming error:`, error);
            // Write error to stream
            try {
              const errorMessage = 'Sorry, I encountered an error processing your request.';
              writer.write(encoder.encode(errorMessage));
              const errorMsg = createMessage('assistant', errorMessage);
              this.setState({
                ...this.state,
                messages: [...this.state.messages, errorMsg],
                isProcessing: false,
                streamingMessage: ''
              });
            } catch (writeError) {
              console.error(`[ChatAgent: ${this.name}] Error writing error message:`, writeError);
            }
          } finally {
            try {
              writer.close();
            } catch (closeError) {
              console.error(`[ChatAgent: ${this.name}] Error closing writer:`, closeError);
            }
          }
        })();
        return createStreamResponse(readable);
      }
      // Non-streaming response
      const response = await this.chatHandler.processMessage(
        message,
        this.state.messages,
        enrichedContext,
        proactiveMode
      );
      const assistantMessage = createMessage('assistant', response.content, response.toolCalls);
      // Update state with response
      this.setState({
        ...this.state,
        messages: [...this.state.messages, assistantMessage],
        isProcessing: false
      });
      return Response.json({
        success: true,
        data: this.state
      });
    } catch (error) {
      console.error(`[ChatAgent: ${this.name}] Chat processing error:`, error);
      this.setState({ ...this.state, isProcessing: false });
      return Response.json({
        success: false,
        error: API_RESPONSES.PROCESSING_ERROR
      }, { status: 500 });
    }
  }
  /**
   * Clear conversation history
   */
  private handleClearMessages(): Response {
    this.setState({
      ...this.state,
      messages: []
    });
    return Response.json({
      success: true,
      data: this.state
    });
  }
  /**
   * Update selected AI model
   */
  private handleModelUpdate(body: { model: string }): Response {
    const { model } = body;
    this.setState({ ...this.state, model });
    this.chatHandler?.updateModel(model);
    return Response.json({
      success: true,
      data: this.state
    });
  }
  /**
   * Generate and save a summary title for the session
   */
  private async handleSummarizeSession(): Promise<Response> {
    if (!this.chatHandler) {
      return Response.json({ success: false, error: 'Chat handler not initialized' }, { status: 500 });
    }
    try {
      const title = await this.chatHandler.generateTitle(this.state.messages);
      const controller = getAppController(this.env);
      await controller.updateSessionTitle(this.name, title);
      return Response.json({ success: true, data: { title } });
    } catch (error) {
      console.error(`[ChatAgent: ${this.name}] Failed to summarize session:`, error);
      return Response.json({ success: false, error: 'Failed to generate title' }, { status: 500 });
    }
  }
  /**
   * Generate and return ecosystem insights
   */
  private async handleEcosystemInsights(body: { context?: UserProfileContext }): Promise<Response> {
    if (!this.chatHandler) {
      return Response.json({ success: false, error: 'Chat handler not initialized' }, { status: 500 });
    }
    const { context } = body;
    if (!context) {
      return Response.json({ success: false, error: 'User context is required' }, { status: 400 });
    }
    try {
      const insights = await this.chatHandler.generateEcosystemInsights();
      return Response.json({ success: true, data: insights });
    } catch (error) {
      console.error(`[ChatAgent: ${this.name}] Failed to generate ecosystem insights:`, error);
      return Response.json({ success: false, error: 'Failed to generate insights' }, { status: 500 });
    }
  }
  /**
   * Generate and return conversation takeaways
   */
  private async handleGetTakeaways(body: { context?: UserProfileContext }): Promise<Response> {
    if (!this.chatHandler) {
      return Response.json({ success: false, error: 'Chat handler not initialized' }, { status: 500 });
    }
    const { context } = body;
    if (!context) {
      return Response.json({ success: false, error: 'User context is required' }, { status: 400 });
    }
    try {
      const controller = getAppController(this.env);
      const [communityResources, anonymizedInsights] = await Promise.all([
          controller.listCommunityResources(),
          controller.listAnonymizedInsights()
      ]);
      const enrichedContext: UserProfileContext = {
          ...context,
          communityResources,
          anonymizedInsights,
      };
      const takeaways = await this.chatHandler.generateTakeaways(this.state.messages, enrichedContext);
      return Response.json({ success: true, data: takeaways });
    } catch (error) {
      console.error(`[ChatAgent: ${this.name}] Failed to generate takeaways:`, error);
      return Response.json({ success: false, error: 'Failed to generate takeaways' }, { status: 500 });
    }
  }
}