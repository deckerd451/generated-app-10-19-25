import { toast } from 'sonner';
import type { GoogleCalendarEvent, LinkedInContact, GitHubRepo, SlackChannel, NotionPage } from '../../worker/types';
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
class DataSyncService {
  private async handleSync<T>(serviceName: string, endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint, { method: 'POST' });
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || `Failed to sync ${serviceName} data.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Sync with ${serviceName} failed.`, { description: errorMessage });
      return { success: false, error: errorMessage };
    }
  }
  public syncGoogleData(): Promise<ApiResponse<GoogleCalendarEvent[]>> {
    return this.handleSync('Google Calendar', '/api/sync/google');
  }
  public syncLinkedInData(): Promise<ApiResponse<LinkedInContact[]>> {
    return this.handleSync('LinkedIn', '/api/sync/linkedin');
  }
  public syncGitHubData(): Promise<ApiResponse<GitHubRepo[]>> {
    return this.handleSync('GitHub', '/api/sync/github');
  }
  public syncSlackData(): Promise<ApiResponse<SlackChannel[]>> {
    return this.handleSync('Slack', '/api/sync/slack');
  }
  public syncNotionData(): Promise<ApiResponse<NotionPage[]>> {
    return this.handleSync('Notion', '/api/sync/notion');
  }
}
export const dataSyncService = new DataSyncService();