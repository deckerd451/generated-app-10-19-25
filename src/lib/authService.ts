import { useEcosystemStore } from '@/stores/ecosystemStore';
import { toast } from 'sonner';
class AuthService {
  private async handleDisconnection(
    serviceName: 'Google Calendar' | 'LinkedIn',
    endpoint: string,
    disconnectAction: () => void
  ): Promise<{ success: boolean }> {
    try {
      const response = await fetch(endpoint, { method: 'POST' });
      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }
      const result = await response.json();
      if (result.success) {
        disconnectAction();
        toast.info(`Disconnected from ${serviceName}.`);
        return { success: true };
      } else {
        throw new Error(result.error || `Failed to disconnect from ${serviceName}.`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
      toast.error(`Disconnection from ${serviceName} failed.`, { description: errorMessage });
      return { success: false };
    }
  }
  public disconnectGoogleCalendar(): Promise<{ success: boolean }> {
    const { disconnectGoogleCalendar } = useEcosystemStore.getState();
    return this.handleDisconnection('Google Calendar', '/api/auth/google/disconnect', disconnectGoogleCalendar);
  }
  public disconnectLinkedIn(): Promise<{ success: boolean }> {
    const { disconnectLinkedIn } = useEcosystemStore.getState();
    return this.handleDisconnection('LinkedIn', '/api/auth/linkedin/disconnect', disconnectLinkedIn);
  }
}
export const authService = new AuthService();