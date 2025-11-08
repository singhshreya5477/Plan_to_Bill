import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter email and password');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock user data for demo
      const userData = {
        id: Date.now(),
        name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
        email: email,
        role: email.includes('admin') ? 'admin' : 
              email.includes('manager') ? 'project_manager' : 
              email.includes('sales') || email.includes('finance') ? 'sales_finance' : 
              'team_member'
      };
      
      login(userData, 'demo-token-' + Date.now());
      navigate('/dashboard');
    } catch (error) {
      setError('Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center transition-colors" 
      style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="max-w-md w-full mx-4">
        <div className="rounded-2xl shadow-xl p-8 transition-all" 
          style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--primary))' }}>
              Welcome Back
            </h1>
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              Sign in to OneFlow - Plan to Bill in One Place
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg flex items-center space-x-2" 
              style={{ backgroundColor: 'rgb(var(--error) / 0.1)' }}>
              <FiAlertCircle style={{ color: 'rgb(var(--error))' }} />
              <span className="text-sm" style={{ color: 'rgb(var(--error))' }}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" 
                style={{ color: 'rgb(var(--text-primary))' }}>
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="john@company.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" 
                style={{ color: 'rgb(var(--text-primary))' }}>
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-80 transition-opacity"
                  style={{ color: 'rgb(var(--text-tertiary))' }}
                  disabled={isLoading}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  className="w-4 h-4"
                  style={{ accentColor: 'rgb(var(--primary))' }}
                  disabled={isLoading}
                />
                <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Remember me
                </span>
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm hover:underline"
                style={{ color: 'rgb(var(--primary))' }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  <span>Signing in...</span>
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6 flex items-center">
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--border-color))' }}></div>
            <span className="px-4 text-sm" style={{ color: 'rgb(var(--text-tertiary))' }}>
              Don't have an account?
            </span>
            <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--border-color))' }}></div>
          </div>

          {/* Signup Link */}
          <Link 
            to="/signup" 
            className="block w-full text-center py-3 px-4 rounded-lg font-medium transition-all"
            style={{ 
              backgroundColor: 'rgb(var(--bg-primary))',
              color: 'rgb(var(--primary))',
              border: '2px solid rgb(var(--primary))'
            }}
          >
            Create New Account
          </Link>

          {/* Demo Info */}
          <div className="mt-6 p-4 rounded-lg" 
            style={{ backgroundColor: 'rgb(var(--primary) / 0.05)' }}>
            <p className="text-xs text-center" style={{ color: 'rgb(var(--text-tertiary))' }}>
              <strong>Demo:</strong> Use any email and password to sign in
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
