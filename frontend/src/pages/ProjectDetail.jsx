import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { 
  FiFileText, 
  FiShoppingCart, 
  FiDollarSign, 
  FiCreditCard,
  FiTrendingUp,
  FiArrowLeft,
  FiUsers,
  FiCalendar,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiPlus,
  FiX,
  FiTrash2
} from 'react-icons/fi';
import projectService from '../services/projectService';
import taskService from '../services/taskService';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import FinancialSettings from '../components/financial/FinancialSettings';
import FinancialLinksBar from '../components/financial/FinancialLinksBar';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [financialTab, setFinancialTab] = useState('sales-orders');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Team member modal states
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [addingMember, setAddingMember] = useState(false);
  const [memberError, setMemberError] = useState('');

  const handleFinancialLinkClick = (mainTab, subTab) => {
    setActiveTab(mainTab);
    setFinancialTab(subTab);
  };

  useEffect(() => {
    fetchProjectDetails();
    fetchProjectTasks();
  }, [id]);

  const fetchProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await projectService.getProjectById(id);
      console.log('Project details response:', response);
      
      if (response.success && response.data) {
        // Map team_members from response properly
        const projectData = {
          ...response.data.project,
          team_members: response.data.team_members || [],
          statistics: response.data.statistics
        };
        setProject(projectData);
      }
    } catch (err) {
      console.error('Fetch project details error:', err);
      setError('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectTasks = async () => {
    try {
      const response = await taskService.getProjectTasks(id);
      if (response.success && response.data) {
        setTasks(response.data.tasks || []);
      }
    } catch (err) {
      console.error('Fetch project tasks error:', err);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      if (response.success && response.data) {
        // Filter out users already in the project
        const currentMemberIds = project.team_members?.map(m => m.id) || [];
        const available = response.data.users.filter(u => !currentMemberIds.includes(u.id));
        setAvailableUsers(available);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const handleAddMemberClick = () => {
    setShowAddMemberModal(true);
    setMemberError('');
    setSelectedUser('');
    setSelectedRole('member');
    fetchAvailableUsers();
  };

  const handleAddMember = async () => {
    if (!selectedUser) {
      setMemberError('Please select a user');
      return;
    }

    setAddingMember(true);
    setMemberError('');

    try {
      const response = await projectService.addTeamMember(id, {
        user_id: parseInt(selectedUser),
        role: selectedRole
      });

      if (response.success) {
        // Close modal first
        setShowAddMemberModal(false);
        
        // Wait a bit then reload project to get updated team members
        setTimeout(async () => {
          await fetchProjectDetails();
        }, 300);
      } else {
        setMemberError(response.message || 'Failed to add team member');
      }
    } catch (err) {
      console.error('Add member error:', err);
      setMemberError(err.response?.data?.message || 'Failed to add team member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const response = await api.delete(`/projects/${id}/members/${memberId}`);
      if (response.success) {
        fetchProjectDetails(); // Reload project
      }
    } catch (err) {
      console.error('Remove member error:', err);
      alert('Failed to remove team member');
    }
  };

  const canManageTeam = () => {
    // Admin can always manage
    if (user?.role === 'admin') return true;
    
    // Check if user is project owner or manager
    const currentMember = project?.team_members?.find(m => m.id === user?.id);
    return currentMember && ['owner', 'manager'].includes(currentMember.role);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <svg className="animate-spin h-8 w-8" style={{ color: '#6D28D9' }} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiAlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
            {error || 'Project not found'}
          </h2>
          <button onClick={() => navigate('/projects')} className="btn-primary mt-4">
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const taskStats = {
    total: tasks.length,
    todo: tasks.filter(t => t.status === 'todo').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  return (
    <div className="space-y-6">
      {/* Back Button & Header */}
      <div>
        <button 
          onClick={() => navigate('/projects')} 
          className="flex items-center gap-2 mb-4 text-sm hover:opacity-70"
          style={{ color: 'rgb(var(--text-secondary))' }}
        >
          <FiArrowLeft /> Back to Projects
        </button>
        
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
              {project.name}
            </h1>
            <p className="mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
              {project.description || 'No description'}
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-sm font-medium capitalize" style={{
            backgroundColor: project.status === 'active' ? 'rgb(16 185 129 / 0.1)' : 'rgb(107 114 128 / 0.1)',
            color: project.status === 'active' ? '#10b981' : 'rgb(var(--text-secondary))'
          }}>
            {project.status || 'active'}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <FiDollarSign className="h-5 w-5" style={{ color: 'rgb(var(--primary))' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Budget</p>
          <p className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            ₹{(project.budget / 1000).toFixed(0)}K
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <FiCheckCircle className="h-5 w-5 text-green-500" />
            <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
              {taskStats.done}/{taskStats.total}
            </span>
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Tasks Completed</p>
          <p className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0}%
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <FiUsers className="h-5 w-5" style={{ color: 'rgb(var(--primary))' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Team Members</p>
          <p className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {project.team_members?.length || 0}
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-2">
            <FiCalendar className="h-5 w-5" style={{ color: 'rgb(var(--primary))' }} />
          </div>
          <p className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>Deadline</p>
          <p className="text-lg font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
            {project.end_date ? new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}
          </p>
        </div>
      </div>

      {/* Financial Links Bar */}
      <FinancialLinksBar projectId={id} onTabChange={handleFinancialLinkClick} />

      {/* Tabs */}
      <div className="border-b" style={{ borderColor: 'rgb(var(--border))' }}>
        <nav className="-mb-px flex space-x-8">
          {['overview', 'tasks', 'team', 'settings'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab ? 'border-b-2' : ''
              }`}
              style={activeTab === tab ? {
                color: 'rgb(var(--primary))',
                borderColor: 'rgb(var(--primary))'
              } : {
                borderColor: 'transparent',
                color: 'rgb(var(--text-secondary))'
              }}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="card">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
                Project Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-tertiary))' }}>Created By</p>
                  <p style={{ color: 'rgb(var(--text-primary))' }}>{project.created_by_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-tertiary))' }}>Start Date</p>
                  <p style={{ color: 'rgb(var(--text-primary))' }}>
                    {project.start_date ? new Date(project.start_date).toLocaleDateString() : 'Not set'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-tertiary))' }}>Budget</p>
                  <p style={{ color: 'rgb(var(--text-primary))' }}>₹{project.budget?.toLocaleString() || '0'}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1" style={{ color: 'rgb(var(--text-tertiary))' }}>Created On</p>
                  <p style={{ color: 'rgb(var(--text-primary))' }}>
                    {new Date(project.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {project.description && (
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>Description</h3>
                <p style={{ color: 'rgb(var(--text-secondary))' }}>{project.description}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                Tasks ({taskStats.total})
              </h3>
              <button 
                onClick={() => navigate('/tasks/create')}
                className="btn-primary text-sm"
              >
                Add Task
              </button>
            </div>

            {tasks.length === 0 ? (
              <p style={{ color: 'rgb(var(--text-secondary))' }}>No tasks yet. Create your first task to get started.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="p-4 rounded-lg border" style={{ borderColor: 'rgb(var(--border))' }}>
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>{task.title}</h4>
                        <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                          {task.description || 'No description'}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs capitalize" style={{
                        backgroundColor: task.status === 'done' ? 'rgb(16 185 129 / 0.1)' :
                                       task.status === 'in_progress' ? 'rgb(59 130 246 / 0.1)' :
                                       'rgb(107 114 128 / 0.1)',
                        color: task.status === 'done' ? '#10b981' :
                               task.status === 'in_progress' ? '#3b82f6' :
                               'rgb(var(--text-secondary))'
                      }}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-3 text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>
                      {task.assigned_to_name && (
                        <span className="flex items-center gap-1">
                          <FiUsers className="w-4 h-4" />
                          {task.assigned_to_name}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <FiCalendar className="w-4 h-4" />
                          {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                      {task.priority && (
                        <span className="flex items-center gap-1 capitalize">
                          <FiClock className="w-4 h-4" />
                          {task.priority}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'team' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
                Team Members ({project.team_members?.length || 0})
              </h3>
              {canManageTeam() && (
                <button 
                  onClick={handleAddMemberClick}
                  className="btn-primary text-sm flex items-center gap-2"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Team Member
                </button>
              )}
            </div>

            {project.team_members && project.team_members.length > 0 ? (
              <div className="space-y-2">
                {project.team_members.map((member, index) => (
                  <div key={member.id || index} className="flex items-center justify-between p-3 rounded-lg border" style={{ borderColor: 'rgb(var(--border))' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" 
                        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                        {member.first_name?.[0]}{member.last_name?.[0]}
                      </div>
                      <div>
                        <p className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                          {member.first_name} {member.last_name}
                        </p>
                        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm capitalize px-3 py-1 rounded" style={{ 
                        backgroundColor: member.role === 'owner' || member.role === 'manager' 
                          ? 'rgb(var(--primary) / 0.1)' 
                          : 'rgb(var(--bg-tertiary))',
                        color: member.role === 'owner' || member.role === 'manager'
                          ? 'rgb(var(--primary))'
                          : 'rgb(var(--text-secondary))'
                      }}>
                        {member.role || 'member'}
                      </span>
                      {canManageTeam() && member.role !== 'owner' && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-2 hover:bg-red-50 rounded text-red-500"
                          title="Remove member"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'rgb(var(--text-secondary))' }}>No team members assigned yet.</p>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
              Financial Management
            </h3>
            <FinancialSettings projectId={id} initialTab={financialTab} />
          </div>
        )}
      </div>

      {/* Add Team Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>
                Add Team Member
              </h3>
              <button 
                onClick={() => setShowAddMemberModal(false)}
                className="p-2 hover:bg-opacity-10 rounded"
                style={{ color: 'rgb(var(--text-secondary))' }}
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {memberError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {memberError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Select User *
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="input-field w-full"
                  disabled={addingMember}
                >
                  <option value="">-- Choose a user --</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.first_name} {user.last_name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Project Role *
                </label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="input-field w-full"
                  disabled={addingMember}
                >
                  <option value="member">Member</option>
                  <option value="manager">Manager (PM)</option>
                </select>
                <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Managers can add/remove team members
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t" style={{ borderColor: 'rgb(var(--border))' }}>
                <button
                  onClick={() => setShowAddMemberModal(false)}
                  className="btn-secondary flex-1"
                  disabled={addingMember}
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  className="btn-primary flex-1"
                  disabled={addingMember || !selectedUser}
                >
                  {addingMember ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
