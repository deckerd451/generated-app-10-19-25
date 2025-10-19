import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { chatService } from '@/lib/chat';
import type { SessionInfo } from '../../../worker/types';
import { Toaster, toast } from '@/components/ui/sonner';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
import { ErrorDisplay } from '@/components/ui/ErrorDisplay';
import { useAuthStore } from '@/stores/authStore';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
export function AppLayout() {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { showOnboarding, completeOnboarding } = useAuthStore();
  const loadSessions = useCallback(async (selectLatest = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await chatService.listSessions();
      if (response.success && response.data) {
        setSessions(response.data);
        if (selectLatest && response.data.length > 0) {
          const latestSessionId = response.data[0].id;
          setActiveSessionId(latestSessionId);
          navigate(`/chat/${latestSessionId}`);
        } else if (!activeSessionId && response.data.length > 0) {
          const mostRecentSessionId = response.data[0].id;
          setActiveSessionId(mostRecentSessionId);
          if (window.location.pathname === '/') {
            navigate(`/chat/${mostRecentSessionId}`, { replace: true });
          }
        }
      } else {
        throw new Error(response.error || "Failed to load past consultations.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast.error("Failed to load session data.", { description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  }, [navigate, activeSessionId]);
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);
  const handleNewConsultation = async () => {
    const response = await chatService.createSession();
    if (response.success && response.data) {
      await loadSessions(true);
    } else {
      toast.error("Failed to start a new consultation.");
    }
  };
  const handleSwitchSession = (sessionId: string) => {
    setActiveSessionId(sessionId);
    navigate(`/chat/${sessionId}`);
  };
  const activeSession = sessions.find(s => s.id === activeSessionId);
  if (isLoading) {
    return <FullScreenLoader />;
  }
  if (error) {
    return (
      <ErrorDisplay
        title="Failed to Load Application"
        message={error}
        onRetry={() => loadSessions()}
      />
    );
  }
  return (
    <div className="h-screen w-screen bg-muted/30 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <main className="flex w-full h-full max-w-7xl mx-auto bg-card shadow-2xl shadow-primary/10 rounded-2xl">
        <Sidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onNewConsultation={handleNewConsultation}
          onSwitchSession={handleSwitchSession}
        />
        <Outlet context={{ activeSessionId, setActiveSessionId, activeSession, loadSessions }} />
      </main>
      <Toaster richColors />
      <OnboardingModal isOpen={showOnboarding} onClose={completeOnboarding} />
    </div>
  );
}