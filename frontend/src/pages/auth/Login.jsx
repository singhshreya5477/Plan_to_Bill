import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiEye, FiEyeOff, FiAlertCircle, FiArrowRight, FiZap, FiShield, FiUsers } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/authService';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({ ...prev, email: rememberedEmail, rememberMe: true }));
    }
  }, []);

  // Email validation
  const validateEmail = (email) => {
    if (!email) {
      setEmailError('');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Password validation
  const validatePassword = (password) => {
    if (!password) {
      setPasswordError('');
      return false;
    }
    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear errors when user starts typing
    if (name === 'email') {
      setEmailError('');
      setError('');
    }
    if (name === 'password') {
      setPasswordError('');
      setError('');
    }
  };

  const handleEmailBlur = () => {
    validateEmail(formData.email);
  };

  const handlePasswordBlur = () => {
    validatePassword(formData.password);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setEmailError('');
    setPasswordError('');

    // Validate fields
    const isEmailValid = validateEmail(formData.email);
    const isPasswordValid = validatePassword(formData.password);

    if (!isEmailValid || !isPasswordValid) {
      if (!formData.email) setEmailError('Email is required');
      if (!formData.password) setPasswordError('Password is required');
      return;
    }

    setIsLoading(true);

    try {
      // Call the real API
      const response = await authService.login(formData.email, formData.password);
      
      if (response.success) {
        // Handle remember me
        if (formData.rememberMe) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        // Update auth store
        login(response.data.user, response.data.token);
        
        // Navigate to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" 
      style={{ background: 'linear-gradient(180deg,#ffffff,#fbf7ff)' }}>
      
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-18 animate-float gradient-bg-purple"
          style={{ filter: 'blur(120px)' }}
        />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-12 gradient-bg-primary"
          style={{ 
            filter: 'blur(90px)',
            animation: 'float 8s ease-in-out infinite reverse'
          }}
        />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 gradient-bg-purple"
          style={{ 
            filter: 'blur(90px)',
            animation: 'float 10s ease-in-out infinite'
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full opacity-10 gradient-bg-primary"
          style={{ 
            filter: 'blur(90px)',
            animation: 'float 12s ease-in-out infinite'
          }}
        />
      </div>

      {/* Left Side - Info */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 p-12 flex-col justify-center">
        <Link to="/landing" className="flex items-center space-x-3 mb-12 animate-slide-in-right">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ background: '#ffffff', color: '#6D28D9', border: '1px solid #eee' }}>
            P2B
          </div>
          <span className="text-3xl font-bold" style={{ color: '#2b2540' }}>Plan-to-Bill</span>
        </Link>

        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6 animate-slide-up" style={{ color: '#2b2540' }}>
            Welcome Back to Your Workspace
          </h1>
          <p className="text-xl mb-8 animate-slide-up delay-100" style={{ color: '#6b677d' }}>
            Continue managing your projects, tracking time, and billing clients—all in one place.
          </p>

          <div className="space-y-4 mb-8">
            <div className="flex items-center space-x-4 p-4 rounded-xl transition-all hover-lift animate-slide-in-right"
              style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))', animationDelay: '0s' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #fb923c, #fb923cdd)' }}>
                <FiZap className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-lg" style={{ color: 'rgb(var(--text-primary))' }}>
                Access your projects instantly
              </span>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-xl transition-all hover-lift animate-slide-in-right"
              style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))', animationDelay: '0.1s' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #a855f7, #a855f7dd)' }}>
                <FiUsers className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-lg" style={{ color: 'rgb(var(--text-primary))' }}>
                Collaborate with your team
              </span>
            </div>

            <div className="flex items-center space-x-4 p-4 rounded-xl transition-all hover-lift animate-slide-in-right"
              style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))', animationDelay: '0.2s' }}>
              <div className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #14b8a6, #14b8a6dd)' }}>
                <FiShield className="w-6 h-6 text-white" />
              </div>
              <span className="font-medium text-lg" style={{ color: 'rgb(var(--text-primary))' }}>
                Your data is always secure
              </span>
            </div>
          </div>

          <div className="p-6 rounded-xl glass-effect backdrop-blur-xl border border-white/20 shadow-xl animate-fade-in delay-500">
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              ⚡ <strong>Quick Tip:</strong> Use keyboard shortcuts to navigate faster. Press <kbd className="px-2 py-1 rounded bg-white/10 font-mono text-xs">Ctrl+K</kbd> to open command palette.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 lg:p-12">
          <div className="max-w-md w-full">
          <div className="rounded-2xl shadow-2xl p-8 transition-all animate-slide-up hover-lift" 
            style={{ background: '#ffffff', border: '1px solid rgba(107,103,125,0.06)' }}>
            
            {/* Mobile Logo */}
            <Link to="/landing" className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center text-white font-bold">
                P2B
              </div>
              <span className="text-2xl font-bold gradient-text-primary">Plan-to-Bill</span>
            </Link>

            {/* Header */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#2b2540' }}>
                Sign In
              </h2>
              <p style={{ color: '#6b677d' }}>
                Welcome back! Please enter your details
              </p>
            </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Work Email */}
            <div className="animate-slide-in-right delay-100">
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Work Email
              </label>
              <div className="relative group">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-all group-hover:scale-110" 
                  style={{ color: '#a99fd6' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  onBlur={handleEmailBlur}
                  className="input-field pl-10 transition-all focus:scale-[1.02]"
                  placeholder="Enter your email"
                  style={emailError ? { borderColor: '#ef4444' } : {}}
                />
              </div>
              {emailError && (
                <p className="text-xs mt-1.5 flex items-center" style={{ color: '#3b82f6' }}>
                  <span className="mr-1">ℹ</span> {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="animate-slide-in-right delay-200">
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Password
              </label>
              <div className="relative group">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-all group-hover:scale-110" 
                  style={{ color: '#a99fd6' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handlePasswordBlur}
                  className="input-field pl-10 pr-12 transition-all focus:scale-[1.02]"
                  placeholder="Enter your password"
                  style={passwordError ? { borderColor: '#ef4444' } : {}}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70 transition-opacity"
                  style={{ color: '#a99fd6' }}
                >
                  {showPassword ? (
                    <span className="flex items-center text-xs font-medium">
                      <FiEyeOff className="mr-1" /> Hide
                    </span>
                  ) : (
                    <span className="flex items-center text-xs font-medium">
                      <FiEye className="mr-1" /> Show
                    </span>
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-xs mt-1.5 flex items-center" style={{ color: '#3b82f6' }}>
                  <span className="mr-1">ℹ</span> {passwordError}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="w-4 h-4 rounded"
                  style={{ accentColor: '#6D28D9' }}
                />
                <span className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
                  Remember me
                </span>
              </label>
              <Link 
                to="/forgot-password"
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'rgb(var(--primary))' }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm flex items-start" 
                style={{ backgroundColor: 'rgb(239 68 68 / 0.1)', color: '#dc2626' }}>
                <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <div>
                  <strong className="font-medium">Error</strong>
                  <p className="mt-0.5">• {error}</p>
                </div>
              </div>
            )}

            {/* Sign In Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full py-3 font-medium flex items-center justify-center group rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(90deg,#6D28D9,#8B5CF6)', color: '#fff', boxShadow: '0 8px 30px rgba(109,40,217,0.12)' }}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: 'rgb(var(--border))' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4" style={{ 
                backgroundColor: 'rgb(var(--bg-secondary))',
                color: 'rgb(var(--text-tertiary))'
              }}>
                or
              </span>
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className="font-semibold hover:opacity-80 transition-opacity" 
                style={{ color: 'rgb(var(--primary))' }}
              >
                Sign Up
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: 'rgb(var(--border))' }}>
            <p className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>
              © 2025 Plan-to-Bill. All rights reserved.
            </p>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
