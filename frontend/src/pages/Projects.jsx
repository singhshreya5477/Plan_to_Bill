import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiX, 
  FiUpload, 
  FiCalendar, 
  FiUser, 
  FiTag,
  FiAlignLeft,
  FiSave,
  FiTrash2,
  FiAlertCircle
} from 'react-icons/fi';
import projectService from '../services/projectService';
import api from '../services/api';

const Projects = () => {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    budget: '',
    start_date: '',
    end_date: '',
    team_members: []
  });
  const [tagInput, setTagInput] = useState('');

  // Fetch projects and team members on mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('Auth token present:', !!token);
    if (!token) {
      console.error('No authentication token found!');
      setError('Please log in to access projects');
      setLoading(false);
      return;
    }
    fetchProjects();
    fetchTeamMembers();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjects();
      console.log('Fetch projects response:', response);
      
      // Handle different response formats
      let projectsData = [];
      if (response.success && response.data?.projects) {
        projectsData = response.data.projects;
      } else if (response.data?.projects) {
        projectsData = response.data.projects;
      } else if (response.projects) {
        projectsData = response.projects;
      } else if (Array.isArray(response)) {
        projectsData = response;
      }
      
      console.log('Projects data:', projectsData);
      setProjects(projectsData);
    } catch (err) {
      console.error('Fetch projects error:', err);
      setError(err.response?.data?.message || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      // Fetch all users (admin endpoint or team endpoint)
      const response = await api.get('/admin/users');
      console.log('Fetch team members response:', response);
      
      // api.get() returns parsed JSON directly: { success: true, data: { users: [...] } }
      if (response.success && response.data.users) {
        console.log('Setting team members:', response.data.users);
        setTeamMembers(response.data.users);
      }
    } catch (err) {
      console.error('Fetch team members error:', err);
      // Non-fatal error, continue without team members
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamMemberToggle = (userId) => {
    setFormData(prev => {
      const isSelected = prev.team_members.some(m => m.user_id === userId);
      if (isSelected) {
        return {
          ...prev,
          team_members: prev.team_members.filter(m => m.user_id !== userId)
        };
      } else {
        return {
          ...prev,
          team_members: [...prev.team_members, { user_id: userId, role: 'member' }]
        };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);

      console.log('Submitting project data:', formData);
      const response = await projectService.createProject(formData);
      console.log('Create project response:', response);
      
      // Backend returns { success: true, data: { project } } or just { project }
      if (response.success || response.project || response.data?.project) {
        alert('Project created successfully!');
        setShowCreateModal(false);
        // Reset form
        setFormData({
          name: '',
          description: '',
          budget: '',
          start_date: '',
          end_date: '',
          team_members: []
        });
        // Refresh projects list
        await fetchProjects();
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      console.error('Create project error:', err);
      console.error('Error details:', err.response);
      setError(err.response?.data?.message || err.message || 'Failed to create project');
      alert('Error creating project: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDiscard = () => {
    setShowCreateModal(false);
    setFormData({
      name: '',
      description: '',
      budget: '',
      start_date: '',
      end_date: '',
      team_members: []
    });
    setError(null);
  };

  const handleDeleteProject = async (projectId, projectName) => {
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await projectService.deleteProject(projectId);
      if (response.success) {
        alert('Project deleted successfully!');
        // Refresh projects list
        await fetchProjects();
      }
    } catch (err) {
      console.error('Delete project error:', err);
      alert('Error deleting project: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            Projects
          </h1>
          <p className="mt-2" style={{ color: 'rgb(var(--text-secondary))' }}>
            Create and manage all your projects
          </p>
        </div>
        <button 
          className="btn-primary"
          onClick={() => {
            console.log('Create New Project button clicked');
            setShowCreateModal(true);
          }}
        >
          Create New Project
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin h-8 w-8" style={{ color: '#6D28D9' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => {
              const projectColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981', '#06b6d4', '#3b82f6'];
              const projectColor = projectColors[index % projectColors.length];
              const progress = project.progress || Math.floor(Math.random() * 100);
              
              return (
                <div 
                  key={project.id} 
                  className="rounded-xl overflow-hidden transition-all hover:shadow-2xl hover-lift group animate-fade-in relative border-2 cursor-pointer" 
                  style={{ 
                    backgroundColor: 'rgb(var(--bg-secondary))',
                    borderColor: 'rgb(var(--border-color))'
                  }}
                  onClick={() => navigate(`/projects/${project.id}`)}
                >
                  {/* Animated gradient border on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
                    style={{ 
                      background: `linear-gradient(135deg, ${projectColor}40, transparent, ${projectColor}40)`,
                      filter: 'blur(10px)'
                    }}
                  />
                  
                  {/* Holographic shimmer effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  </div>
                  
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
                    style={{ background: `linear-gradient(135deg, ${projectColor} 0%, transparent 100%)` }}
                  />
                  
                  {/* Floating particle */}
                  <div className="absolute top-4 right-4 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ backgroundColor: projectColor, boxShadow: `0 0 20px ${projectColor}` }}>
                    <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: projectColor }}></div>
                  </div>
                  
                  {/* Delete button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteProject(project.id, project.name);
                    }}
                    className="absolute top-3 right-3 p-2 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-all hover:bg-red-600 z-20 hover-scale shadow-lg"
                    title="Delete project"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>

                  {/* Status Badge */}
                  <div className="p-3 flex flex-wrap gap-2 relative z-10">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-bold transition-all hover-scale cursor-pointer shadow-md group-hover:shadow-lg backdrop-blur-sm relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${projectColor}50, ${projectColor}70)`,
                        color: projectColor,
                        border: `1px solid ${projectColor}30`
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
                      <span className="relative z-10">{project.status || 'Active'}</span>
                    </span>
                  </div>

                  {/* Cover Image / Placeholder */}
                  <div className="relative h-32 overflow-hidden">
                    <div 
                      className="w-full h-full flex items-center justify-center transition-all duration-700 group-hover:scale-110 relative overflow-hidden"
                      style={{ 
                        background: `linear-gradient(135deg, ${projectColor}15, ${projectColor}35)`,
                      }}
                    >
                      {/* Cyber grid background */}
                      <div className="absolute inset-0 cyber-grid opacity-20"></div>
                      
                      {/* Animated gradient blob */}
                      <div className="absolute inset-0 opacity-30">
                        <div 
                          className="w-32 h-32 rounded-full blur-2xl blob-animate"
                          style={{ background: `radial-gradient(circle, ${projectColor}80, transparent)` }}
                        ></div>
                      </div>
                      
                      <span className="text-5xl font-black opacity-20 relative z-10 group-hover:scale-110 transition-transform" 
                        style={{ color: projectColor }}>
                        {project.name?.charAt(0) || 'P'}
                      </span>
                    </div>
                    
                    {/* Layered gradients */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity"></div>
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-500"
                      style={{ background: `linear-gradient(135deg, ${projectColor}, transparent)` }}
                    ></div>
                    
                    {/* Glowing border at bottom of image */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ 
                        background: `linear-gradient(90deg, transparent, ${projectColor}, transparent)`,
                        boxShadow: `0 0 20px ${projectColor}`
                      }}
                    ></div>
                  </div>

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    {/* Title */}
                    <div>
                      <h3 
                        className="text-lg font-bold line-clamp-1 transition-all group-hover:translate-x-1 relative inline-block"
                        style={{ color: 'rgb(var(--text-primary))' }}
                      >
                        {project.name}
                        {/* Animated underline */}
                        <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
                          style={{ backgroundColor: projectColor }}
                        ></div>
                      </h3>
                      <p className="text-sm mt-1 line-clamp-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {project.description || 'No description'}
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-4 text-sm transition-all group-hover:translate-x-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                      {project.start_date && (
                        <div className="flex items-center gap-1 hover-scale cursor-pointer group/metric transition-all hover:gap-2">
                          <FiCalendar className="w-4 h-4 group-hover/metric:text-blue-500 transition-colors" />
                          <span className="group-hover/metric:font-semibold transition-all">
                            {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-1 hover-scale cursor-pointer group/metric transition-all hover:gap-2">
                        <FiTag className="w-4 h-4 group-hover/metric:text-green-500 transition-colors" />
                        <span className="group-hover/metric:font-semibold transition-all">₹{(project.budget || 0).toLocaleString()}</span>
                      </div>
                      
                      {project.team_size > 0 && (
                        <div className="flex items-center gap-1 hover-scale cursor-pointer group/metric transition-all hover:gap-2">
                          <FiUser className="w-4 h-4 group-hover/metric:text-purple-500 transition-colors" />
                          <span className="group-hover/metric:font-semibold transition-all">{project.team_size}</span>
                        </div>
                      )}
                    </div>

                    {/* Progress Section */}
                    <div className="pt-3 border-t transition-all" style={{ borderColor: 'rgb(var(--border-color))' }}>
                      <div className="flex items-center justify-between mb-2">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all group-hover:scale-125 group-hover:rotate-12 cursor-pointer shadow-lg relative overflow-hidden"
                          style={{ 
                            background: `linear-gradient(135deg, ${projectColor}, ${projectColor}cc)`,
                            boxShadow: `0 4px 15px ${projectColor}50`
                          }}
                        >
                          {/* Rotating ring */}
                          <div className="absolute inset-0 rounded-full border-2 border-white/30 opacity-0 group-hover:opacity-100 animate-spin" style={{ animationDuration: '3s' }}></div>
                          
                          {/* Avatar text */}
                          <span className="relative z-10">{project.name?.substring(0, 2).toUpperCase() || 'P'}</span>
                          
                          {/* Glow effect */}
                          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity"
                            style={{ background: `radial-gradient(circle, ${projectColor}, transparent)`, filter: 'blur(8px)' }}
                          ></div>
                        </div>
                        
                        {/* Progress indicator with glow */}
                        <div className="text-base font-black transition-all group-hover:scale-125 relative" 
                          style={{ 
                            color: projectColor,
                            textShadow: `0 0 20px ${projectColor}60, 0 0 40px ${projectColor}40`
                          }}>
                          <span className="relative z-10">{progress}%</span>
                          
                          {/* Pulsing glow */}
                          <div className="absolute inset-0 opacity-50 group-hover:animate-ping"
                            style={{ color: projectColor }}
                          >
                            {progress}%
                          </div>
                        </div>
                      </div>
                      
                      {/* Progress bar with multiple layers */}
                      <div className="h-2.5 rounded-full overflow-hidden shadow-inner relative" 
                        style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                        
                        {/* Background pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
                        </div>
                        
                        {/* Main progress bar */}
                        <div 
                          className="h-full transition-all duration-1000 relative overflow-hidden rounded-full shadow-lg group-hover:shadow-2xl"
                          style={{ 
                            width: `${progress}%`,
                            background: `linear-gradient(90deg, ${projectColor}dd, ${projectColor}, ${projectColor}dd)`,
                            boxShadow: `0 0 15px ${projectColor}80, inset 0 1px 0 rgba(255,255,255,0.3)`
                          }}
                        >
                          {/* Shimmer effect */}
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          
                          {/* Top highlight */}
                          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-white/50 to-transparent"></div>
                          
                          {/* Pulse effect on hover */}
                          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"
                            style={{ backgroundColor: `${projectColor}30` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ color: 'rgb(var(--text-secondary))' }}>
            No projects yet. Click "Create New Project" to get started.
          </p>
        )}
      </div>

      {/* Create/Edit Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" 
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden animate-scale-in" 
            style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
            
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between" 
              style={{ borderColor: 'rgb(var(--border))' }}>
              <div>
                <h2 className="text-xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                  Create New Project
                </h2>
                <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Projects &gt; New Project
                </p>
              </div>
              <button
                onClick={handleDiscard}
                className="p-2 rounded-lg hover:opacity-70 transition-opacity"
                style={{ color: 'rgb(var(--text-tertiary))' }}
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-center gap-2">
                  <FiAlertCircle className="text-red-500" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              )}
              
              <div className="space-y-6">

                {/* Project Name */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Project Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter project name"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Description
                  </label>
                  <div className="relative">
                    <FiAlignLeft className="absolute left-3 top-3" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="input-field pl-10 resize-none"
                      placeholder="Enter project description, goals, and requirements..."
                    />
                  </div>
                </div>

                {/* Budget */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Budget (₹)
                  </label>
                  <input
                    type="number"
                    name="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="Enter project budget"
                    min="0"
                    step="1000"
                  />
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Start Date
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleChange}
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    End Date
                  </label>
                  <div className="relative">
                    <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleChange}
                      className="input-field pl-10"
                      min={formData.start_date}
                    />
                  </div>
                </div>

                {/* Team Members - Multi Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2" 
                    style={{ color: 'rgb(var(--text-primary))' }}>
                    Team Members
                  </label>
                  <div className="border rounded-lg p-3 max-h-48 overflow-y-auto"
                    style={{ borderColor: 'rgb(var(--border))' }}>
                    {teamMembers.length > 0 ? (
                      teamMembers.map(member => (
                        <label key={member.id} className="flex items-center space-x-2 py-2 cursor-pointer hover:bg-opacity-50">
                          <input
                            type="checkbox"
                            checked={formData.team_members.some(m => m.user_id === member.id)}
                            onChange={() => handleTeamMemberToggle(member.id)}
                            className="w-4 h-4"
                            style={{ accentColor: 'rgb(var(--primary))' }}
                          />
                          <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                            {member.first_name} {member.last_name} ({member.email}) - {member.role}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-center py-4" style={{ color: 'rgb(var(--text-tertiary))' }}>
                        No team members available
                      </p>
                    )}
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    Select team members to add to this project
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t"
                style={{ borderColor: 'rgb(var(--border))' }}>
                <button
                  type="button"
                  onClick={handleDiscard}
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{ 
                    backgroundColor: 'rgb(var(--bg-tertiary))',
                    color: 'rgb(var(--text-secondary))'
                  }}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-lg font-medium transition-all hover:opacity-90 flex items-center disabled:opacity-50"
                  style={{ 
                    backgroundColor: '#10b981',
                    color: 'white'
                  }}
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2" />
                      Save
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
