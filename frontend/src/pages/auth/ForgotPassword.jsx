import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheck } from 'react-icons/fi';
import authService from '../../services/authService';
import ThemeToggle from '../../components/common/ThemeToggle';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authService.forgotPassword(email);
      
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.message || 'Failed to send reset code');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset code');
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
            <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>Check Your Email</h2>
            <p className="mb-6" style={{ color: 'rgb(var(--text-secondary))' }}>
              We've sent a password reset code to <strong>{email}</strong>
            </p>
            <Link
              to="/reset-password"
              state={{ email }}
              className="btn-primary w-full"
            >
              Enter Reset Code
            </Link>
            <Link
              to="/login"
              className="block mt-4 text-primary-600 hover:text-primary-700 font-medium"
            >
              Back to Login
            </Link>
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
          <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>Forgot Password?</h1>
          <p style={{ color: 'rgb(var(--text-secondary))' }}>
            Enter your email and we'll send you a code to reset your password
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? 'Sending...' : 'Send Reset Code'}
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

export default ForgotPassword;
