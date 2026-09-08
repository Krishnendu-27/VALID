import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id?: string;
  _id?: string;
  officerId?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  avatarUrl?: string;
  avatar?: string;
}


interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    {
      name: "valid-auth",
    }
  )
);
