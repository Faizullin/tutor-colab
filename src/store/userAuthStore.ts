import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: {
    id: string;
    username?: string;
    email: string;
    profileImage?: string;
    isAdmin?: boolean;
    lastLogin: Date;
  } | null;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) =>
        set({
          user: user ? { ...user, lastLogin: new Date(user.lastLogin) } : null // ✅ Convert lastLogin to Date
        }),
      logout: () => set({ user: null }) // ✅ Removed localStorage.removeItem()
    }),
    { name: "auth-storage" }
  )
);

export default useAuthStore;
