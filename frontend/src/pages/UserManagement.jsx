import { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiUserCheck, 
  FiUserX, 
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiEdit,
  FiTrash2,
  FiAlertCircle,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';

const UserManagement = () => {
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [newRole, setNewRole] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchPendingUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (err) {
      console.error('Fetch users error:', err);
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingUsers = async () => {
    try {
      const response = await api.get('/admin/pending-users');
      if (response.success) {
        setPendingUsers(response.data.pendingUsers);
      }
    } catch (err) {
      console.error('Fetch pending users error:', err);
    }
  };

  const handleAssignRole = async (userId, role) => {
    try {
      setActionLoading(true);
      setError(null);
      
      const response = await api.post(`/admin/users/${userId}/assign-role`, { role });
      
      if (response.success) {
        setSuccess(`Role "${role}" assigned successfully!`);
        
        // Immediately refresh both user lists
        await Promise.all([fetchUsers(), fetchPendingUsers()]);
        
        setShowRoleModal(false);
        setSelectedUser(null);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to assign role');
      }
    } catch (err) {
      console.error('Assign role error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to assign role');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectUser = async (userId) => {
    if (!confirm('Are you sure you want to reject this user? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      
      const response = await api.delete(`/admin/users/${userId}/reject`);
      
      if (response.success) {
        setSuccess('User rejected and removed successfully');
        
        // Immediately refresh both user lists
        await Promise.all([fetchUsers(), fetchPendingUsers()]);
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to reject user');
      }
    } catch (err) {
      console.error('Reject user error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to reject user');
      
      // Still try to refresh in case the deletion succeeded
      await Promise.all([fetchUsers(), fetchPendingUsers()]);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveUser = async (userId, userName) => {
    if (!confirm(`Are you sure you want to permanently remove ${userName}? This will delete all their data and cannot be undone.`)) {
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      
      const response = await api.delete(`/admin/users/${userId}`);
      
      if (response.success) {
        setSuccess(`User ${userName} has been permanently removed`);
        
        // Immediately refresh both user lists
        await Promise.all([fetchUsers(), fetchPendingUsers()]);
        
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(response.message || 'Failed to remove user');
      }
    } catch (err) {
      console.error('Remove user error:', err);
      setError(err.response?.data?.message || err.message || 'Failed to remove user');
      
      // Still try to refresh in case the deletion succeeded but response was unclear
      await Promise.all([fetchUsers(), fetchPendingUsers()]);
    } finally {
      setActionLoading(false);
    }
  };

  const openRoleModal = (userToEdit) => {
    setSelectedUser(userToEdit);
    setNewRole(userToEdit.role || '');
    setShowRoleModal(true);
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800 border-purple-300',
      project_manager: 'bg-blue-100 text-blue-800 border-blue-300',
      team_member: 'bg-green-100 text-green-800 border-green-300',
      none: 'bg-gray-100 text-gray-600 border-gray-300'
    };

    const labels = {
      admin: 'Admin',
      project_manager: 'Project Manager',
      team_member: 'Team Member',
      none: 'No Role'
    };

    const roleKey = role || 'none';
    
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[roleKey]}`}>
        {labels[roleKey]}
      </span>
    );
  };

  const getStatusBadge = (user) => {
    if (user.pending_approval) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-300">
          <FiClock className="w-3 h-3" />
          Pending
        </span>
      );
    }
    if (user.role_approved) {
      return (
        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
          <FiCheckCircle className="w-3 h-3" />
          Approved
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
        <FiAlertCircle className="w-3 h-3" />
        Not Approved
      </span>
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FiXCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>Access Denied</h2>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3" style={{ color: 'rgb(var(--text-primary))' }}>
                <FiUsers className="w-8 h-8" />
                User Management
              </h1>
              <p className="mt-2" style={{ color: 'rgb(var(--text-secondary))' }}>
                Manage user roles, approve pending requests, and control access
              </p>
            </div>
            <button
              onClick={() => {
                fetchUsers();
                fetchPendingUsers();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FiRefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <FiCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">{success}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Total Users</p>
                <p className="text-3xl font-bold mt-2" style={{ color: 'rgb(var(--text-primary))' }}>{users.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <FiUsers className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="card rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Pending Approvals</p>
                <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingUsers.length}</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-lg">
                <FiClock className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="card rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>Approved Users</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {users.filter(u => u.role_approved).length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <FiUserCheck className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Pending Users Section */}
        {pendingUsers.length > 0 && (
          <div className="card rounded-lg shadow mb-8 overflow-hidden">
            <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-200">
              <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
                <FiClock className="w-5 h-5 text-yellow-600" />
                Pending Approvals ({pendingUsers.length})
              </h2>
              <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                These users have verified their email and are waiting for role assignment
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Registered
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgb(var(--border-color))' }}>
                  {pendingUsers.map((pendingUser) => (
                    <tr key={pendingUser.id} className="hover:bg-opacity-50" style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                          {pendingUser.first_name} {pendingUser.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {pendingUser.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {new Date(pendingUser.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openRoleModal(pendingUser)}
                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
                          >
                            <FiUserCheck className="w-4 h-4" />
                            Assign Role
                          </button>
                          <button
                            onClick={() => handleRejectUser(pendingUser.id)}
                            className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-1"
                          >
                            <FiUserX className="w-4 h-4" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* All Users Section */}
        <div className="card rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ borderColor: 'rgb(var(--border-color))' }}>
            <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'rgb(var(--text-primary))' }}>
              <FiUsers className="w-5 h-5" />
              All Users ({users.length})
            </h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: 'rgb(var(--primary))' }}></div>
              <p className="mt-4" style={{ color: 'rgb(var(--text-secondary))' }}>Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Joined
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'rgb(var(--border-color))' }}>
                  {users.map((userItem) => (
                    <tr key={userItem.id} style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>
                          {userItem.first_name} {userItem.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {userItem.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getRoleBadge(userItem.role)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(userItem)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                        {new Date(userItem.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {userItem.id !== user.id && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openRoleModal(userItem)}
                              className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              title="Change Role"
                            >
                              <FiEdit className="w-4 h-4" />
                              Change Role
                            </button>
                            <button
                              onClick={() => handleRemoveUser(userItem.id, `${userItem.first_name} ${userItem.last_name}`)}
                              className="text-red-600 hover:text-red-800 flex items-center gap-1"
                              title="Remove User"
                              disabled={actionLoading}
                            >
                              <FiTrash2 className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Role Assignment Modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Assign Role to {selectedUser.first_name} {selectedUser.last_name}
              </h3>
            </div>
            
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Select a role for this user. This will determine their permissions in the system.
              </p>
              
              <div className="space-y-3">
                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="admin"
                    checked={newRole === 'admin'}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-medium text-gray-900">Admin</p>
                    <p className="text-sm text-gray-600">Full system access, can manage users and settings</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="radio"
                    name="role"
                    value="project_manager"
                    checked={newRole === 'project_manager'}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>Project Manager</p>
                    <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>Can create projects, assign tasks, and create invoices</p>
                  </div>
                </label>

                <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors" style={{ borderColor: 'rgb(var(--border-color))' }}>
                  <input
                    type="radio"
                    name="role"
                    value="team_member"
                    checked={newRole === 'team_member' || newRole === null || newRole === ''}
                    onChange={(e) => setNewRole('team_member')}
                    className="w-4 h-4 text-blue-600"
                  />
                  <div className="ml-3 flex-1">
                    <p className="font-medium" style={{ color: 'rgb(var(--text-primary))' }}>Team Member</p>
                    <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>Can view assigned tasks and log hours</p>
                  </div>
                </label>
              </div>
            </div>

            <div className="px-6 py-4 flex justify-end gap-3 rounded-b-lg" style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
              <button
                onClick={() => {
                  setShowRoleModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 border rounded-lg transition-colors"
                style={{ 
                  borderColor: 'rgb(var(--border-color))',
                  color: 'rgb(var(--text-primary))'
                }}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAssignRole(selectedUser.id, newRole || 'team_member')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Assigning...
                  </>
                ) : (
                  <>
                    <FiCheckCircle className="w-4 h-4" />
                    Assign Role
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
