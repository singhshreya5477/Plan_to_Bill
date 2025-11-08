import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, FiCheck, FiAlertCircle, FiCheckCircle, FiZap, FiShield, FiUsers, FiTrendingUp, FiClock, FiAward } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    department: '',
    termsAccepted: false
  });
  
  const [passwordStrength, setPasswordStrength] = useState({ level: '', score: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailStatus, setEmailStatus] = useState({ checking: false, available: null, message: '' });
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const benefits = [
    { icon: FiZap, text: 'Set up in minutes', color: '#fb923c' },
    { icon: FiUsers, text: 'Unlimited team members', color: '#a855f7' },
    { icon: FiShield, text: 'Enterprise-grade security', color: '#f43f5e' },
    { icon: FiTrendingUp, text: 'Advanced analytics', color: '#14b8a6' },
    { icon: FiClock, text: 'Time tracking built-in', color: '#06b6d4' },
    { icon: FiAward, text: '14-day free trial', color: '#6366f1' }
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
    
    if (!formData.role) errors.role = 'Please select a role';
    
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

    // If admin role, show info message but continue
    if (formData.role === 'admin') {
      // In production, this would trigger an approval workflow
      console.log('Admin signup - requires approval');
    }

    // Demo signup - in production, call your API
    const userData = {
      id: Date.now(),
      name: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      role: formData.role,
      department: formData.department || 'Not specified',
      company: 'OneFlow', // Single company name
      requiresApproval: formData.role === 'admin'
    };
    
    login(userData, 'demo-token-123');
    
    // Navigate based on role
    if (formData.role === 'admin') {
      // In production, show approval pending message
      navigate('/dashboard?pending=true');
    } else {
      navigate('/dashboard');
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
      style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full opacity-20 gradient-bg-purple animate-float" style={{ filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-20 gradient-bg-pink" style={{ filter: 'blur(90px)', animation: 'float 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-15 gradient-bg-blue" style={{ filter: 'blur(80px)', animation: 'float 12s ease-in-out infinite' }} />
        <div className="absolute top-20 right-20 w-64 h-64 rounded-full opacity-25 gradient-bg-teal" style={{ filter: 'blur(70px)', animation: 'float 8s ease-in-out infinite' }} />
      </div>

      {/* Left Side - Benefits */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 p-12 flex-col justify-center">
        <Link to="/landing" className="flex items-center space-x-3 mb-12 animate-slide-in-right">
          <div className="w-12 h-12 rounded-xl gradient-bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg">
            P2B
          </div>
          <span className="text-3xl font-bold gradient-text-primary">Plan-to-Bill</span>
        </Link>

        <div className="max-w-md">
          <h1 className="text-5xl font-bold mb-6 animate-slide-up" style={{ color: 'rgb(var(--text-primary))' }}>
            Start Your Free Trial Today
          </h1>
          <p className="text-xl mb-8 animate-slide-up delay-100" style={{ color: 'rgb(var(--text-secondary))' }}>
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

          <div className="p-6 rounded-xl glass-effect backdrop-blur-xl border border-white/20 shadow-xl animate-fade-in delay-500">
            <p className="text-sm mb-2" style={{ color: 'rgb(var(--text-secondary))' }}>
              💬 "Plan-to-Bill transformed how we manage projects. The billing integration alone saved us 10 hours per week!"
            </p>
            <div className="flex items-center space-x-3 mt-4">
              <div className="w-10 h-10 rounded-full gradient-bg-vibrant flex items-center justify-center text-white font-bold">
                JD
              </div>
              <div>
                <p className="font-semibold text-sm" style={{ color: 'rgb(var(--text-primary))' }}>John Doe</p>
                <p className="text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>Project Manager, Tech Corp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 relative z-10 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl shadow-2xl p-8 animate-slide-up" 
            style={{ backgroundColor: 'rgb(var(--bg-secondary))', border: '1px solid rgb(var(--border-color))' }}>
            
            {/* Mobile Logo */}
            <Link to="/landing" className="lg:hidden flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl gradient-bg-primary flex items-center justify-center text-white font-bold">
                P2B
              </div>
              <span className="text-2xl font-bold gradient-text-primary">Plan-to-Bill</span>
            </Link>

            {/* Header */}
            <div className="mb-6">
              <h2 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Create Account
              </h2>
              <p style={{ color: 'rgb(var(--text-secondary))' }}>
                Get started with your 14-day free trial
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
                  style={{ color: 'rgb(var(--text-tertiary))' }} />
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
                  style={{ color: 'rgb(var(--text-tertiary))' }} />
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
                        borderColor: 'rgb(var(--primary))',
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
                  style={{ color: 'rgb(var(--text-tertiary))' }} />
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
                  style={{ color: 'rgb(var(--text-tertiary))' }} />
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
                    style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
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
                  style={{ color: 'rgb(var(--text-tertiary))' }} />
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

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
                style={fieldErrors.role ? { borderColor: '#ef4444' } : {}}
              >
                <option value="">Select your role</option>
                <option value="team_member">Team Member</option>
                <option value="project_manager">Project Manager</option>
                <option value="sales_finance">Sales/Finance</option>
                <option value="admin">Admin</option>
              </select>
              {formData.role === 'admin' && (
                <p className="text-xs mt-1 flex items-start" style={{ color: '#f59e0b' }}>
                  <FiAlertCircle className="mr-1 mt-0.5 flex-shrink-0" />
                  <span>Admin accounts require approval before access</span>
                </p>
              )}
              {fieldErrors.role && (
                <p className="text-xs mt-1" style={{ color: '#ef4444' }}>{fieldErrors.role}</p>
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
                    accentColor: 'rgb(var(--primary))',
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
              className="w-full btn-primary py-3 font-medium text-lg"
              disabled={emailStatus.checking || emailStatus.available === false}
            >
              Start Free Trial
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-medium hover:opacity-80 transition-opacity" 
              style={{ color: 'rgb(var(--primary))' }}>
              Sign in
            </Link>
          </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
