import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiX, 
  FiUpload, 
  FiCalendar, 
  FiUser, 
  FiFolder,
  FiAlignLeft,
  FiSave,
  FiTrash2,
  FiClock,
  FiInfo,
  FiPlus,
  FiAlertCircle
} from 'react-icons/fi';
import taskService from '../services/taskService';
import projectService from '../services/projectService';
import api from '../services/api';

const TaskCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    assigned_to: '',
    project_id: '',
    description: '',
    due_date: '',
    priority: 'medium',
    estimated_hours: '',
    tags: [],
    images: [],
    timesheets: [],
    taskInfo: {
      status: 'new',
      priority: 'medium',
      estimatedHours: 0,
      actualHours: 0,
      lastChange: new Date().toISOString()
    }
  });
  const [projectMembers, setProjectMembers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('description');
  const [tagInput, setTagInput] = useState('');

  // Fetch projects and team members on mount
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch project members when project changes
  useEffect(() => {
    if (formData.project_id) {
      console.log('Fetching members for project:', formData.project_id);
      fetchProjectMembers(formData.project_id);
    } else {
      setProjectMembers([]);
      // Reset assigned_to if project changes
      setFormData(prev => ({ ...prev, assigned_to: '' }));
    }
  }, [formData.project_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const projectsRes = await projectService.getProjects();

      console.log('Projects response:', projectsRes);

      if (projectsRes.success && projectsRes.data.projects) {
        setProjects(projectsRes.data.projects);
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      setError('Failed to load form data');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectMembers = async (projectId) => {
    try {
      console.log('Fetching project details for ID:', projectId);
      const response = await projectService.getProjectById(projectId);
      console.log('Project details response:', response);
      
      // Backend returns: { success: true, data: { project: {...}, team_members: [...], statistics: {...} } }
      if (response.success && response.data.team_members) {
        console.log('Setting project members:', response.data.team_members);
        setProjectMembers(response.data.team_members);
      } else {
        console.log('No team members found in response');
        setProjectMembers([]);
      }
    } catch (err) {
      console.error('Fetch project members error:', err);
      setProjectMembers([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaskInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      taskInfo: {
        ...prev.taskInfo,
        [name]: value,
        lastChange: new Date().toISOString()
      }
    }));
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tagInput.trim()]
        }));
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const handleRemoveImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleAddTimesheet = () => {
    const newTimesheet = {
      id: Date.now(),
      employee: '',
      timeLogged: 0
    };
    setFormData(prev => ({
      ...prev,
      timesheets: [...prev.timesheets, newTimesheet]
    }));
  };

  const handleTimesheetChange = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      timesheets: prev.timesheets.map(ts => 
        ts.id === id ? { ...ts, [field]: value } : ts
      )
    }));
  };

  const handleRemoveTimesheet = (id) => {
    setFormData(prev => ({
      ...prev,
      timesheets: prev.timesheets.filter(ts => ts.id !== id)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);

      // Validate required fields
      if (!formData.title || !formData.project_id || !formData.assigned_to || !formData.due_date) {
        setError('Please fill in all required fields (Title, Project, Assignee, Deadline)');
        setSubmitting(false);
        return;
      }

      // Prepare data for API
      const taskData = {
        title: formData.title,
        description: formData.description,
        project_id: parseInt(formData.project_id),
        assigned_to: parseInt(formData.assigned_to),
        due_date: formData.due_date,
        priority: formData.priority,
        estimated_hours: parseFloat(formData.estimated_hours) || null
      };

      console.log('Submitting task:', taskData);

      const response = await taskService.createTask(taskData);
      
      if (response.success) {
        navigate('/tasks');
      }
    } catch (err) {
      console.error('Create task error:', err);
      setError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = () => {
    navigate('/tasks');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
            style={{ borderColor: 'rgb(var(--primary))' }}></div>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>Loading form data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="max-w-6xl mx-auto">
        <div className="rounded-2xl shadow-xl overflow-hidden" 
          style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
          
          {/* Header */}
          <div className="px-6 py-4 border-b flex items-center justify-between" 
            style={{ borderColor: 'rgb(var(--border))' }}>
            <div>
              <h2 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                Task create/edit view
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                Projects &gt; New Task
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleDiscard}
                disabled={submitting}
                className="px-5 py-2 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: 'rgb(var(--bg-tertiary))',
                  color: 'rgb(var(--text-secondary))'
                }}
              >
                Discard
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 py-2 rounded-lg font-medium transition-all hover:opacity-90 flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ 
                  backgroundColor: '#10b981',
                  color: 'white'
                }}
              >
                <FiSave className="mr-2" />
                {submitting ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="p-6">
            
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-lg flex items-start gap-3" 
                style={{ backgroundColor: 'rgb(239 68 68 / 0.1)', border: '1px solid #ef4444' }}>
                <FiAlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                <div>
                  <p className="font-medium" style={{ color: '#ef4444' }}>Error</p>
                  <p className="text-sm mt-1" style={{ color: '#ef4444' }}>{error}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              
              {/* Left Column */}
              <div className="space-y-5">
                
                {/* Task Title */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Task Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                {/* Project - Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Project *
                  </label>
                  <div className="relative">
                    <FiFolder className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <select
                      name="project_id"
                      value={formData.project_id}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    >
                      <option value="">Select project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    <span className="font-medium">A field that lets us store selection of the project</span>
                  </p>
                </div>

                {/* Assignee - Single Selection Dropdown */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Assignee *
                  </label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <select
                      name="assigned_to"
                      value={formData.assigned_to}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                      disabled={!formData.project_id}
                    >
                      <option value="">
                        {!formData.project_id ? 'Select project first' : 'Select assignee'}
                      </option>
                      {projectMembers.map(member => (
                        <option key={member.id} value={member.id}>
                          {member.first_name} {member.last_name} {member.user_role ? `(${member.user_role})` : '(Team Member)'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    {!formData.project_id ? 
                      'Select a project to see available team members' : 
                      `${projectMembers.length} team member(s) available`
                    }
                  </p>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 p-3 rounded-lg border min-h-[48px]" 
                    style={{ 
                      borderColor: 'rgb(var(--border))',
                      backgroundColor: 'rgb(var(--bg-tertiary))'
                    }}>
                    {formData.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                        style={{ 
                          backgroundColor: '#ef4444',
                          color: 'white'
                        }}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 hover:opacity-70"
                        >
                          <FiX className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder={formData.tags.length === 0 ? "Type and press Enter" : "Add more..."}
                      className="flex-1 min-w-[150px] bg-transparent border-none outline-none"
                      style={{ color: 'rgb(var(--text-primary))' }}
                    />
                  </div>
                </div>

                {/* Deadline */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Deadline *
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

              </div>

              {/* Right Column */}
              <div className="space-y-5">
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Images
                  </label>
                  
                  <label className="inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-all hover:opacity-80"
                    style={{ 
                      backgroundColor: 'rgb(var(--primary))',
                      color: 'white'
                    }}>
                    <FiUpload className="mr-2" />
                    Upload Image
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>

                  {formData.images.length > 0 && (
                    <div className="mt-3 grid grid-cols-3 gap-3">
                      {formData.images.map((image, index) => (
                        <div 
                          key={index}
                          className="relative group rounded-lg overflow-hidden"
                          style={{ 
                            backgroundColor: 'rgb(var(--bg-tertiary))',
                            aspectRatio: '1/1'
                          }}
                        >
                          <img
                            src={URL.createObjectURL(image)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-2 right-2 p-1 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-8 border-t pt-6" style={{ borderColor: 'rgb(var(--border))' }}>
              
              {/* Tab Navigation */}
              <div className="flex items-center space-x-6 border-b" 
                style={{ borderColor: 'rgb(var(--border))' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'description' ? 'border-b-2' : ''
                  }`}
                  style={activeTab === 'description' ? {
                    color: 'rgb(var(--primary))',
                    borderColor: 'rgb(var(--primary))'
                  } : {
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  <FiAlignLeft className="inline mr-2" />
                  Description
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('timesheets')}
                  className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'timesheets' ? 'border-b-2' : ''
                  }`}
                  style={activeTab === 'timesheets' ? {
                    color: 'rgb(var(--primary))',
                    borderColor: 'rgb(var(--primary))'
                  } : {
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  <FiClock className="inline mr-2" />
                  Timesheets
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('taskinfo')}
                  className={`pb-3 px-2 text-sm font-medium transition-colors relative ${
                    activeTab === 'taskinfo' ? 'border-b-2' : ''
                  }`}
                  style={activeTab === 'taskinfo' ? {
                    color: 'rgb(var(--primary))',
                    borderColor: 'rgb(var(--primary))'
                  } : {
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  <FiInfo className="inline mr-2" />
                  Task Info
                </button>
              </div>

              {/* Tab Content */}
              <div className="mt-6">
                
                {/* Description Tab */}
                {activeTab === 'description' && (
                  <div>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={10}
                      className="input-field resize-none"
                      placeholder="Enter detailed task description..."
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                )}

                {/* Timesheets Tab */}
                {activeTab === 'timesheets' && (
                  <div>
                    <div className="mb-4">
                      <p className="text-sm mb-3" style={{ color: 'rgb(var(--text-secondary))' }}>
                        A table like structure which holds timesheets which are billable on the task
                      </p>
                      <button
                        type="button"
                        onClick={handleAddTimesheet}
                        className="text-sm font-medium flex items-center hover:opacity-80"
                        style={{ color: '#ef4444' }}
                      >
                        <FiPlus className="mr-1" />
                        Add a line
                      </button>
                    </div>

                    {formData.timesheets.length > 0 ? (
                      <div className="border rounded-lg overflow-hidden" 
                        style={{ borderColor: 'rgb(var(--border))' }}>
                        <table className="w-full">
                          <thead>
                            <tr style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                              <th className="px-4 py-3 text-left text-sm font-medium" 
                                style={{ color: 'rgb(var(--text-primary))' }}>
                                Employee
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium" 
                                style={{ color: 'rgb(var(--text-primary))' }}>
                                Time Logged
                              </th>
                              <th className="px-4 py-3 text-left text-sm font-medium" 
                                style={{ color: 'rgb(var(--text-primary))' }}>
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.timesheets.map((timesheet, index) => (
                              <tr key={timesheet.id} 
                                className="border-t"
                                style={{ borderColor: 'rgb(var(--border))' }}>
                                <td className="px-4 py-3">
                                  <select
                                    value={timesheet.employee}
                                    onChange={(e) => handleTimesheetChange(timesheet.id, 'employee', e.target.value)}
                                    className="input-field text-sm"
                                  >
                                    <option value="">Select employee</option>
                                    {teamMembers.map(member => (
                                      <option key={member.id} value={member.name}>
                                        {member.name}
                                      </option>
                                    ))}
                                  </select>
                                </td>
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    value={timesheet.timeLogged}
                                    onChange={(e) => handleTimesheetChange(timesheet.id, 'timeLogged', parseFloat(e.target.value) || 0)}
                                    className="input-field text-sm"
                                    placeholder="0"
                                    min="0"
                                    step="0.5"
                                  />
                                </td>
                                <td className="px-4 py-3">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveTimesheet(timesheet.id)}
                                    className="p-2 rounded hover:bg-red-50 text-red-500"
                                  >
                                    <FiTrash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed rounded-lg"
                        style={{ borderColor: 'rgb(var(--border))' }}>
                        <FiClock className="mx-auto w-12 h-12 mb-3" 
                          style={{ color: 'rgb(var(--text-tertiary))' }} />
                        <p style={{ color: 'rgb(var(--text-secondary))' }}>
                          No timesheets added yet
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Task Info Tab */}
                {activeTab === 'taskinfo' && (
                  <div className="space-y-6">
                    <p className="text-sm mb-4" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Contains important task info like last changes made by, last change made on, total working hours
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      {/* Status */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.taskInfo.status}
                          onChange={handleTaskInfoChange}
                          className="input-field"
                        >
                          <option value="new">New</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Priority
                        </label>
                        <select
                          name="priority"
                          value={formData.taskInfo.priority}
                          onChange={handleTaskInfoChange}
                          className="input-field"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>

                      {/* Estimated Hours */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Estimated Hours
                        </label>
                        <input
                          type="number"
                          name="estimatedHours"
                          value={formData.taskInfo.estimatedHours}
                          onChange={handleTaskInfoChange}
                          className="input-field"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>

                      {/* Actual Hours */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Actual Hours
                        </label>
                        <input
                          type="number"
                          name="actualHours"
                          value={formData.taskInfo.actualHours}
                          onChange={handleTaskInfoChange}
                          className="input-field"
                          placeholder="0"
                          min="0"
                          step="0.5"
                        />
                      </div>

                      {/* Last Change */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Last Change Made On
                        </label>
                        <input
                          type="text"
                          value={new Date(formData.taskInfo.lastChange).toLocaleString()}
                          className="input-field"
                          disabled
                          style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                        />
                      </div>

                      {/* Total Working Hours */}
                      <div>
                        <label className="block text-sm font-medium mb-2" 
                          style={{ color: 'rgb(var(--text-primary))' }}>
                          Total Working Hours
                        </label>
                        <input
                          type="text"
                          value={formData.timesheets.reduce((sum, ts) => sum + ts.timeLogged, 0)}
                          className="input-field"
                          disabled
                          style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default TaskCreate;
