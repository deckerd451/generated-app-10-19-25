import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Goal } from '@/types/ecosystem';
interface UserProfileState {
  goals: Goal[];
  interests: string[];
  background: string;
  setGoals: (goals: Goal[]) => void;
  setInterests: (interests: string[]) => void;
  setBackground: (background: string) => void;
  addGoal: (text: string) => void;
  removeGoal: (id: string) => void;
  toggleGoalCompletion: (id: string) => void;
  importProfile: (data: { goals?: string; interests?: string[]; background?: string }) => void;
  clear: () => void;
}
const initialState = {
  goals: [],
  interests: [],
  background: '',
};
export const useUserProfileStore = create<UserProfileState>()(
  persist(
    (set) => ({
      ...initialState,
      setGoals: (goals) => set({ goals }),
      setInterests: (interests) => set({ interests }),
      setBackground: (background) => set({ background }),
      addGoal: (text) => set((state) => ({
        goals: [...state.goals, { id: uuidv4(), text, completed: false }],
      })),
      removeGoal: (id) => set((state) => ({
        goals: state.goals.filter((goal) => goal.id !== id),
      })),
      toggleGoalCompletion: (id) => set((state) => ({
        goals: state.goals.map((goal) =>
          goal.id === id ? { ...goal, completed: !goal.completed } : goal
        ),
      })),
      importProfile: (data) => set((state) => {
        const newInterests = [...new Set([...state.interests, ...(data.interests || [])])];
        const importedGoalsText = data.goals || '';
        const existingGoalsText = state.goals.map(g => g.text).join('\n');
        const combinedGoalsText = [existingGoalsText, importedGoalsText].filter(Boolean).join('\n\n---\n\n');
        const newGoals: Goal[] = combinedGoalsText.split('\n').filter(Boolean).map(text => ({ id: uuidv4(), text, completed: false }));
        const newBackground = [state.background, data.background].filter(Boolean).join('\n\n---\n\n');
        return {
          goals: newGoals,
          interests: newInterests,
          background: newBackground,
        };
      }),
      clear: () => set(initialState),
    }),
    {
      name: 'cynq-user-profile-storage',
      version: 2, // Increment version for migration
      migrate: (persistedState: any, version) => {
        // Migration from v0 (string interests) to v1
        if (version < 1 && typeof persistedState.interests === 'string') {
          persistedState.interests = persistedState.interests.split(/[,;\n]/).map((i: string) => i.trim()).filter(Boolean);
        }
        // Migration from v1 (string goals) to v2
        if (version < 2 && typeof persistedState.goals === 'string') {
          persistedState.goals = persistedState.goals.split('\n').filter((g: string) => g.trim() !== '').map((text: string) => ({
            id: uuidv4(),
            text: text.trim(),
            completed: false,
          }));
        }
        return persistedState as UserProfileState;
      },
    }
  )
);