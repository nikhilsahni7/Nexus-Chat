// src/store/authStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "@/../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      setUser: (user) => {
        console.log("Setting user:", user);
        set({ user });
      },

      setToken: (token) => {
        console.log("Setting token:", token);
        set({ token });
      },
      logout: () => {
        set({ user: null, token: null });
        // Clear the persisted state
        localStorage.removeItem("auth-storage");
      },
      isAuthenticated: () => {
        const state = get();
        return !!state.user && !!state.token;
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

// Typed selectors for easier usage
export const useUser = () => useAuthStore((state) => state.user);
export const useToken = () => useAuthStore((state) => state.token);
export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated());
export const useAuthLoading = () => useAuthStore((state) => state.isLoading);
