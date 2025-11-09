import { useState, useEffect } from 'react';
import { FiCalendar, FiClock, FiDollarSign, FiPlus, FiEdit2, FiTrash2, FiCheck, FiX, FiFilter } from 'react-icons/fi';
import timesheetService from '../services/timesheetService';
import projectService from '../services/projectService';
import { useAuthStore } from '../store/authStore';

const Timesheets = () => {
  const { user } = useAuthStore();
  const [timeLogs, setTimeLogs] = useState([]);
  const [projects, setProjects] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  
  // Filters
  const [filters, setFilters] = useState({
    start_date: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
    project_id: '',
    is_billable: ''
  });

  // Form data
  const [formData, setFormData] = useState({
    project_id: '',
    task_id: '',
    description: '',
    hours: '',
    log_date: new Date().toISOString().split('T')[0],
    is_billable: true
  });

  useEffect(() => {
    loadProjects();
    loadTimeLogs();
  }, [filters]);

  const loadProjects = async () => {
    try {
      const response = await projectService.getProjects();
      if (response.success) {
        setProjects(response.data.projects || []);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadTimeLogs = async () => {
    setLoading(true);
    try {
      const response = await timesheetService.getTimeLogs(filters);
      if (response.success) {
        setTimeLogs(response.data.timeLogs || []);
        setSummary(response.data.summary);
      }
    } catch (error) {
      console.error('Failed to load time logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = {
        ...formData,
        hours: parseFloat(formData.hours),
        task_id: formData.task_id || null
      };

      if (editingLog) {
        await timesheetService.updateTimeLog(editingLog.id, data);
      } else {
        await timesheetService.logTime(data);
      }
      
      setShowLogModal(false);
      setEditingLog(null);
      resetForm();
      loadTimeLogs();
    } catch (error) {
      console.error('Failed to save time log:', error);
      alert('Failed to save time log');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (log) => {
    setEditingLog(log);
    setFormData({
      project_id: log.project_id,
      task_id: log.task_id || '',
      description: log.description || '',
      hours: log.hours,
      log_date: log.log_date.split('T')[0],
      is_billable: log.is_billable
    });
    setShowLogModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this time log?')) return;
    
    try {
      await timesheetService.deleteTimeLog(id);
      loadTimeLogs();
    } catch (error) {
      console.error('Failed to delete time log:', error);
      alert('Failed to delete time log');
    }
  };

  const resetForm = () => {
    setFormData({
      project_id: '',
      task_id: '',
      description: '',
      hours: '',
      log_date: new Date().toISOString().split('T')[0],
      is_billable: true
    });
  };

  const getBillablePercent = () => {
    if (!summary || summary.total_hours === 0) return 0;
    return Math.round((summary.billable_hours / summary.total_hours) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>Timesheets</h1>
          <p style={{ color: 'rgb(var(--text-secondary))' }} className="mt-2">
            Track and manage your working hours
          </p>
        </div>
        <button 
          onClick={() => setShowLogModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus className="w-4 h-4" />
          Log Hours
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Total Hours</p>
              <p className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                {summary?.total_hours?.toFixed(1) || '0.0'}
              </p>
            </div>
            <FiClock className="h-8 w-8" style={{ color: 'rgb(var(--primary))' }} />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Billable Hours</p>
              <p className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                {summary?.billable_hours?.toFixed(1) || '0.0'}
              </p>
            </div>
            <FiCalendar className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Billable %</p>
              <p className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                {getBillablePercent()}%
              </p>
            </div>
            <div className="h-8 w-8 rounded-full flex items-center justify-center bg-purple-100">
              <span className="text-purple-600 font-bold text-sm">{getBillablePercent()}%</span>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Total Amount</p>
              <p className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                ₹{summary?.total_amount?.toLocaleString() || '0'}
              </p>
            </div>
            <FiDollarSign className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <FiFilter className="w-5 h-5" style={{ color: 'rgb(var(--text-secondary))' }} />
          <h3 className="font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
              className="input-field w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              Project
            </label>
            <select
              value={filters.project_id}
              onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
              className="input-field w-full"
            >
              <option value="">All Projects</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              Billable
            </label>
            <select
              value={filters.is_billable}
              onChange={(e) => setFilters({ ...filters, is_billable: e.target.value })}
              className="input-field w-full"
            >
              <option value="">All</option>
              <option value="true">Billable Only</option>
              <option value="false">Non-Billable Only</option>
            </select>
          </div>
        </div>
      </div>

      {/* Time Logs Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
              <tr>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Date</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Project</th>
                <th className="text-left py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Description</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Hours</th>
                <th className="text-center py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Billable</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Rate</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Amount</th>
                <th className="text-right py-3 px-4 font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Loading...
                  </td>
                </tr>
              ) : timeLogs.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-8" style={{ color: 'rgb(var(--text-secondary))' }}>
                    No time logs found. Click "Log Hours" to add one.
                  </td>
                </tr>
              ) : (
                timeLogs.map(log => (
                  <tr key={log.id} className="border-t" style={{ borderColor: 'rgb(var(--border))' }}>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>
                      {new Date(log.log_date).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-primary))' }}>
                      {log.project_name}
                    </td>
                    <td className="py-3 px-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {log.description || log.task_title || '-'}
                    </td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                      {parseFloat(log.hours).toFixed(1)}h
                    </td>
                    <td className="py-3 px-4 text-center">
                      {log.is_billable ? (
                        <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">
                          Billable
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                          Non-Billable
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right" style={{ color: 'rgb(var(--text-secondary))' }}>
                      ₹{log.hourly_rate ? parseFloat(log.hourly_rate).toLocaleString() : '-'}/hr
                    </td>
                    <td className="py-3 px-4 text-right font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                      ₹{parseFloat(log.billable_amount || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(log)}
                          className="p-2 hover:bg-opacity-10 rounded"
                          style={{ color: 'rgb(var(--primary))' }}
                          title="Edit"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-2 hover:bg-opacity-10 rounded text-red-500"
                          title="Delete"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Hours Modal */}
      {showLogModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
            <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: 'rgb(var(--border))' }}>
              <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                {editingLog ? 'Edit Time Log' : 'Log Hours'}
              </h3>
              <button
                onClick={() => {
                  setShowLogModal(false);
                  setEditingLog(null);
                  resetForm();
                }}
                className="p-2 hover:bg-opacity-10 rounded"
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Project *
                </label>
                <select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  className="input-field w-full"
                  required
                >
                  <option value="">Select Project</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field w-full"
                  rows="3"
                  placeholder="What did you work on?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                    Hours *
                  </label>
                  <input
                    type="number"
                    value={formData.hours}
                    onChange={(e) => setFormData({ ...formData, hours: e.target.value })}
                    className="input-field w-full"
                    step="0.25"
                    min="0.25"
                    max="24"
                    required
                    placeholder="8.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                    Date *
                  </label>
                  <input
                    type="date"
                    value={formData.log_date}
                    onChange={(e) => setFormData({ ...formData, log_date: e.target.value })}
                    className="input-field w-full"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_billable}
                    onChange={(e) => setFormData({ ...formData, is_billable: e.target.checked })}
                    className="w-4 h-4"
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span className="text-sm font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                    Billable to Client
                  </span>
                </label>
                <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Billable hours are counted as revenue for the company
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowLogModal(false);
                    setEditingLog(null);
                    resetForm();
                  }}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : editingLog ? 'Update' : 'Log Hours'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timesheets;
