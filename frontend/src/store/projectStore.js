import { create } from 'zustand';

export const useProjectStore = create((set) => ({
  projects: [],
  currentProject: null,
  filters: {
    status: 'all',
    search: '',
  },
  
  setProjects: (projects) => set({ projects }),
  
  setCurrentProject: (project) => set({ currentProject: project }),
  
  addProject: (project) => set((state) => ({
    projects: [...state.projects, project]
  })),
  
  updateProject: (id, updates) => set((state) => ({
    projects: state.projects.map(p => 
      p.id === id ? { ...p, ...updates } : p
    )
  })),
  
  deleteProject: (id) => set((state) => ({
    projects: state.projects.filter(p => p.id !== id)
  })),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
}));
