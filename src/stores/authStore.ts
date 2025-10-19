import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useUserProfileStore } from './userProfileStore';
import { useEcosystemStore } from './ecosystemStore';
interface AuthState {
  isAuthenticated: boolean;
  showOnboarding: boolean;
  login: (options?: { isNew?: boolean }) => void;
  logout: () => void;
  completeOnboarding: () => void;
}
const initialState = {
  isAuthenticated: false,
  showOnboarding: false,
};
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      ...initialState,
      login: (options) => {
        set({
          isAuthenticated: true,
          showOnboarding: options?.isNew || false
        });
      },
      logout: () => {
        // Clear all user-related data from other stores
        useUserProfileStore.getState().clear();
        useEcosystemStore.getState().clear();
        // Reset auth state
        set(initialState);
        // Forcing a reload to ensure all state is cleared and user is redirected.
        window.location.href = '/login';
      },
      completeOnboarding: () => set({ showOnboarding: false }),
    }),
    {
      name: 'cynq-auth-storage',
    }
  )
);