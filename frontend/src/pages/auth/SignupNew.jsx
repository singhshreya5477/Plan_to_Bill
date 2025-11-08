import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiMail, FiLock, FiUser, FiBriefcase, FiAlertCircle, FiPhone, 
  FiEye, FiEyeOff, FiShield, FiUsers, FiDollarSign, FiCheck,
  FiX
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useCompanyStore } from '../../store/companyStore';

const SignupNew = () => {
  const [formData, setFormData] = useState({
    // Role
    role: '',
    
    // Basic Information
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    
    // Company (from multi-company feature)
    companyName: '',
    isNewCompany: false,
    
    // Admin specific
    adminAccessCode: '',
    
    // Project Manager specific
    department: '',
    employeeId: '',
    hourlyRate: '',
    canApproveExpenses: true,
    
    // Team Member specific
    reportsTo: '',
    designation: '',
    skills: '',
    
    // Sales/Finance specific
    salesFinanceDept: 'sales',
    permissions: {
      createSalesOrders: true,
      createPurchaseOrders: true,
      createInvoices: true,
      createVendorBills: true,
      approveExpenses: false
    },
    
    // Additional Settings
    accountStatus: 'active',
    sendWelcomeEmail: true
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { checkCompanyExists, getCompanyByName, addCompany } = useCompanyStore();

  // Mock data for dropdowns
  const projectManagers = [
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' },
    { id: 3, name: 'Mike Chen' }
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permKey = name.split('.')[1];
      setFormData({
        ...formData,
        permissions: {
          ...formData.permissions,
          [permKey]: checked
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }

    // Clear errors
    setError('');
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError('');
    }
  };

  const validatePassword = () => {
    if (formData.password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');

    // Basic validation
    if (!formData.role) {
      setError('Please select an account type/role');
      return;
    }

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    if (!validatePassword()) {
      return;
    }

    // Role-specific validation
    if (formData.role === 'admin' && !formData.adminAccessCode) {
      setError('Admin Access Code is required for admin accounts');
      return;
    }

    if (formData.role === 'project_manager' && !formData.hourlyRate) {
      setError('Hourly Rate is required for Project Managers');
      return;
    }

    if (formData.role === 'team_member' && !formData.hourlyRate) {
      setError('Hourly Rate is required for Team Members');
      return;
    }

    // Company validation
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return;
    }

    // Check if admin already exists for company
    if (formData.role === 'admin' && !formData.isNewCompany) {
      const company = getCompanyByName(formData.companyName);
      if (company && company.admin_email) {
        setError(`This company already has an admin: ${company.admin_email}`);
        return;
      }
    }

    // Success - create account
    const userData = {
      ...formData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    // Add new company if needed
    if (formData.isNewCompany && formData.role === 'admin') {
      addCompany({
        name: formData.companyName,
        admin_email: formData.email,
        created_at: new Date().toISOString()
      });
    }

    // Auto-login after signup
    login(userData, 'demo-token-' + Date.now());
    navigate('/dashboard');
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case 'admin':
        return (
          <div className="space-y-4">
            <div className="p-4 rounded-lg" style={{ 
              backgroundColor: 'rgb(var(--warning) / 0.1)',
              borderLeft: '4px solid rgb(var(--warning))'
            }}>
              <div className="flex items-start space-x-2">
                <FiShield className="mt-1" style={{ color: 'rgb(var(--warning))' }} />
                <div>
                  <h4 className="font-semibold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                    Admin Access Privileges:
                  </h4>
                  <ul className="text-sm space-y-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                    <li>• Full system access and control</li>
                    <li>• Can manage all users and projects</li>
                    <li>• Access to financial data and reports</li>
                    <li>• System configuration rights</li>
                  </ul>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Admin Access Code *
              </label>
              <div className="relative">
                <FiShield className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                  style={{ color: 'rgb(var(--text-tertiary))' }} />
                <input
                  type="text"
                  name="adminAccessCode"
                  value={formData.adminAccessCode}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="Required for security - obtain from existing admin"
                />
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                (Required for security - obtain from existing admin)
              </p>
            </div>
          </div>
        );

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
                  <option value="IT">IT</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                  <option value="Other">Other</option>
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
                  placeholder="e.g., EMP001"
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
              <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
                (Used for timesheet costing calculations)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="canApproveExpenses"
                name="canApproveExpenses"
                checked={formData.canApproveExpenses}
                onChange={handleChange}
                className="w-4 h-4"
                style={{ accentColor: 'rgb(var(--primary))' }}
              />
              <label htmlFor="canApproveExpenses" className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                Can Approve Expenses?
              </label>
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
                <option value="">Select Project Manager</option>
                {projectManagers.map(pm => (
                  <option key={pm.id} value={pm.id}>{pm.name}</option>
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
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Department *
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="salesFinanceDept"
                    value="sales"
                    checked={formData.salesFinanceDept === 'sales'}
                    onChange={handleChange}
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span style={{ color: 'rgb(var(--text-primary))' }}>Sales</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="salesFinanceDept"
                    value="finance"
                    checked={formData.salesFinanceDept === 'finance'}
                    onChange={handleChange}
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span style={{ color: 'rgb(var(--text-primary))' }}>Finance</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="salesFinanceDept"
                    value="both"
                    checked={formData.salesFinanceDept === 'both'}
                    onChange={handleChange}
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span style={{ color: 'rgb(var(--text-primary))' }}>Both</span>
                </label>
              </div>
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
                placeholder="e.g., EMP001"
              />
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
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl shadow-xl p-8 transition-all" 
          style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--primary))' }}>
              Create New Account
            </h1>
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              Fill in the details below to create your account
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
            
            {/* Account Type / Role */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Account Type / Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="input-field"
                required
              >
                <option value="">Select Role</option>
                <option value="admin">⚡ Admin</option>
                <option value="project_manager">👔 Project Manager</option>
                <option value="team_member">👤 Team Member</option>
                <option value="sales_finance">💼 Sales / Finance</option>
              </select>
            </div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--border-color))' }}></div>
              <span className="px-4 text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                Basic Information
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--border-color))' }}></div>
            </div>

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
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field pl-10"
                  placeholder="John Doe"
                  required
                />
              </div>
            </div>

            {/* Work Email */}
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
                  required
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
                  required
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
                  required
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
              {passwordError && (
                <p className="text-xs mt-1" style={{ color: 'rgb(var(--error))' }}>
                  {passwordError}
                </p>
              )}
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

            {/* Company Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                  Company Name *
                </label>
                <div className="relative">
                  <FiBriefcase className="absolute left-3 top-1/2 transform -translate-y-1/2" 
                    style={{ color: 'rgb(var(--text-tertiary))' }} />
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="Your Company Name"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isNewCompany"
                  name="isNewCompany"
                  checked={formData.isNewCompany}
                  onChange={handleChange}
                  className="w-4 h-4"
                  style={{ accentColor: 'rgb(var(--primary))' }}
                />
                <label htmlFor="isNewCompany" className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                  This is a new company
                </label>
              </div>
            </div>

            {/* Role-Specific Details */}
            {formData.role && (
              <>
                <div className="flex items-center my-6">
                  <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--border-color))' }}></div>
                  <span className="px-4 text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                    Role-Specific Details
                  </span>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--border-color))' }}></div>
                </div>

                {renderRoleSpecificFields()}
              </>
            )}

            {/* Additional Settings */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--border-color))' }}></div>
              <span className="px-4 text-sm font-medium" style={{ color: 'rgb(var(--text-secondary))' }}>
                Additional Settings
              </span>
              <div className="flex-1 h-px" style={{ backgroundColor: 'rgb(var(--border-color))' }}></div>
            </div>

            {/* Account Status */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
                Account Status
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="accountStatus"
                    value="active"
                    checked={formData.accountStatus === 'active'}
                    onChange={handleChange}
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span style={{ color: 'rgb(var(--text-primary))' }}>Active (default)</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="radio"
                    name="accountStatus"
                    value="inactive"
                    checked={formData.accountStatus === 'inactive'}
                    onChange={handleChange}
                    style={{ accentColor: 'rgb(var(--primary))' }}
                  />
                  <span style={{ color: 'rgb(var(--text-primary))' }}>Inactive</span>
                </label>
              </div>
            </div>

            {/* Send Welcome Email */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="sendWelcomeEmail"
                name="sendWelcomeEmail"
                checked={formData.sendWelcomeEmail}
                onChange={handleChange}
                className="w-4 h-4"
                style={{ accentColor: 'rgb(var(--primary))' }}
              />
              <label htmlFor="sendWelcomeEmail" className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
                Send welcome email? Yes, send login credentials to user's email
              </label>
            </div>

            {/* Action Buttons */}
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
                className="flex-1 btn-primary py-3"
              >
                Create Account
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

export default SignupNew;
