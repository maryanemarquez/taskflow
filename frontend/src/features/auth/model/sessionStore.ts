import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CurrentUserResponse, SessionTokens } from './authTypes';

const SESSION_STORAGE_KEY = 'taskflow-session';

interface SessionState {
  tokens: SessionTokens | null;
  currentUser: CurrentUserResponse | null;
  setTokens: (tokens: SessionTokens) => void;
  setCurrentUser: (currentUser: CurrentUserResponse) => void;
  clear: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      tokens: null,
      currentUser: null,
      setTokens: (tokens) => set({ tokens }),
      setCurrentUser: (currentUser) => set({ currentUser }),
      clear: () => set({ tokens: null, currentUser: null }),
    }),
    {
      name: SESSION_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
