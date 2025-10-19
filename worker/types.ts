export interface ApiResponse<T = unknown> { success: boolean; data?: T; error?: string; }
export interface WeatherResult {
  location: string;
  temperature: number;
  condition: string;
  humidity: number;
}
export interface MCPResult {
  content: string;
}
export interface ErrorResult {
  error: string;
}
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  id: string;
  toolCalls?: ToolCall[];
}
export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
}
export interface ChatState {
  messages: Message[];
  sessionId: string;
  isProcessing: boolean;
  model: string;
  streamingMessage?: string;
  proactiveMode?: boolean;
}
export interface SessionInfo {
  id:string;
  title: string;
  createdAt: number;
  lastActive: number;
}
export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, unknown>;
    required: string[];
  };
}
// --- Simple Local Data Models ---
export interface Goal {
  id: string;
  text: string;
  completed: boolean;
}
export interface Contact {
  id: string;
  name: string;
  email?: string;
}
export interface KismetEvent {
  id: string;
  name: string;
}
export interface Community {
  id: string;
  name: string;
}
export interface Organization {
  id: string;
  name: string;
}
export interface Skill {
  id: string;
  name: string;
}
export interface Project {
  id: string;
  name: string;
}
export interface KnowledgeItem {
  id: string;
  name: string;
  url?: string;
}
export interface Relationship {
  id: string;
  sourceId: string;
  sourceType: string;
  targetId: string;
  targetType: string;
}
// --- Context & Insight Types ---
export interface UserProfileContext {
  goals?: Goal[];
  interests?: string[];
  background?: string;
  contacts?: Contact[];
  events?: KismetEvent[];
  communities?: Community[];
  organizations?: Organization[];
  skills?: Skill[];
  projects?: Project[];
  knowledge?: KnowledgeItem[];
  relationships?: Relationship[];
  communityResources?: CommunityResource[];
  anonymizedInsights?: AnonymizedInsight[];
}
export interface CommunityResource {
  id: string;
  type: 'article' | 'tool' | 'contact';
  title: string;
  description: string;
  tags: string[];
}
export interface AnonymizedInsight {
  id: string;
  text: string;
  relevance_score?: number;
}
export interface EcosystemInsight {
  icon: string;
  title: string;
  description: string;
  actionableType?: 'contact' | 'event' | 'community' | 'relationship' | 'communityResource' | 'learningPath';
  suggestedName?: string;
  suggestedRelationship?: Omit<Relationship, 'id'>;
  suggestedResourceId?: string;
  suggestedPath?: { title: string; steps: string[] };
}
export interface ChatTakeaway {
  type: 'contact' | 'event' | 'goal' | 'community';
  value: string;
  description: string;
}
// OAuth Types
export interface OAuthToken {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number; // in seconds
  scope: string;
}
// Data Sync Types
export interface GoogleCalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
  };
}
export interface LinkedInContact {
  id: string;
  name: string;
  headline: string;
}
export interface GitHubRepo {
  id: string;
  name: string;
  description: string;
}
export interface SlackChannel {
  id: string;
  name: string;
  topic: string;
}
export interface NotionPage {
  id: string;
  title: string;
  url: string;
}