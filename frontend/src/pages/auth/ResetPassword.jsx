import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiLock, FiArrowLeft, FiCheck, FiMail } from 'react-icons/fi';
import authService from '../../services/authService';
import ThemeToggle from '../../components/common/ThemeToggle';

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const emailFromState = location.state?.email || '';

  const [formData, setFormData] = useState({
    email: emailFromState,
    otp: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate
    if (!formData.email) {
      setError('Email is required');
      return;
    }

    if (!formData.otp || formData.otp.length !== 6) {
      setError('Please enter the 6-digit code');
      return;
    }

    if (!formData.newPassword || formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.resetPassword(
        formData.email,
        formData.otp,
        formData.newPassword
      );
      
      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.message || 'Failed to reset password');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'rgb(var(--bg-primary))' }}>
        {/* Theme Toggle - Fixed Top Right */}
        <div className="fixed top-6 right-6 z-50">
          <ThemeToggle />
        </div>
        
        <div className="card max-w-md w-full">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgb(var(--success) / 0.1)' }}>
              <FiCheck className="w-8 h-8" style={{ color: 'rgb(var(--success))' }} />
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>Password Reset Successful!</h2>
            <p className="mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
              Your password has been reset. Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'rgb(var(--bg-primary))' }}>
      {/* Theme Toggle - Fixed Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      <div className="card max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>Reset Password</h1>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>
            Enter the code sent to your email and create a new password
          </p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-lg mb-6" style={{ 
            background: 'rgb(var(--error) / 0.1)', 
            border: '1px solid rgb(var(--error) / 0.3)',
            color: 'rgb(var(--error))'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiMail style={{ color: 'rgb(var(--text-tertiary))' }} />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              Reset Code
            </label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              className="input-field text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
              maxLength="6"
              required
              disabled={loading}
            />
            <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>Enter the 6-digit code from your email</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock style={{ color: 'rgb(var(--text-tertiary))' }} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiLock style={{ color: 'rgb(var(--text-tertiary))' }} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="input-field pl-10"
                placeholder="••••••••"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="showPassword"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              className="h-4 w-4 rounded"
              style={{ 
                accentColor: 'rgb(var(--primary))',
                borderColor: 'rgb(var(--border-color))'
              }}
            />
            <label htmlFor="showPassword" className="ml-2 block text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
              Show password
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center font-medium hover:opacity-80 transition-opacity"
              style={{ color: 'rgb(var(--primary))' }}
            >
              <FiArrowLeft className="mr-2" />
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
