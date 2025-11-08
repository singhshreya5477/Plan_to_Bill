# Backend Changes for New UI (Login & Signup)

## 📋 Summary
Updated the backend authentication system to match the new frontend UI requirements from GitHub.

---

## 🔧 Changes Made

### 1. **Authentication Controller** (`src/controllers/authController.js`)

#### ✅ Updated Signup Endpoint
- **Added Fields**: 
  - `phone` - User's phone number (optional)
  - `role` - User role selection (team_member, project_manager, admin, sales_finance)
  
- **Role Handling**:
  - Default role: `team_member` if not provided
  - Admin role requires approval (`pending_approval = true`)
  - Other roles are auto-approved (`role_approved = true`)
  
- **Response Changes**:
  - Returns `needsApproval` flag
  - Different messages for admin vs regular users

#### ✅ Updated Verify Email Endpoint
- **No Auto-Login**: Removed token generation after verification
- **Redirect to Login**: User must login separately after verification
- **Messages**:
  - Admin: "Email verified! Wait for admin approval before logging in"
  - Regular: "Email verified! You can now login with your credentials"

#### ✅ Added Resend OTP Endpoint
- **Route**: `POST /api/auth/resend-otp`
- **Function**: Generates new OTP and resends verification email
- **Validation**: Checks if user exists and is not already verified

### 2. **Validation Middleware** (`src/middleware/validator.js`)

- **Removed**: `confirmPassword` validation (frontend handles this)
- **Required Fields**: email, password, firstName, lastName
- **Optional Fields**: phone, role

### 3. **Auth Routes** (`src/routes/authRoutes.js`)

Added new route:
```javascript
router.post('/resend-otp', authController.resendOTP);
```

### 4. **Database Schema**

#### ✅ Phone Column Added
- **Table**: `users`
- **Column**: `phone VARCHAR(20)`
- **Nullable**: Yes
- **Script**: `add-phone-column.js`

### 5. **Dashboard Controller** (`src/controllers/dashboardController.js`)

#### ✅ Added `getStats` Endpoint
Returns dashboard statistics:
- `activeProjects` - Count of non-completed projects
- `hoursTracked` - User's total logged hours
- `overdueItems` - Count of overdue tasks
- `totalRevenue` - Total paid invoices (admin/PM only)

#### ✅ Added `getProjects` Endpoint
Returns user's projects with:
- Project details (name, status, budget, dates)
- Manager name
- Team size
- Task progress (total vs completed)
- Auto-calculated progress percentage

**Role-based Access**:
- Admin/PM: See all projects
- Team Member: Only see assigned projects

### 6. **Dashboard Routes** (`src/routes/dashboardRoutes.js`)

Added new routes:
```javascript
router.get('/stats', authenticate, dashboardController.getStats);
router.get('/projects', authenticate, dashboardController.getProjects);
```

---

## 📊 API Endpoints Summary

### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/signup` | Register new user | No |
| POST | `/api/auth/verify-email` | Verify OTP | No |
| POST | `/api/auth/resend-otp` | Resend verification OTP | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/forgot-password` | Request password reset | No |
| POST | `/api/auth/reset-password` | Reset password with OTP | No |

### Dashboard Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/dashboard` | Get role-based dashboard | Yes |
| GET | `/api/dashboard/stats` | Get dashboard statistics | Yes |
| GET | `/api/dashboard/projects` | Get user's projects | Yes |

---

## 🔄 User Flow Changes

### Old Flow:
1. Signup → Verify Email → **Auto-login** → Dashboard

### New Flow:
1. Signup (with phone & role)
2. Verify Email with OTP
3. **Redirect to Login Page**
4. Login → Dashboard

---

## 🧪 Testing

### Test Script: `test-auth-ui.js`

Comprehensive test suite covering:
1. ✅ Signup with phone and role
2. ✅ Resend OTP functionality
3. ✅ Email verification (no auto-login)
4. ✅ Login after verification
5. ✅ Admin role signup (needs approval)
6. ✅ Invalid OTP rejection
7. ✅ Duplicate email prevention

**To run tests:**
```bash
# Start backend server
node server.js

# Run tests in another terminal
node test-auth-ui.js
```

---

## 📝 Frontend Integration

### Signup Request Format:
```javascript
{
  email: "user@example.com",
  password: "SecurePass123!",
  firstName: "John",
  lastName: "Doe",
  phone: "+91 9876543210",  // Optional
  role: "team_member"        // team_member, project_manager, admin, sales_finance
}
```

### Signup Response:
```javascript
{
  success: true,
  message: "Registration successful! Check your email for verification code.",
  data: {
    userId: 123,
    email: "user@example.com",
    role: "team_member",
    needsApproval: false  // true for admin
  }
}
```

### Verify Email Response:
```javascript
{
  success: true,
  message: "Email verified successfully! You can now login with your credentials."
  // No token or user data - must login separately
}
```

---

## 🚀 Deployment Notes

1. **Database Migration**: Run `add-phone-column.js` to add phone field
2. **Restart Server**: Apply all controller and route changes
3. **Frontend Update**: Frontend already updated to redirect to login after verification

---

## ✅ Compatibility

- ✅ Matches new GitHub frontend UI
- ✅ Backward compatible with existing users
- ✅ Role-based access control maintained
- ✅ Admin approval workflow preserved
- ✅ All existing Phase 1 & 2 endpoints intact

---

## 🔐 Security Considerations

1. **Password**: Not returned in verify-email response
2. **Token**: Only issued during login, not verification
3. **Role Approval**: Admin accounts still require manual approval
4. **OTP Expiry**: 10 minutes (unchanged)
5. **Phone**: Optional field, no validation beyond format

---

## 📌 Next Steps

1. ✅ Backend updated and tested
2. ✅ Frontend pulled from GitHub
3. ✅ Dashboard endpoints created
4. ⏳ Test complete signup → login flow in browser
5. ⏳ Create sample projects and tasks for testing
6. ⏳ Verify dashboard stats display correctly

---

**Last Updated**: November 8, 2025  
**Version**: 2.0 (UI Integration Update)
