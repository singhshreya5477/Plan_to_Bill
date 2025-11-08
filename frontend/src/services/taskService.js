import api from './api';

const taskService = {
  // Get all tasks for a project
  async getProjectTasks(projectId) {
    try {
      const response = await api.get(`/tasks/project/${projectId}`);
      return response;
    } catch (error) {
      console.error('Get project tasks error:', error);
      throw error;
    }
  },

  // Get tasks assigned to current user
  async getMyTasks(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority) params.append('priority', filters.priority);
      
      const response = await api.get(`/tasks/my-tasks?${params.toString()}`);
      return response;
    } catch (error) {
      console.error('Get my tasks error:', error);
      throw error;
    }
  },

  // Get single task by ID
  async getTaskById(taskId) {
    try {
      const response = await api.get(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error('Get task by ID error:', error);
      throw error;
    }
  },

  // Create new task
  async createTask(taskData) {
    try {
      const response = await api.post('/tasks', taskData);
      return response;
    } catch (error) {
      console.error('Create task error:', error);
      throw error;
    }
  },

  // Update task
  async updateTask(taskId, taskData) {
    try {
      const response = await api.put(`/tasks/${taskId}`, taskData);
      return response;
    } catch (error) {
      console.error('Update task error:', error);
      throw error;
    }
  },

  // Delete task
  async deleteTask(taskId) {
    try {
      const response = await api.delete(`/tasks/${taskId}`);
      return response;
    } catch (error) {
      console.error('Delete task error:', error);
      throw error;
    }
  },

  // Add comment to task
  async addComment(taskId, comment) {
    try {
      const response = await api.post(`/tasks/${taskId}/comments`, { comment });
      return response;
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  }
};

export default taskService;
