import { DurableObject } from 'cloudflare:workers';
import type { SessionInfo, CommunityResource, AnonymizedInsight } from './types';
import type { Env } from './core-utils';
// ���� AI Extension Point: Add session management features
export class AppController extends DurableObject<Env> {
  private sessions = new Map<string, SessionInfo>();
  private communityResources = new Map<string, CommunityResource>();
  private anonymizedInsights = new Map<string, AnonymizedInsight>();
  private loaded = false;
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
  }
  private async ensureLoaded(): Promise<void> {
    if (!this.loaded) {
      const stored = await this.ctx.storage.list<any>();
      const storedSessions = stored.get('sessions') || {};
      this.sessions = new Map(Object.entries(storedSessions));
      const storedResources = stored.get('communityResources') || {};
      this.communityResources = new Map(Object.entries(storedResources));
      const storedInsights = stored.get('anonymizedInsights') || {};
      this.anonymizedInsights = new Map(Object.entries(storedInsights));
      if (this.communityResources.size === 0) {
        this.seedCommunityData();
        await this.persist();
      }
      this.loaded = true;
    }
  }
  private seedCommunityData(): void {
    const mockResources: CommunityResource[] = [
      { id: 'res-1', type: 'article', title: 'Networking Tips for AI Founders', description: 'A guide on how to effectively network in the AI startup scene.', tags: ['networking', 'ai', 'startup'] },
      { id: 'res-2', type: 'tool', title: 'Pitch Deck Analyzer', description: 'An AI-powered tool to review and give feedback on your startup pitch deck.', tags: ['tool', 'startup', 'funding'] },
      { id: 'res-3', type: 'contact', title: 'Dr. Evelyn Reed, AI Ethicist', description: 'A leading expert in AI ethics, available for consultations.', tags: ['contact', 'ai', 'ethics'] },
    ];
    mockResources.forEach(res => this.communityResources.set(res.id, res));
    const mockInsights: AnonymizedInsight[] = [
      { id: 'ins-1', text: 'Many users interested in "generative AI" are also exploring "venture capital".', relevance_score: 0.85 },
      { id: 'ins-2', text: 'A common goal among users is "finding a technical co-founder".', relevance_score: 0.92 },
      { id: 'ins-3', text: 'The "AI Tech Summit" event is frequently linked to networking goals.', relevance_score: 0.78 },
    ];
    mockInsights.forEach(ins => this.anonymizedInsights.set(ins.id, ins));
  }
  private async persist(): Promise<void> {
    await this.ctx.storage.put({
      sessions: Object.fromEntries(this.sessions),
      communityResources: Object.fromEntries(this.communityResources),
      anonymizedInsights: Object.fromEntries(this.anonymizedInsights),
    });
  }
  async addSession(sessionId: string, title?: string): Promise<void> {
    await this.ensureLoaded();
    const now = Date.now();
    this.sessions.set(sessionId, {
      id: sessionId,
      title: title || `Chat ${new Date(now).toLocaleDateString()}`,
      createdAt: now,
      lastActive: now
    });
    await this.persist();
  }
  async removeSession(sessionId: string): Promise<boolean> {
    await this.ensureLoaded();
    const deleted = this.sessions.delete(sessionId);
    if (deleted) await this.persist();
    return deleted;
  }
  async updateSessionActivity(sessionId: string): Promise<void> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActive = Date.now();
      await this.persist();
    }
  }
  async updateSessionTitle(sessionId: string, title: string): Promise<boolean> {
    await this.ensureLoaded();
    const session = this.sessions.get(sessionId);
    if (session) {
      session.title = title;
      await this.persist();
      return true;
    }
    return false;
  }
  async listSessions(): Promise<SessionInfo[]> {
    await this.ensureLoaded();
    return Array.from(this.sessions.values()).sort((a, b) => b.lastActive - a.lastActive);
  }
  async getSessionCount(): Promise<number> {
    await this.ensureLoaded();
    return this.sessions.size;
  }
  async getSession(sessionId: string): Promise<SessionInfo | null> {
    await this.ensureLoaded();
    return this.sessions.get(sessionId) || null;
  }
  async clearAllSessions(): Promise<number> {
    await this.ensureLoaded();
    const count = this.sessions.size;
    this.sessions.clear();
    await this.persist();
    return count;
  }
  // --- Community Data Methods ---
  async listCommunityResources(): Promise<CommunityResource[]> {
    await this.ensureLoaded();
    return Array.from(this.communityResources.values());
  }
  async listAnonymizedInsights(): Promise<AnonymizedInsight[]> {
    await this.ensureLoaded();
    return Array.from(this.anonymizedInsights.values());
  }
  async addAnonymizedInsight(text: string): Promise<AnonymizedInsight> {
    await this.ensureLoaded();
    const newInsight: AnonymizedInsight = {
      id: crypto.randomUUID(),
      text,
    };
    this.anonymizedInsights.set(newInsight.id, newInsight);
    await this.persist();
    return newInsight;
  }
}