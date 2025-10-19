import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { FullScreenLoader } from '@/components/ui/FullScreenLoader';
interface ProtectedRouteProps {
  children: React.ReactNode;
}
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isHydrated, setIsHydrated] = useState(false);
  const location = useLocation();
  useEffect(() => {
    // Zustand's persist middleware hydrates asynchronously. We need to wait for it.
    // A common pattern is to check the store's `_hasHydrated` property.
    const unsub = useAuthStore.persist.onFinishHydration(() => {
      setIsHydrated(true);
    });
    // If already hydrated, set state immediately.
    if (useAuthStore.persist.hasHydrated()) {
      setIsHydrated(true);
    }
    return () => {
      unsub();
    };
  }, []);
  if (!isHydrated) {
    // Show a loader while we wait for the store to rehydrate from localStorage
    return <FullScreenLoader />;
  }
  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};