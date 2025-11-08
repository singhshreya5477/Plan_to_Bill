import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import authService from '../services/authService';
import { FiUser, FiMail, FiBriefcase, FiLock } from 'react-icons/fi';

const Profile = () => {
  const { user, company, updateUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    hourlyRate: 1500,
    phone: '',
    department: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });
    setLoading(true);

    try {
      // Split name into firstName and lastName
      const nameParts = formData.name.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await authService.updateProfile({
        firstName,
        lastName,
        phone: formData.phone,
        department: formData.department
      });

      if (response.success) {
        // Update local user data
        const updatedUser = response.data.user;
        updateUser({
          ...user,
          name: `${updatedUser.first_name} ${updatedUser.last_name}`.trim(),
          phone: updatedUser.phone,
          department: updatedUser.department
        });

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setIsEditing(false);
      } else {
        setMessage({ type: 'error', text: response.message || 'Failed to update profile' });
      }
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to update profile' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    // Validate
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all fields' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters' });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      if (response.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPasswordMessage({ type: 'error', text: response.message || 'Failed to change password' });
      }
    } catch (error) {
      setPasswordMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Failed to change password' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>My Profile</h1>
        <p className="mt-2" style={{ color: 'rgb(var(--text-secondary))' }}>Manage your personal information and settings</p>
      </div>

      {/* Profile Card */}
      <div className="card">
        <div className="flex items-center space-x-6 mb-6">
          <div className="w-24 h-24 rounded-full flex items-center justify-center text-white text-4xl font-bold" style={{ background: 'rgb(var(--primary))' }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'rgb(var(--text-primary))' }}>{user?.name}</h2>
            <p className="capitalize" style={{ color: 'rgb(var(--text-secondary))' }}>{user?.role?.replace('_', ' ')}</p>
            {company && (
              <p className="font-medium mt-1" style={{ color: 'rgb(var(--primary))' }}>
                <FiBriefcase className="inline-block mr-1" />
                {company}
              </p>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg`} style={
            message.type === 'success' 
              ? { 
                  background: 'rgb(var(--success) / 0.1)', 
                  border: '1px solid rgb(var(--success) / 0.3)',
                  color: 'rgb(var(--success))'
                }
              : { 
                  background: 'rgb(var(--error) / 0.1)', 
                  border: '1px solid rgb(var(--error) / 0.3)',
                  color: 'rgb(var(--error))'
                }
          }>
            {message.text}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                <FiUser className="inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                <FiMail className="inline mr-2" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="input-field opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                <FiBriefcase className="inline mr-2" />
                Role
              </label>
              <input
                type="text"
                name="role"
                value={formData.role.replace('_', ' ')}
                disabled
                className="input-field capitalize opacity-60"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Department
              </label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                disabled={!isEditing}
                className="input-field"
                placeholder="Engineering"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4" style={{ borderTop: '1px solid rgb(var(--border-color))' }}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setMessage({ type: '', text: '' });
                  }}
                  className="btn-secondary"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Change Password */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
          <FiLock className="inline mr-2" />
          Change Password
        </h3>

        {passwordMessage.text && (
          <div className={`mb-4 p-3 rounded-lg`} style={
            passwordMessage.type === 'success' 
              ? { 
                  background: 'rgb(var(--success) / 0.1)', 
                  border: '1px solid rgb(var(--success) / 0.3)',
                  color: 'rgb(var(--success))'
                }
              : { 
                  background: 'rgb(var(--error) / 0.1)', 
                  border: '1px solid rgb(var(--error) / 0.3)',
                  color: 'rgb(var(--error))'
                }
          }>
            {passwordMessage.text}
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              Current Password
            </label>
            <input 
              type="password" 
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              className="input-field" 
              placeholder="••••••••"
              disabled={passwordLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              New Password
            </label>
            <input 
              type="password" 
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              className="input-field" 
              placeholder="••••••••"
              disabled={passwordLoading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              Confirm New Password
            </label>
            <input 
              type="password" 
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              className="input-field" 
              placeholder="••••••••"
              disabled={passwordLoading}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={passwordLoading}>
            {passwordLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
