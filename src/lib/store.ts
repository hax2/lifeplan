import { create } from 'zustand';
import { Project } from './types';

interface ProjectState {
  projects: Project[];
  getProjectById: (id: string) => Project | undefined;
  setProjects: (projects: Project[]) => void;
  updateProject: (updatedProject: Project) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  getProjectById: (id) => get().projects.find(p => p.id === id),
  setProjects: (projects) => set({ projects }),
  updateProject: (updatedProject) => {
    set((state) => ({
      projects: state.projects.map(p => 
        p.id === updatedProject.id ? updatedProject : p
      ),
    }));
  },
}));