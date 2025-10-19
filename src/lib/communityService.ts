import { toast } from 'sonner';
import type { CommunityResource, AnonymizedInsight } from '../../worker/types';
type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};
class CommunityService {
  private async fetchData<T>(endpoint: string, serviceName: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        throw new Error(result.error || `Failed to fetch ${serviceName}.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Failed to load ${serviceName}.`, { description: errorMessage });
      return { success: false, error: errorMessage };
    }
  }
  public getResources(): Promise<ApiResponse<CommunityResource[]>> {
    return this.fetchData('/api/community/resources', 'Community Resources');
  }
  public getInsights(): Promise<ApiResponse<AnonymizedInsight[]>> {
    return this.fetchData('/api/community/insights', 'Community Insights');
  }
  public async submitInsight(text: string): Promise<ApiResponse<{ id: string }>> {
    try {
      const response = await fetch('/api/community/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      return { success: false, error: errorMessage };
    }
  }
}
export const communityService = new CommunityService();