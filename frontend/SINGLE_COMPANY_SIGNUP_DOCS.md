# Single-Company Signup System Documentation

## Overview
OneFlow now uses a **single-company based** signup system where all users register for one specific company. This replaces the previous multi-company architecture with a cleaner, more focused user experience.

---

## 🎯 Key Features

### 1. **Password Strength Indicator**
- Real-time visual feedback as users type their password
- Three strength levels:
  - **Weak** (Red): < 40% strength
  - **Medium** (Orange): 40-80% strength
  - **Strong** (Green): 80-100% strength
- Criteria evaluated:
  - Minimum 8 characters
  - Lowercase letters
  - Uppercase letters
  - Numbers
  - Special characters
- Visual progress bar with dynamic color coding

### 2. **Email Availability Check**
- Real-time validation with debounced API calls
- Visual feedback:
  - Loading spinner while checking
  - ✓ Green checkmark if available
  - ✗ Red X if email already exists
- Debounce delay: 500ms (prevents excessive API calls)
- Demo: emails containing "taken" are considered unavailable

### 3. **Form Fields**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | Text | Yes | Must not be empty |
| Email | Email | Yes | Valid email format + availability check |
| Phone | Tel | Yes | Valid phone format (10-15 digits) |
| Password | Password | Yes | Min 8 characters, strength indicator |
| Confirm Password | Password | Yes | Must match password |
| Role | Select | Yes | Team Member, PM, Sales/Finance, Admin |
| Department | Select | No | 8 department options |
| Terms | Checkbox | Yes | Must be accepted |

### 4. **Role Selection**
Four available roles:
- **Team Member**: Standard access
- **Project Manager**: Enhanced project management features
- **Sales/Finance**: Financial module access
- **Admin**: Full system access (requires approval)

⚠️ **Admin Note**: When "Admin" is selected, a warning appears:
> "Admin accounts require approval before access"

### 5. **Department Options** (Optional)
- Engineering
- Product
- Design
- Marketing
- Sales
- Finance
- Human Resources
- Operations

---

## 🔧 Technical Implementation

### Component Structure

```jsx
src/pages/auth/Signup.jsx
├── State Management
│   ├── formData (all form fields)
│   ├── passwordStrength (level & score)
│   ├── showPassword/showConfirmPassword (toggles)
│   ├── emailStatus (checking, available, message)
│   ├── error (global error message)
│   └── fieldErrors (individual field errors)
│
├── Functions
│   ├── calculatePasswordStrength() - Returns {level, score}
│   ├── checkEmailAvailability() - Debounced API call
│   ├── validateForm() - Client-side validation
│   └── handleSubmit() - Form submission
│
└── UI Components
    ├── Password Strength Bar
    ├── Email Status Indicator
    ├── Show/Hide Password Toggles
    ├── Field Error Messages
    └── Terms & Conditions Checkbox
```

### Password Strength Algorithm

```javascript
Score Calculation:
- 8+ characters: +20%
- Lowercase letters: +20%
- Uppercase letters: +20%
- Numbers: +20%
- Special characters: +20%

Strength Levels:
- 0-39%: Weak (Red #ef4444)
- 40-79%: Medium (Orange #f59e0b)
- 80-100%: Strong (Green #10b981)
```

### Email Availability Check Flow

```
User types email
    ↓
Wait 500ms (debounce)
    ↓
Validate email format
    ↓
Show loading spinner
    ↓
Simulate API call (800ms)
    ↓
Check if email contains "taken"
    ↓
Display result (✓ available or ✗ taken)
```

### Form Validation Rules

```javascript
Validations:
- Full Name: Required, non-empty
- Email: Required, valid format, available
- Phone: Required, 10-15 digits with optional +
- Password: Required, min 8 characters
- Confirm Password: Required, must match password
- Role: Required, must select one
- Department: Optional
- Terms: Required, must be checked
```

---

## 🎨 UI/UX Features

### Visual Feedback
1. **Field-level errors**: Red border + error message below field
2. **Global errors**: Red alert box at bottom of form
3. **Success indicators**:
   - Email available: Green checkmark + "✓ Email is available"
   - Passwords match: Green text "✓ Passwords match"
4. **Loading states**: Spinner icon while checking email

### Theme Support
- Fully compatible with light/dark theme system
- Uses CSS variables for colors:
  - `--primary`: Brand color
  - `--text-primary/secondary/tertiary`: Text colors
  - `--bg-primary/secondary/tertiary`: Background colors
  - `--border`: Border colors

### Accessibility
- Semantic HTML with proper labels
- Focus states on all interactive elements
- Error messages linked to fields
- Color-blind friendly (uses icons + text)

---

## 🔐 Security Features

### Password Requirements
```
Minimum Requirements:
✓ At least 8 characters
✓ Mix of letters, numbers & symbols
✓ Case sensitivity enforced

Visual Strength Meter:
- Encourages strong passwords
- Real-time feedback
- Educational hints
```

### Email Validation
```
1. Format validation (regex)
2. Availability check (prevents duplicates)
3. Case-insensitive comparison
4. Debounced requests (performance)
```

### Data Protection
```javascript
// Passwords are hidden by default
// Toggle visibility with eye icon
// Confirm password prevents typos
// Terms acceptance required
```

---

## 📡 API Integration Points

### Current (Demo Mode)
```javascript
// Email availability check (simulated)
setTimeout(() => {
  const isAvailable = !email.toLowerCase().includes('taken');
  setEmailStatus({ available: isAvailable });
}, 800);

// Signup submission (demo)
const userData = {
  name, email, phone, role, department,
  company: 'OneFlow' // Single company
};
login(userData, 'demo-token-123');
```

