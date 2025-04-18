// stores/authStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user_id: null,
      isAuthenticated: false,
      login: (id) => set({ user_id: id, isAuthenticated: true }),
      logout: () => set({ user_id: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
);

export default useAuthStore;
