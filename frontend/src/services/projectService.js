import api from './api';

const projectService = {
  // Get all projects
  async getProjects() {
    try {
      const response = await api.get('/projects');
      // api.get already returns parsed JSON: { success: true, data: { projects: [...] } }
      return response;
    } catch (error) {
      console.error('Get projects error:', error);
      throw error;
    }
  },

  // Get single project by ID
  async getProjectById(projectId) {
    try {
      const response = await api.get(`/projects/${projectId}`);
      return response;
    } catch (error) {
      console.error('Get project by ID error:', error);
      throw error;
    }
  },

  // Create new project
  async createProject(projectData) {
    try {
      const response = await api.post('/projects', projectData);
      return response;
    } catch (error) {
      console.error('Create project error:', error);
      throw error;
    }
  },

  // Update project
  async updateProject(projectId, projectData) {
    try {
      const response = await api.put(`/projects/${projectId}`, projectData);
      return response;
    } catch (error) {
      console.error('Update project error:', error);
      throw error;
    }
  },

  // Delete project
  async deleteProject(projectId) {
    try {
      const response = await api.delete(`/projects/${projectId}`);
      return response;
    } catch (error) {
      console.error('Delete project error:', error);
      throw error;
    }
  },

  // Add team member to project
  async addTeamMember(projectId, memberData) {
    try {
      const response = await api.post(`/projects/${projectId}/members`, memberData);
      return response;
    } catch (error) {
      console.error('Add team member error:', error);
      throw error;
    }
  },

  // Remove team member from project
  async removeTeamMember(projectId, memberId) {
    try {
      const response = await api.delete(`/projects/${projectId}/members/${memberId}`);
      return response;
    } catch (error) {
      console.error('Remove team member error:', error);
      throw error;
    }
  }
};

export default projectService;
