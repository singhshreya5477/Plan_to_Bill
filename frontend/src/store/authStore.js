import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Get initial state from localStorage
const getInitialState = () => {
  try {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    return {
      user: savedUser ? JSON.parse(savedUser) : null,
      token: savedToken || null,
    };
  } catch (error) {
    console.error('Error loading auth state:', error);
    return { user: null, token: null };
  }
};

// Auth store with localStorage persistence
export const useAuthStore = create(
  persist(
    (set) => ({
      ...getInitialState(),
      
      login: (userData, token) => {
        // Save to localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token);
        
        // Update state
        set({ 
          user: userData, 
          token
        });
      },
      
      logout: () => {
        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('rememberedEmail');
        
        // Clear state
        set({ user: null, token: null });
      },
      
      updateUser: (userData) => set((state) => {
        const updatedUser = { ...state.user, ...userData };
        // Save updated user to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return { user: updatedUser };
      }),
    }),
    {
      name: 'auth-storage', // unique name for localStorage key
    }
  )
);
