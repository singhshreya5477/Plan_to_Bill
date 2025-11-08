import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiBriefcase, FiUser, FiMail, FiLock, FiMapPin, FiDollarSign, 
  FiClock, FiCalendar, FiCheck, FiX, FiChevronLeft, FiChevronRight,
  FiGlobe, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useCompanyStore } from '../../store/companyStore';

const CompanySignup = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1: Company Information
    companyName: '',
    companySlug: '',
    industry: '',
    
    // Step 2: Admin Account
    adminName: '',
    adminEmail: '',
    password: '',
    confirmPassword: '',
    
    // Step 3: Company Details
    companyAddress: '',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    fiscalYearStart: 'April',
    
    // Step 4: Subscription Plan
    plan: 'free',
    agreeToTerms: false
  });

  const [slugStatus, setSlugStatus] = useState({ checking: false, available: null, message: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { addCompany, checkCompanyExists } = useCompanyStore();

  // Industries list
  const industries = [
    'IT & Software',
    'Consulting',
    'Manufacturing',
    'Healthcare',
    'Education',
    'Finance & Banking',
    'Retail & E-commerce',
    'Construction',
    'Marketing & Advertising',
    'Real Estate',
    'Other'
  ];

  // Currencies list
  const currencies = [
    { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' }
  ];

  // Timezones list (common ones)
  const timezones = [
    'Asia/Kolkata',
    'America/New_York',
    'America/Los_Angeles',
    'America/Chicago',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];

  // Fiscal year months
  const fiscalMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Subscription plans
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      features: ['Up to 5 users', '10 projects', 'Basic support', 'Core features']
    },
    {
      id: 'basic',
      name: 'Basic',
      price: 999,
      features: ['Up to 20 users', '100 projects', 'Email support', 'All core features', 'Advanced analytics']
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 2999,
      features: ['Up to 100 users', 'Unlimited projects', 'Priority support', 'All features', 'Custom integrations', 'API access']
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: null,
      features: ['Unlimited users', 'Unlimited projects', 'Dedicated support', 'Custom features', 'SLA guarantee', 'On-premise option']
    }
  ];

  // Auto-generate slug from company name
  useEffect(() => {
    if (formData.companyName && currentStep === 1) {
      const slug = formData.companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      
      if (slug !== formData.companySlug) {
        setFormData(prev => ({ ...prev, companySlug: slug }));
      }
    }
  }, [formData.companyName, currentStep]);

  // Check slug availability
  useEffect(() => {
    const checkSlug = async () => {
      if (formData.companySlug.length < 3) {
        setSlugStatus({ checking: false, available: null, message: '' });
        return;
      }

      setSlugStatus({ checking: true, available: null, message: 'Checking...' });

      // Simulate API call
      setTimeout(() => {
        const exists = checkCompanyExists(formData.companySlug);
        setSlugStatus({
          checking: false,
          available: !exists,
          message: !exists ? 'Available!' : 'Already taken'
        });
      }, 500);
    };

    const debounce = setTimeout(checkSlug, 300);
    return () => clearTimeout(debounce);
  }, [formData.companySlug, checkCompanyExists]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.companyName.trim()) {
          newErrors.companyName = 'Company name is required';
        }
        if (!formData.companySlug.trim()) {
          newErrors.companySlug = 'Company slug is required';
        } else if (formData.companySlug.length < 3) {
          newErrors.companySlug = 'Slug must be at least 3 characters';
        } else if (!/^[a-z0-9-]+$/.test(formData.companySlug)) {
          newErrors.companySlug = 'Slug can only contain lowercase letters, numbers, and hyphens';
        } else if (!slugStatus.available) {
          newErrors.companySlug = 'This slug is not available';
        }
        break;

      case 2:
        if (!formData.adminName.trim()) {
          newErrors.adminName = 'Full name is required';
        }
        if (!formData.adminEmail.trim()) {
          newErrors.adminEmail = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.adminEmail)) {
          newErrors.adminEmail = 'Invalid email format';
        }
        if (!formData.password) {
          newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
          newErrors.password = 'Password must be at least 8 characters';
        }
        if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
        break;

      case 3:
        if (!formData.currency) {
          newErrors.currency = 'Currency is required';
        }
        if (!formData.timezone) {
          newErrors.timezone = 'Timezone is required';
        }
        if (!formData.fiscalYearStart) {
          newErrors.fiscalYearStart = 'Fiscal year start is required';
        }
        break;

      case 4:
        if (!formData.agreeToTerms) {
          newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateStep(4)) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Create company
      const newCompany = {
        id: Date.now(),
        name: formData.companyName,
        slug: formData.companySlug,
        industry: formData.industry,
        address: formData.companyAddress,
        currency: formData.currency,
        timezone: formData.timezone,
        fiscalYearStart: formData.fiscalYearStart,
        plan: formData.plan,
        admin_email: formData.adminEmail,
        created_at: new Date().toISOString()
      };

      addCompany(newCompany);

      // Create admin user and auto-login
      const adminUser = {
        id: Date.now(),
        name: formData.adminName,
        email: formData.adminEmail,
        role: 'admin',
        company: formData.companyName,
        companySlug: formData.companySlug
      };

      login(adminUser, 'demo-token-' + Date.now());
      navigate('/dashboard');
    } catch (error) {
      setErrors({ submit: 'Failed to create company. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: 'Company Info' },
      { number: 2, title: 'Admin Account' },
      { number: 3, title: 'Company Details' },
      { number: 4, title: 'Subscription' }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step.number
                      ? 'text-white'
                      : 'text-gray-400'
                  }`}
                  style={{
                    backgroundColor: currentStep >= step.number
                      ? 'rgb(var(--primary))'
                      : 'rgb(var(--border-color))'
                  }}
                >
                  {currentStep > step.number ? (
                    <FiCheck />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    currentStep >= step.number
                      ? 'text-primary'
                      : ''
                  }`}
                  style={{
                    color: currentStep >= step.number
                      ? 'rgb(var(--primary))'
                      : 'rgb(var(--text-tertiary))'
                  }}
                >
                  {step.title}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className="h-1 flex-1 mx-2"
                  style={{
                    backgroundColor: currentStep > step.number
                      ? 'rgb(var(--primary))'
                      : 'rgb(var(--border-color))'
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Company Information
        </h2>
        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Let's start by setting up your company profile
        </p>
      </div>

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
          />
        </div>
        {errors.companyName && (
          <p className="text-xs mt-1" style={{ color: 'rgb(var(--error))' }}>
            {errors.companyName}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Company Slug * (will be your URL)
        </label>
        <div className="relative">
          <FiGlobe className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: 'rgb(var(--text-tertiary))' }} />
          <input
            type="text"
            name="companySlug"
            value={formData.companySlug}
            onChange={handleChange}
            className="input-field pl-10 pr-32"
            placeholder="your-company"
          />
          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm" 
            style={{ color: 'rgb(var(--text-tertiary))' }}>
            .plantobill.com
          </span>
        </div>
        
        {slugStatus.checking && (
          <div className="flex items-center mt-2 text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
            <div className="animate-spin mr-2 h-3 w-3 border-2 border-t-transparent rounded-full"
              style={{ borderColor: 'rgb(var(--primary))' }}></div>
            Checking availability...
          </div>
        )}
        
        {!slugStatus.checking && slugStatus.available === true && (
          <div className="flex items-center mt-2 text-sm" style={{ color: 'rgb(var(--success))' }}>
            <FiCheckCircle className="mr-2" />
            Available!
          </div>
        )}
        
        {!slugStatus.checking && slugStatus.available === false && (
          <div className="flex items-center mt-2 text-sm" style={{ color: 'rgb(var(--error))' }}>
            <FiX className="mr-2" />
            Already taken
          </div>
        )}
        
        {errors.companySlug && (
          <p className="text-xs mt-1" style={{ color: 'rgb(var(--error))' }}>
            {errors.companySlug}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Industry (Optional)
        </label>
        <select
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          className="input-field"
        >
          <option value="">Select Industry</option>
          {industries.map(industry => (
            <option key={industry} value={industry}>{industry}</option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Admin Account
        </h2>
        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Create your administrator account
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Your Full Name *
        </label>
        <div className="relative">
          <FiUser className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: 'rgb(var(--text-tertiary))' }} />
          <input
            type="text"
            name="adminName"
            value={formData.adminName}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="John Doe"
          />
        </div>
        {errors.adminName && (
          <p className="text-xs mt-1" style={{ color: 'rgb(var(--error))' }}>
            {errors.adminName}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Work Email *
        </label>
        <div className="relative">
          <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: 'rgb(var(--text-tertiary))' }} />
          <input
            type="email"
            name="adminEmail"
            value={formData.adminEmail}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="john@company.com"
          />
        </div>
        {errors.adminEmail && (
          <p className="text-xs mt-1" style={{ color: 'rgb(var(--error))' }}>
            {errors.adminEmail}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Password *
        </label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: 'rgb(var(--text-tertiary))' }} />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="••••••••"
          />
        </div>
        {errors.password && (
          <p className="text-xs mt-1" style={{ color: 'rgb(var(--error))' }}>
            {errors.password}
          </p>
        )}
        <p className="text-xs mt-1" style={{ color: 'rgb(var(--text-tertiary))' }}>
          Must be at least 8 characters
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Confirm Password *
        </label>
        <div className="relative">
          <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: 'rgb(var(--text-tertiary))' }} />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="input-field pl-10"
            placeholder="••••••••"
          />
        </div>
        {errors.confirmPassword && (
          <p className="text-xs mt-1" style={{ color: 'rgb(var(--error))' }}>
            {errors.confirmPassword}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Company Details
        </h2>
        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Configure your company settings
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Company Address (Optional)
        </label>
        <div className="relative">
          <FiMapPin className="absolute left-3 top-3" 
            style={{ color: 'rgb(var(--text-tertiary))' }} />
          <textarea
            name="companyAddress"
            value={formData.companyAddress}
            onChange={handleChange}
            className="input-field pl-10 min-h-[80px]"
            placeholder="Street Address, City, State, Country"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
            Currency *
          </label>
          <div className="relative">
            <FiDollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2" 
              style={{ color: 'rgb(var(--text-tertiary))' }} />
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="input-field pl-10"
            >
              {currencies.map(curr => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>
          {errors.currency && (
            <p className="text-xs mt-1" style={{ color: 'rgb(var(--error))' }}>
              {errors.currency}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
            Timezone *
          </label>
          <div className="relative">
            <FiClock className="absolute left-3 top-1/2 transform -translate-y-1/2" 
              style={{ color: 'rgb(var(--text-tertiary))' }} />
            <select
              name="timezone"
              value={formData.timezone}
              onChange={handleChange}
              className="input-field pl-10"
            >
              {timezones.map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          {errors.timezone && (
            <p className="text-xs mt-1" style={{ color: 'rgb(var(--error))' }}>
              {errors.timezone}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Fiscal Year Starts In *
        </label>
        <div className="relative">
          <FiCalendar className="absolute left-3 top-1/2 transform -translate-y-1/2" 
            style={{ color: 'rgb(var(--text-tertiary))' }} />
          <select
            name="fiscalYearStart"
            value={formData.fiscalYearStart}
            onChange={handleChange}
            className="input-field pl-10"
          >
            {fiscalMonths.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        {errors.fiscalYearStart && (
          <p className="text-xs mt-1" style={{ color: 'rgb(var(--error))' }}>
            {errors.fiscalYearStart}
          </p>
        )}
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2" style={{ color: 'rgb(var(--text-primary))' }}>
          Subscription Plan
        </h2>
        <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
          Choose the plan that fits your needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map(plan => (
          <label
            key={plan.id}
            className={`relative flex flex-col p-4 rounded-lg border-2 cursor-pointer transition-all ${
              formData.plan === plan.id ? 'border-primary' : ''
            }`}
            style={{
              borderColor: formData.plan === plan.id 
                ? 'rgb(var(--primary))' 
                : 'rgb(var(--border-color))',
              backgroundColor: formData.plan === plan.id 
                ? 'rgb(var(--primary) / 0.05)' 
                : 'transparent'
            }}
          >
            <input
              type="radio"
              name="plan"
              value={plan.id}
              checked={formData.plan === plan.id}
              onChange={handleChange}
              className="sr-only"
            />
            
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-bold text-lg" style={{ color: 'rgb(var(--text-primary))' }}>
                  {plan.name}
                </h3>
                <p className="text-2xl font-bold mt-1" style={{ color: 'rgb(var(--primary))' }}>
                  {plan.price === null ? (
                    'Contact Sales'
                  ) : plan.price === 0 ? (
                    'Free'
                  ) : (
                    `₹${plan.price}/mo`
                  )}
                </p>
              </div>
              
              {formData.plan === plan.id && (
                <div className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgb(var(--primary))' }}>
                  <FiCheck className="text-white" size={14} />
                </div>
              )}
            </div>

            <ul className="space-y-2 mt-4">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm" 
                  style={{ color: 'rgb(var(--text-secondary))' }}>
                  <FiCheck className="mr-2 mt-0.5 flex-shrink-0" 
                    style={{ color: 'rgb(var(--success))' }} />
                  {feature}
                </li>
              ))}
            </ul>
          </label>
        ))}
      </div>

      <div className="mt-6">
        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            name="agreeToTerms"
            checked={formData.agreeToTerms}
            onChange={handleChange}
            className="w-5 h-5 mt-0.5"
            style={{ accentColor: 'rgb(var(--primary))' }}
          />
          <span className="text-sm" style={{ color: 'rgb(var(--text-primary))' }}>
            I agree to the{' '}
            <Link to="/terms" className="font-medium hover:underline" 
              style={{ color: 'rgb(var(--primary))' }}>
              Terms & Conditions
            </Link>
            {' '}and{' '}
            <Link to="/privacy" className="font-medium hover:underline" 
              style={{ color: 'rgb(var(--primary))' }}>
              Privacy Policy
            </Link>
          </span>
        </label>
        {errors.agreeToTerms && (
          <p className="text-xs mt-2" style={{ color: 'rgb(var(--error))' }}>
            {errors.agreeToTerms}
          </p>
        )}
      </div>

      {errors.submit && (
        <div className="p-4 rounded-lg flex items-center space-x-2" 
          style={{ backgroundColor: 'rgb(var(--error) / 0.1)' }}>
          <FiAlertCircle style={{ color: 'rgb(var(--error))' }} />
          <span className="text-sm" style={{ color: 'rgb(var(--error))' }}>
            {errors.submit}
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4 transition-colors" 
      style={{ backgroundColor: 'rgb(var(--bg-primary))' }}>
      <div className="max-w-3xl mx-auto">
        <div className="rounded-2xl shadow-xl p-8 transition-all" 
          style={{ backgroundColor: 'rgb(var(--bg-secondary))' }}>
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'rgb(var(--primary))' }}>
              Create Your Company Account
            </h1>
            <p className="text-sm" style={{ color: 'rgb(var(--text-secondary))' }}>
              Get started with OneFlow in just a few steps
            </p>
          </div>

          {/* Step Indicator */}
          {renderStepIndicator()}

          {/* Form Steps */}
          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}
            {currentStep === 4 && renderStep4()}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6" 
              style={{ borderTop: '1px solid rgb(var(--border-color))' }}>
              <div>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2"
                    style={{ 
                      backgroundColor: 'rgb(var(--bg-primary))',
                      color: 'rgb(var(--text-primary))',
                      border: '2px solid rgb(var(--border-color))'
                    }}
                  >
                    <FiChevronLeft />
                    <span>Previous</span>
                  </button>
                )}
              </div>

              <div className="flex space-x-3">
                <Link
                  to="/login"
                  className="px-6 py-3 rounded-lg font-medium transition-all"
                  style={{ 
                    backgroundColor: 'rgb(var(--bg-primary))',
                    color: 'rgb(var(--text-secondary))',
                    border: '2px solid rgb(var(--border-color))'
                  }}
                >
                  Cancel
                </Link>

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="btn-primary px-6 py-3 flex items-center space-x-2"
                  >
                    <span>Next</span>
                    <FiChevronRight />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn-primary px-6 py-3 flex items-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <>
                        <FiCheck />
                        <span>Create Company Account</span>
                      </>
                    )}
                  </button>
                )}
              </div>
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

export default CompanySignup;
