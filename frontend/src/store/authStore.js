import { create } from 'zustand';

// Auth store for single-company system
export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  
  login: (userData, token) => set({ 
    user: userData, 
    token
  }),
  
  logout: () => set({ user: null, token: null }),
  
  updateUser: (userData) => set((state) => ({ 
    user: { ...state.user, ...userData }
  })),
}));
