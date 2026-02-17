import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  userName: string | null;
  role: "admin" | "employee" | null;
  region: "India" | "UK" | null;

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
      userName: null,
      role: null,
      region: null,

      setUser: ({ userName, role, region }) => {
        set({
          userName,
          role,
          region: region ?? null,
        });
      },

      clearAuth: () => {
        set({ userName: null, role: null, region: null });
      },
    }),
    {
      name: "ai4planning-auth",
    }
  )
);
