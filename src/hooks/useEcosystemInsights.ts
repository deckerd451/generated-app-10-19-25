import { useState, useEffect } from 'react';
import { chatService } from '@/lib/chat';
import type { EcosystemInsight, UserProfileContext } from '../../worker/types';
export const useEcosystemInsights = (userContext: UserProfileContext) => {
  const [insights, setInsights] = useState<EcosystemInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Memoize the context to prevent unnecessary refetches if the object reference changes but values are the same.
  const contextKey = JSON.stringify(userContext);
  useEffect(() => {
    const fetchInsights = async () => {
      // Only fetch if there's meaningful data in the context.
      if (Object.values(userContext).every((val) => (Array.isArray(val) ? val.length === 0 : !val))) {
        setIsLoading(false);
        setInsights([]);
        setError(null);
        return;
      }
      setIsLoading(true);
      setError(null);
      try {
        const response = await chatService.getEcosystemInsights(userContext);
        if (response.success && response.data) {
          setInsights(response.data);
        } else {
          setError(response.error || "Could not fetch AI insights.");
          setInsights([]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
        setInsights([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInsights();
  }, [contextKey, userContext]); // Dependency is the stringified context and the context object itself
  return { insights, isLoading, error };
};