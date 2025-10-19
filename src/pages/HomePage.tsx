import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function HomePage() {
  const navigate = useNavigate();
  useEffect(() => {
    // The AppLayout now handles redirecting to an active session.
    // This component's only job is to redirect to the base chat page
    // where a welcome screen is shown if no session is active.
    navigate('/chat', { replace: true });
  }, [navigate]);
  // Render a loading state or null while redirecting
  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-muted-foreground animate-pulse">Loading Kismet...</p>
    </div>
  );
}