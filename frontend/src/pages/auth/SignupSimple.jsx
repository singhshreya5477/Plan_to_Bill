import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff, 
  FiAlertCircle, FiBriefcase, FiDollarSign, FiUsers
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';

const Signup = () => {
  const [formData, setFormData] = useState({
    // Basic Information
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Role Selection
    role: 'team_member',
    
    // Role-specific fields
    department: '',
    designation: '',
    hourlyRate: '',
    employeeId: '',
    reportsTo: '',
    skills: '',
    
    // Sales/Finance permissions
    permissions: {
      createSalesOrders: false,
      createPurchaseOrders: false,
      createInvoices: false,
      createVendorBills: false,
      approveExpenses: false
    }
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  // Mock data
  const departments = ['IT', 'Marketing', 'Sales', 'Operations', 'Finance', 'HR', 'Other'];
  const managers = [
    { id: 1, name: 'John Smith - Project Manager' },
    { id: 2, name: 'Sarah Johnson - Team Lead' },
    { id: 3, name: 'Mike Chen - Senior Manager' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permKey]: checked
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    setError('');
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return false;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Invalid email format');
      return false;
    }

    if (!formData.password) {
      setError('Password is required');
      return false;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.role) {
      setError('Please select a role');
      return false;
    }

    // Role-specific validation
    if ((formData.role === 'project_manager' || formData.role === 'team_member') && !formData.hourlyRate) {
      setError('Hourly rate is required for this role');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Create user account
      const newUser = {
        id: Date.now(),
        name: formData.fullName,
        email: formData.email,
        role: formData.role,
        phone: formData.phone,
        department: formData.department,
        designation: formData.designation,
        hourlyRate: formData.hourlyRate,
        employeeId: formData.employeeId,
        reportsTo: formData.reportsTo,
        skills: formData.skills,
        permissions: formData.permissions,
        createdAt: new Date().toISOString()
      };

      // Auto-login
      login(newUser, 'demo-token-' + Date.now());
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'project_manager':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Employee ID (Optional)
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="EMP001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Hourly Rate (₹) *
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="1500"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" 
                  style={{ color: 'rgb(var(--text-tertiary))' }}>
                  /hour
                </span>
              </div>
            </div>
          </div>
        );

      case 'team_member':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Reports To (Manager)
              </label>
              <select
                name="reportsTo"
                value={formData.reportsTo}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select Manager</option>
                {managers.map(manager => (
                  <option key={manager.id} value={manager.id}>{manager.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Developer, Designer, QA Engineer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Hourly Rate (₹) *
              </label>
              <div className="relative">
                <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type="number"
                  name="hourlyRate"
                  value={formData.hourlyRate}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="1000"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" 
                  style={{ color: 'rgb(var(--text-tertiary))' }}>
                  /hour
                </span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Skills/Specialization (Optional)
              </label>
              <input
                type="text"
                name="skills"
                value={formData.skills}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., React, Python, UI/UX Design"
              />
            </div>
          </div>
        );

      case 'sales_finance':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select Department</option>
                  <option value="Sales">Sales</option>
                  <option value="Finance">Finance</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Employee ID (Optional)
                </label>
                <input
                  type="text"
                  name="employeeId"
                  value={formData.employeeId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="EMP001"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Permissions
              </label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="permissions.createSalesOrders"
                    checked={formData.permissions.createSalesOrders}
                    onChange={handleChange}
                    className="w-4 h-4"
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                    Can create Sales Orders
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="permissions.createPurchaseOrders"
                    checked={formData.permissions.createPurchaseOrders}
                    onChange={handleChange}
                    className="w-4 h-4"
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                    Can create Purchase Orders
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="permissions.createInvoices"
                    checked={formData.permissions.createInvoices}
                    onChange={handleChange}
                    className="w-4 h-4"
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                    Can create Customer Invoices
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="permissions.createVendorBills"
                    checked={formData.permissions.createVendorBills}
                    onChange={handleChange}
                    className="w-4 h-4"
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                    Can create Vendor Bills
                  </span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="permissions.approveExpenses"
                    checked={formData.permissions.approveExpenses}
                    onChange={handleChange}
                    className="w-4 h-4"
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                    Can approve expenses
                  </span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4 transition-colors overflow-y-auto" 
      style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="max-w-2xl mx-auto">
        <div className="rounded-2xl shadow-xl p-8 transition-all" 
          style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--primary))' }}>
              Create Your Account
            </h1>
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              Join OneFlow - Plan to Bill in One Place
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
            
            {/* Basic Information Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
                Basic Information
              </h3>

              <div className="space-y-4">
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
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                    Work Email *
                  </label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="john@company.com"
                    />
                  </div>
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
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="input-field pl-10 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'rgb(var(--text-tertiary))' }}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    Must be at least 8 characters
                  </p>
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
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="input-field pl-10 pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      style={{ color: 'rgb(var(--text-tertiary))' }}
                    >
                      {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                    Phone Number (Optional)
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
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Role Selection Section */}
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'rgb(var(--text-primary))' }}>
                Role & Department
              </h3>

              <div className="space-y-4">
                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                    Your Role *
                  </label>
                  <div className="relative">
                    <FiUsers className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                      style={{ color: 'rgb(var(--text-tertiary))' }} />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="input-field pl-10"
                    >
                      <option value="team_member">Team Member</option>
                      <option value="project_manager">Project Manager</option>
                      <option value="sales_finance">Sales / Finance</option>
                    </select>
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                    {formData.role === 'team_member' && 'View tasks, log hours, submit expenses'}
                    {formData.role === 'project_manager' && 'Create projects, manage team, approve expenses'}
                    {formData.role === 'sales_finance' && 'Manage sales orders, invoices, and bills'}
                  </p>
                </div>

                {/* Role-Specific Fields */}
                {renderRoleSpecificFields()}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6">
              <Link
                to="/login"
                className="flex-1 py-3 px-4 rounded-lg font-medium transition-all text-center"
                style={{ 
                  backgroundColor: 'rgb(var(--bg-primary))',
                  color: 'rgb(var(--text-primary))',
                  border: '2px solid rgb(var(--border-color))'
                }}
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 btn-primary py-3 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Creating Account...</span>
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="font-medium hover:underline"
                style={{ color: 'rgb(var(--primary))' }}
              >
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
