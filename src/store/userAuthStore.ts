import { User } from "next-auth";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  user: User | null;
  setUser: (user: AuthState["user"]) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) =>
        set({
          user: user
            ? {
                ...user,
                lastLogin: user.lastLogin ? new Date(user.lastLogin) : null,
              }
            : null, // ✅ Convert lastLogin to Date
        }),
      logout: () => set({ user: null }), // ✅ Removed localStorage.removeItem()
    }),
    { name: "auth-storage" }
  )
);

export default useAuthStore;
