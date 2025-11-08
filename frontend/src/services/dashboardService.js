/**
 * Dashboard API Service
 */
import api from './api';

export const dashboardService = {
  /**
   * Get dashboard statistics
   * @returns {Promise<Object>} Dashboard stats data
   */
  getStats: async () => {
    return await api.get('/dashboard/stats');
  },

  /**
   * Get recent projects
   * @returns {Promise<Object>} Projects data
   */
  getProjects: async () => {
    return await api.get('/dashboard/projects');
  },

  /**
   * Get recent tasks
   * @returns {Promise<Object>} Tasks data
   */
  getTasks: async () => {
    return await api.get('/dashboard/tasks');
  },

  /**
   * Get team members
   * @returns {Promise<Object>} Team members data
   */
  getTeamMembers: async () => {
    return await api.get('/dashboard/team');
  },
};

export default dashboardService;
