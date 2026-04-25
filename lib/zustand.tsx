import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  token: string | null;
  userId: string | null;
  userName: string | null;
  role: "admin" | "employee" | null;
  region: "India" | "UK" | null;

  setToken: (token: string | null) => void;
  setUserId: (userId: string | null) => void;
  setUser: (payload: {
    userName: string;
    role: "admin" | "employee";
    region?: "India" | "UK";
  }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      userId: null,
      userName: null,
      role: null,
      region: null,

      setToken: (token) => {
        set({ token });
      },

      setUserId: (userId) => {
        set({ userId });
      },

      setUser: ({ userName, role, region }) => {
        set({
          userName,
          role,
          region: region ?? null,
        });
      },

      clearAuth: () => {
        set({
          token: null,
          userId: null,
          userName: null,
          role: null,
          region: null,
        });
      },
    }),
    {
      name: "ai4planning-auth",
    }
  )
);
