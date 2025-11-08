# Plan to Bill - Complete Signup & Login Workflow

## Updated Authentication Flow

### 1. SIGNUP PAGE (No Role Selection)
**Endpoint:** `POST /api/auth/signup`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@company.com",
  "password": "SecurePass@123",
  "confirmPassword": "SecurePass@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email for verification code. After verification, wait for admin approval to assign your role.",
  "data": {
    "userId": 5,
    "email": "jane.doe@company.com"
  }
}
```

**What happens:**
- ✅ User enters: First Name, Last Name, Work Email, Password, Confirm Password
- ✅ Email is validated
- ✅ Passwords are checked for match
- ✅ 6-digit OTP is generated and sent to email
- ✅ User is created with `pending_approval = true` and `role = null`
- ❌ NO ROLE is assigned yet (admin will do this later)

---

### 2. EMAIL VERIFICATION
**Endpoint:** `POST /api/auth/verify-email`

**Request Body:**
```json
{
  "email": "jane.doe@company.com",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! Please wait for admin to assign your role before you can login."
}
```

**What happens:**
- ✅ OTP is validated (must be within 10 minutes)
- ✅ `is_verified` is set to `true`
- ⏳ User still has `pending_approval = true` and `role = null`
- ⏳ User CANNOT login yet - needs admin to assign role

---

### 3. ADMIN VIEWS PENDING USERS
**Endpoint:** `GET /api/admin/pending-users`
**Auth Required:** Admin only
**Headers:** `Authorization: Bearer <admin_token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "pendingUsers": [
      {
        "id": 5,
        "email": "jane.doe@company.com",
        "first_name": "Jane",
        "last_name": "Doe",
        "is_verified": true,
        "pending_approval": true,
        "created_at": "2025-01-08T10:30:00.000Z"
      }
    ],
    "count": 1
  }
}
```

---

### 4. ADMIN ASSIGNS ROLE
**Endpoint:** `POST /api/admin/users/:userId/assign-role`
**Auth Required:** Admin only
**Headers:** `Authorization: Bearer <admin_token>`

**Request Body:**
```json
{
  "role": "project_manager"
}
```

**Valid Roles:**
- `admin`
- `project_manager`
- `team_member`

**Response:**
```json
{
  "success": true,
  "message": "Role 'project_manager' assigned successfully to Jane Doe",
  "data": {
    "user": {
      "id": 5,
      "email": "jane.doe@company.com",
      "first_name": "Jane",
      "last_name": "Doe",
      "role": "project_manager",
      "role_approved": true
    }
  }
}
```

**What happens:**
- ✅ Admin assigns role to user
- ✅ `role_approved` is set to `true`
- ✅ `pending_approval` is set to `false`
- ✅ User can now login

---

### 5. LOGIN (After Role Approval)
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "jane.doe@company.com",
  "password": "SecurePass@123"
}
```

**Success Response (Role Approved):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "email": "jane.doe@company.com",
      "firstName": "Jane",
      "lastName": "Doe",
      "role": "project_manager"
    }
  }
}
```

**Error Response (Pending Approval):**
```json
{
  "success": false,
  "message": "Your account is pending admin approval. Please wait for the admin to assign your role.",
  "pending": true
}
```

---

### 6. ROLE-BASED DASHBOARD
**Endpoint:** `GET /api/dashboard`
**Headers:** `Authorization: Bearer <user_token>`

**Project Manager Dashboard:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 5,
      "email": "jane.doe@company.com",
      "name": "Jane Doe",
      "role": "project_manager"
    },
    "message": "Welcome to Project Manager Dashboard",
    "permissions": [
      "manage_projects",
      "manage_tasks",
      "view_team",
      "view_reports"
    ]
  }
}
```

**Team Member Dashboard:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 6,
      "email": "john.smith@company.com",
      "name": "John Smith",
      "role": "team_member"
    },
    "message": "Welcome to Team Member Dashboard",
    "permissions": [
      "view_tasks",
      "update_tasks",
      "log_hours"
    ]
  }
}
```

**Admin Dashboard:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "email": "kandpalravindra21@gmail.com",
      "name": "Ravindra Kandpal",
      "role": "admin"
    },
    "message": "Welcome to Admin Dashboard",
    "permissions": [
      "manage_users",
      "manage_projects",
      "view_reports",
      "manage_settings"
    ]
  }
}
```

---

## Additional Admin Endpoints

### Get All Users
```
GET /api/admin/users
Auth: Admin only
```

### Reject Pending User
```
DELETE /api/admin/users/:userId/reject
Auth: Admin only
```
Deletes the user if they are still pending approval.

---

## Complete User Journey

1. **User signs up** → Receives OTP email → No role assigned
2. **User verifies email** with OTP → Account verified but cannot login yet
3. **Admin views pending users** → Sees new verified user waiting for role
4. **Admin assigns role** → User becomes active
5. **User logs in** → Gets JWT token with role
6. **User accesses dashboard** → Role-based dashboard opens with appropriate permissions

---

## Existing Admin Account

**Email:** kandpalravindra21@gmail.com  
**Password:** Kandpal@345  
**Role:** admin

Use this account to:
- View pending users
- Assign roles
- Manage all users

---

## PowerShell Test Commands

### 1. Signup
```powershell
$body = @{ 
  email = "newuser@company.com"
  password = "Test@123"
  confirmPassword = "Test@123"
  firstName = "New"
  lastName = "User"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method Post -Body $body -ContentType "application/json"
```

### 2. Verify Email
```powershell
$body = @{ 
  email = "newuser@company.com"
  otp = "123456"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify-email" -Method Post -Body $body -ContentType "application/json"
```

### 3. Admin Login
```powershell
$body = @{ 
  email = "kandpalravindra21@gmail.com"
  password = "Kandpal@345"
} | ConvertTo-Json
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$adminToken = $response.data.token
```

### 4. View Pending Users
```powershell
$headers = @{ Authorization = "Bearer $adminToken" }
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/pending-users" -Headers $headers
```

### 5. Assign Role
```powershell
$headers = @{ Authorization = "Bearer $adminToken" }
$body = @{ role = "project_manager" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users/5/assign-role" -Method Post -Headers $headers -Body $body -ContentType "application/json"
```

### 6. User Login (After Approval)
```powershell
$body = @{ 
  email = "newuser@company.com"
  password = "Test@123"
} | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
```
