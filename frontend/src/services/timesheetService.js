import api from './api';

const timesheetService = {
    // Log time entry
    logTime: async (data) => {
        return await api.post('/time-tracking/log', data);
    },

    // Get time logs with filters
    getTimeLogs: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        return await api.get(`/time-tracking/logs?${params.toString()}`);
    },

    // Get time log by ID
    getTimeLogById: async (id) => {
        return await api.get(`/time-tracking/logs/${id}`);
    },

    // Update time log
    updateTimeLog: async (id, data) => {
        return await api.put(`/time-tracking/logs/${id}`, data);
    },

    // Delete time log
    deleteTimeLog: async (id) => {
        return await api.delete(`/time-tracking/logs/${id}`);
    },

    // Get timesheet report
    getTimesheet: async (filters = {}) => {
        const params = new URLSearchParams();
        Object.keys(filters).forEach(key => {
            if (filters[key]) params.append(key, filters[key]);
        });
        return await api.get(`/time-tracking/timesheet?${params.toString()}`);
    }
};

export default timesheetService;