### Production Integration
```javascript
// Replace with actual API calls

// 1. Email availability
const checkEmail = async (email) => {
  const response = await fetch('/api/auth/check-email', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
  return await response.json();
};

// 2. User registration
const signup = async (userData) => {
  const response = await fetch('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
  return await response.json();
};
```

---

## 🚀 Usage Guide

### For Users

1. **Navigate to Signup**:
   - Go to `/signup` or click "Sign up" from login page

2. **Fill Form**:
   - Enter your full name
   - Provide email (wait for availability check)
   - Add phone number with country code (e.g., +91 9876543210)
   - Create strong password (watch strength meter)
   - Confirm password
   - Select your role
   - Optionally choose department
   - Accept terms & conditions

3. **Submit**:
   - Click "Create Account"
   - If admin role: Account requires approval
   - Otherwise: Redirected to dashboard

### For Developers

**Testing Email Availability**:
```javascript
// Available emails
user@example.com ✓
john@company.com ✓

// Unavailable emails (contains "taken")
taken@example.com ✗
already.taken@test.com ✗
```

**Testing Password Strength**:
```javascript
"password" → Weak (20%)
"Password1" → Medium (60%)
"P@ssw0rd!" → Strong (100%)
```

**Testing Form Validation**:
```bash
# Try submitting with:
- Empty fields → Field errors
- Invalid email → Format error
- Mismatched passwords → Confirmation error
- Unchecked terms → Terms error
```

---

## 🔄 Changes from Previous System

### Removed Features
- ❌ Multi-company selection
- ❌ Company name field
- ❌ "New company" checkbox
- ❌ Company admin validation modal
- ❌ Company store dependency

### Added Features
- ✅ Password strength indicator
- ✅ Email availability check
- ✅ Show/Hide password toggles
- ✅ Enhanced field validation
- ✅ Department selection
- ✅ Terms & conditions checkbox
- ✅ Visual feedback for all fields

### Updated Features
- ↻ Role selection (streamlined options)
- ↻ Admin approval workflow
- ↻ Single company model ("OneFlow")
- ↻ Simplified form layout
- ↻ Better error handling

---

## 📊 Form State Management

```javascript
// Initial State
{
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  role: '',
  department: '',
  termsAccepted: false
}

// Password Strength State
{
  level: 'weak' | 'medium' | 'strong',
  score: 0-100
}

// Email Status State
{
  checking: boolean,
  available: boolean | null,
  message: string
}

// Error States
{
  error: string,              // Global error
  fieldErrors: {              // Field-specific errors
    fullName: string,
    email: string,
    phone: string,
    password: string,
    confirmPassword: string,
    role: string,
    terms: string
  }
}
```

---

## 🎯 Best Practices

### For Users
1. Use a **strong password** with mix of characters
2. Provide a **valid phone number** for account recovery
3. Choose appropriate **role** for your responsibilities
4. Read **terms & conditions** before accepting

### For Developers
1. **Debounce** email checks to reduce API load
2. **Validate client-side** before submitting
3. **Show clear error messages** for each field
4. **Use loading states** during async operations
5. **Test with various inputs** (valid, invalid, edge cases)
6. **Handle network errors** gracefully
7. **Implement proper security** on backend

---

## 🐛 Troubleshooting

### Common Issues

**Email check not working**
```javascript
// Check if debounce is working
// Look for console errors
// Verify email format is valid
```

**Password strength not updating**
```javascript
// Ensure useEffect dependency is correct
// Check calculatePasswordStrength function
// Verify state is updating
```

**Form submission fails**
```javascript
// Check all required fields are filled
// Verify email is available
// Ensure terms are accepted
// Look for validation errors
```

**Styling issues**
```javascript
// Verify Tailwind CSS is loaded
// Check CSS variables are defined
// Ensure theme is properly applied
```

---

## 📝 Testing Checklist

### Functional Testing
- [ ] All fields accept appropriate input
- [ ] Email availability check works
- [ ] Password strength meter updates correctly
- [ ] Show/hide password toggles work
- [ ] Password match validation works
- [ ] Role selection shows admin warning
- [ ] Department selection is optional
- [ ] Terms checkbox required
- [ ] Form submits successfully
- [ ] Redirects to dashboard

### Validation Testing
- [ ] Empty field validation
- [ ] Email format validation
- [ ] Phone number format validation
- [ ] Password length validation
- [ ] Password match validation
- [ ] Terms acceptance validation
- [ ] Error messages display correctly

### UI/UX Testing
- [ ] Theme switching works
- [ ] Loading states appear correctly
- [ ] Success indicators show properly
- [ ] Error messages are clear
- [ ] Layout is responsive
- [ ] Accessibility features work

---

## 🔮 Future Enhancements

### Planned Features
1. **Social login** (Google, GitHub, LinkedIn)
2. **Phone OTP verification**
3. **Email verification link**
4. **Profile photo upload** during signup
5. **Invite code** system for restricted access
6. **CAPTCHA** for bot prevention
7. **Two-factor authentication** setup

### Potential Improvements
- Real-time password breach check
- Progressive password strength requirements
- Smart role suggestions based on email domain
- Auto-fill department based on role
- Multi-language support
- Keyboard shortcuts (Tab navigation)
- Animated transitions

---

## 📚 Related Documentation

- `THEME_SYSTEM.md` - Theme implementation details
- `TESTING_GUIDE.md` - Comprehensive testing guide
- `src/store/authStore.js` - Authentication state management
- `src/pages/auth/Login.jsx` - Login page implementation

---

## 🤝 Support

For issues or questions:
1. Check this documentation
2. Review the code comments
3. Test with demo values
4. Check browser console for errors
5. Verify API endpoints are working

---

**Last Updated**: January 2025  
**Version**: 1.0.0 (Single-Company Model)  
**Component**: `src/pages/auth/Signup.jsx`
