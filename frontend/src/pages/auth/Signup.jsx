import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiCheckCircle, FiZap, FiShield, FiUsers, FiTrendingUp, FiClock, FiAward } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import authService from '../../services/authService';
import ThemeToggle from '../../components/common/ThemeToggle';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    department: '',
    termsAccepted: false
  });
  
  const [passwordStrength, setPasswordStrength] = useState({ level: '', score: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ checking: false, available: null, message: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const benefits = [
    { icon: FiZap, text: 'Set up in minutes', color: '#fb923c' },
    { icon: FiUsers, text: 'Unlimited team members', color: '#a855f7' },
    { icon: FiShield, text: 'Enterprise-grade security', color: '#f43f5e' },
    { icon: FiTrendingUp, text: 'Advanced analytics', color: '#14b8a6' },
    { icon: FiClock, text: 'Time tracking built-in', color: '#06b6d4' },
    { icon: FiAward, text: 'Real-time collaboration', color: '#6366f1' }
  ];

  // Password strength calculator
  const calculatePasswordStrength = (password) => {
    if (!password) return { level: '', score: 0 };
    
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[^A-Za-z0-9]/.test(password)
    };

    if (checks.length) score += 20;
    if (checks.lowercase) score += 20;
    if (checks.uppercase) score += 20;
    if (checks.number) score += 20;
    if (checks.special) score += 20;

    let level = '';
    if (score < 40) level = 'weak';
    else if (score < 80) level = 'medium';
    else level = 'strong';

    return { level, score };
  };

  // Email availability check with debounce
  const checkEmailAvailability = useCallback(async (email) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus({ checking: false, available: null, message: '' });
      return;
    }

    setEmailStatus({ checking: true, available: null, message: 'Checking...' });

    // Simulate API call with delay
    setTimeout(() => {
      // Demo: emails ending with 'taken@example.com' are considered unavailable
      const isAvailable = !email.toLowerCase().includes('taken');
      
      setEmailStatus({
        checking: false,
        available: isAvailable,
        message: isAvailable ? '✓ Email is available' : '✗ Email already exists'
      });
    }, 800);
  }, []);

  // Debounced email check
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email) {
        checkEmailAvailability(formData.email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email, checkEmailAvailability]);

  // Update password strength on password change
  useEffect(() => {
    const strength = calculatePasswordStrength(formData.password);
    setPasswordStrength(strength);
  }, [formData.password]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) errors.email = 'Invalid email format';
    else if (emailStatus.available === false) errors.email = 'Email already exists';
    
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    else if (!/^\+?[0-9]{10,15}$/.test(formData.phone.replace(/[\s-]/g, ''))) {
      errors.phone = 'Invalid phone number';
    }
    
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 8) errors.password = 'Password must be at least 8 characters';
    
    if (!formData.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    if (!formData.termsAccepted) errors.terms = 'You must accept the terms and conditions';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      setError('Please fix the errors above');
      return;
    }

    setIsLoading(true);

    try {
      // Split full name into first and last name
      const nameParts = formData.fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || nameParts[0] || 'User';

      // Register user via API
      const response = await authService.register({
        email: formData.email,
        password: formData.password,
        firstName,
        lastName,
        role: 'team_member', // Default role
        phone: formData.phone,
      });

      if (response.success) {
        // Show OTP verification modal
        setShowOTPModal(true);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setOtpError('');

    if (!otp || otp.length !== 6) {
      setOtpError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.verifyEmail(formData.email, otp);

      if (response.success) {
        // Show success message and redirect to login
        alert(response.message);
        
        // Navigate to login page
        navigate('/login');
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      setOtpError(err.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      await authService.resendOTP(formData.email);
      alert('OTP has been resent to your email');
    } catch (err) {
      alert(err.message || 'Failed to resend OTP');
    }
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.level === 'weak') return '#ef4444'; // red
    if (passwordStrength.level === 'medium') return '#f59e0b'; // orange
    if (passwordStrength.level === 'strong') return '#10b981'; // green
    return 'rgb(var(--border))';
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" 
      style={{ background: 'linear-gradient(180deg,#ffffff,#fbf8ff)' }}>
      
      {/* Theme Toggle - Fixed Top Right */}
      <div className="fixed top-6 right-6 z-50">
        <ThemeToggle />
      </div>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-18 gradient-bg-purple animate-float" style={{ filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-12 gradient-bg-primary" style={{ filter: 'blur(90px)', animation: 'float 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 gradient-bg-purple" style={{ filter: 'blur(90px)', animation: 'float 12s ease-in-out infinite' }} />
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-10 gradient-bg-primary" style={{ filter: 'blur(80px)', animation: 'float 8s ease-in-out infinite' }} />
      </div>

      {/* Left Side - Benefits */}
  <div className="hidden lg:flex lg:w-1/2 relative z-10 p-12 flex-col justify-center">
        <Link to="/landing" className="flex items-center space-x-3 mb-12 animate-slide-in-right">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg" style={{ background: '#ffffff', color: '#6D28D9', border: '1px solid #eee' }}>
            P2B
          </div>
          <span className="text-3xl font-bold" style={{ color: '#2b2540' }}>Plan-to-Bill</span>
        </Link>

        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6 animate-slide-up" style={{ color: '#2b2540' }}>
            Start Your Journey
          </h1>
          <p className="text-xl mb-8 animate-slide-up delay-100" style={{ color: '#6b677d' }}>
            Join thousands of teams managing their projects efficiently with Plan-to-Bill
          </p>

          <div className="space-y-4 mb-8">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center space-x-4 p-4 rounded-xl transition-all hover-lift cursor-pointer animate-slide-in-right"
                style={{ 
                  backgroundColor: 'rgb(var(--bg-secondary))',
                  animationDelay: `${index * 0.1}s`,
                  border: '1px solid rgb(var(--border-color))'
                }}
              >
                <div 
                  className="w-12 h-12 rounded-lg flex items-center justify-center shadow-lg flex-shrink-0"
                  style={{ background: `linear-gradient(135deg, ${benefit.color}, ${benefit.color}dd)` }}
                >
                  <benefit.icon className="w-6 h-6 text-white" />
                </div>
                <span className="font-medium text-lg" style={{ color: 'rgb(var(--text-primary))' }}>
                  {benefit.text}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
        <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl shadow-2xl p-8 animate-slide-up" 
            style={{ background: '#ffffff', border: '1px solid rgba(107,103,125,0.06)' }}>
            
            {/* Mobile Logo */}
            <Link to="/landing" className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center text-white font-bold">
                P2B
              </div>
              <span className="text-2xl font-bold gradient-text-primary">Plan-to-Bill</span>
            </Link>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#2b2540' }}>
                Create Account
              </h2>
              <p style={{ color: '#6b677d' }}>
                Get started with Plan-to-Bill today
              </p>
            </div>

            {/* Signup Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Full Name *
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: '#a99fd6' }} />
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  style={fieldErrors.fullName ? { borderColor: '#ef4444' } : {}}
                />
              </div>
              {fieldErrors.fullName && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{fieldErrors.fullName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Email Address *
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: '#a99fd6' }} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="you@example.com"
                  style={fieldErrors.email ? { borderColor: '#ef4444' } : {}}
                />
                {emailStatus.checking && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin h-4 w-4 border-2 rounded-full" 
                      style={{ 
                        borderColor: '#6D28D9',
                        borderTopColor: 'transparent'
                      }} />
                  </div>
                )}
                {!emailStatus.checking && emailStatus.available === true && (
                  <FiCheckCircle className="absolute right-3 top-1/2 transform -translate-y-1/2" 
                    style={{ color: '#10b981' }} />
                )}
                {!emailStatus.checking && emailStatus.available === false && (
                  <FiAlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2" 
                    style={{ color: '#ef4444' }} />
                )}
              </div>
              {emailStatus.message && !fieldErrors.email && (
                <p className="text-xs mt-1" 
                  style={{ color: emailStatus.available ? '#10b981' : '#ef4444' }}>
                  {emailStatus.message}
                </p>
              )}
              {fieldErrors.email && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{fieldErrors.email}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Phone Number *
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: '#a99fd6' }} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="+91 9876543210"
                  style={fieldErrors.phone ? { borderColor: '#ef4444' } : {}}
                />
              </div>
              {fieldErrors.phone && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{fieldErrors.phone}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Password *
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: '#a99fd6' }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  style={fieldErrors.password ? { borderColor: '#ef4444' } : {}}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                  style={{ color: 'rgb(var(--text-tertiary))' }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {formData.password && (
                  <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs" style={{ color: 'rgb(var(--text-secondary))' }}>
                      Password strength
                    </span>
                    <span className="text-xs font-medium capitalize" 
                      style={{ color: getPasswordStrengthColor() }}>
                      {passwordStrength.level}
                    </span>
                  </div>
                    <div className="h-1.5 w-full rounded-full overflow-hidden" 
                    style={{ backgroundColor: '#f1edf9' }}>
                    <div 
                      className="h-full transition-all duration-300 ease-in-out"
                      style={{ 
                        width: `${passwordStrength.score}%`,
                        backgroundColor: getPasswordStrengthColor()
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    Use 8+ characters with mix of letters, numbers & symbols
                  </p>
                </div>
              )}
              
              {fieldErrors.password && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{fieldErrors.password}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Confirm Password *
              </label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: '#a99fd6' }} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  style={fieldErrors.confirmPassword ? { borderColor: '#ef4444' } : {}}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-70"
                  style={{ color: 'rgb(var(--text-tertiary))' }}
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="text-xs mt-1 flex items-center" style={{ color: '#10b981' }}>
                  <FiCheck className="mr-1" /> Passwords match
                </p>
              )}
              {fieldErrors.confirmPassword && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{fieldErrors.confirmPassword}</p>
              )}
            </div>

            {/* Department (Optional) */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Department <span style={{ color: 'rgb(var(--text-tertiary))' }}>(Optional)</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select department</option>
                <option value="engineering">Engineering</option>
                <option value="product">Product</option>
                <option value="design">Design</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="finance">Finance</option>
                <option value="hr">Human Resources</option>
                <option value="operations">Operations</option>
              </select>
            </div>

            {/* Terms & Conditions */}
            <div>
              <label className="flex items-start space-x-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="termsAccepted"
                  checked={formData.termsAccepted}
                  onChange={handleChange}
                  className="mt-1 w-4 h-4 rounded"
                  style={{ 
                    accentColor: '#6D28D9',
                    ...(fieldErrors.terms ? { outline: '2px solid #ef4444' } : {})
                  }}
                />
                <span className="text-sm flex-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                  I agree to the{' '}
                  <a href="#" className="font-medium hover:opacity-80 transition-opacity" 
                    style={{ color: 'rgb(var(--primary))' }}>
                    Terms & Conditions
                  </a>
                  {' '}and{' '}
                  <a href="#" className="font-medium hover:opacity-80 transition-opacity" 
                    style={{ color: 'rgb(var(--primary))' }}>
                    Privacy Policy
                  </a>
                </span>
              </label>
              {fieldErrors.terms && (
                <p className="text-xs mt-1 ml-7" style={{ color: '#ef4444' }}>{fieldErrors.terms}</p>
              )}
            </div>

            {/* Global Error */}
            {error && (
              <div className="px-4 py-3 rounded-lg text-sm flex items-start" 
                style={{ backgroundColor: 'rgb(239 68 68 / 0.1)', color: '#dc2626' }}>
                <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              className="w-full py-3 font-medium text-lg rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(90deg,#6D28D9,#8B5CF6)', color: '#fff', boxShadow: '0 8px 30px rgba(109,40,217,0.12)' }}
              disabled={isLoading || emailStatus.checking || emailStatus.available === false}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating Account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Login Link */}
            <p className="mt-6 text-center text-sm" style={{ color: '#6b677d' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:opacity-80 transition-opacity" 
                style={{ color: '#6D28D9' }}>
              Sign in
            </Link>
          </p>
          </div>
        </div>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full animate-slide-up">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full gradient-bg-primary mx-auto mb-4 flex items-center justify-center">
                <FiMail className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#2b2540' }}>
                Verify Your Email
              </h3>
              <p style={{ color: '#6b677d' }}>
                We've sent a 6-digit code to<br />
                <strong>{formData.email}</strong>
              </p>
            </div>

            <form onSubmit={handleOTPSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setOtp(value);
                    setOtpError('');
                  }}
                  className="input-field text-center text-2xl tracking-widest"
                  placeholder="000000"
                  maxLength="6"
                  autoFocus
                />
                {otpError && (
                  <p className="text-xs mt-1.5 text-center" style={{ color: '#ef4444' }}>
                    {otpError}
                  </p>
                )}
              </div>

              <button 
                type="submit" 
                className="w-full py-3 font-medium rounded-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(90deg,#6D28D9,#8B5CF6)', color: '#fff' }}
                disabled={isLoading || otp.length !== 6}
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>

              <div className="text-center">
                <p className="text-sm" style={{ color: '#6b677d' }}>
                  Didn't receive the code?{' '}
                  <button 
                    type="button"
                    onClick={handleResendOTP}
                    className="font-medium hover:opacity-80 transition-opacity" 
                    style={{ color: '#6D28D9' }}
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
