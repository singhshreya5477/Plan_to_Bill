# 🧪 MANUAL TESTING GUIDE - Complete Workflow

## Prerequisites
1. Open a PowerShell terminal
2. Navigate to backend folder: `cd "c:\Users\Ravindra Kandpal\Desktop\Plan_to_Bill\backend"`
3. Start server: `npm start`
4. Keep this terminal open!

## Open a NEW PowerShell Terminal for Testing

---

## 📝 STEP 1: User Signup (No Role Assignment)

```powershell
$body = @{
    email = "alice.smith@company.com"
    password = "Test@123"
    confirmPassword = "Test@123"
    firstName = "Alice"
    lastName = "Smith"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 3
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Registration successful! Please check your email for verification code. After verification, wait for admin approval to assign your role.",
  "data": {
    "userId": 4,
    "email": "alice.smith@company.com"
  }
}
```

**What Happened:**
- ✅ User created with `pending_approval = true`
- ✅ Role is `null` (not assigned yet)
- ✅ 6-digit OTP sent to email
- ⏳ User cannot login yet

---

## 📧 STEP 2: Get OTP from Database (For Testing)

```powershell
# Connect to PostgreSQL and get the OTP
$query = "SELECT email, verification_otp FROM users WHERE email = 'alice.smith@company.com';"
psql -U postgres -d plan_to_bill -c $query
```

**OR Run this Node script:**
```powershell
node -e "require('dotenv').config(); const {Pool} = require('pg'); const pool = new Pool({host:'localhost',port:5432,database:'plan_to_bill',user:'postgres',password:'ravindra'}); pool.query('SELECT email, verification_otp FROM users WHERE email = \''alice.smith@company.com\''').then(r => {console.log('OTP:', r.rows[0].verification_otp); process.exit(0)});"
```

Let's say OTP is: `123456`

---

## ✅ STEP 3: Verify Email

```powershell
$body = @{
    email = "alice.smith@company.com"
    otp = "123456"  # Use the actual OTP from Step 2
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify-email" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 3
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! Please wait for admin to assign your role before you can login."
}
```

**What Happened:**
- ✅ Email is verified (`is_verified = true`)
- ⏳ Still `pending_approval = true`
- ⏳ Role is still `null`
- ❌ User STILL cannot login

---

## 🚫 STEP 4: Try to Login (Should Fail - Pending Approval)

```powershell
$body = @{
    email = "alice.smith@company.com"
    password = "Test@123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 3
```

**Expected Response (ERROR):**
```json
{
  "success": false,
  "message": "Your account is pending admin approval. Please wait for the admin to assign your role.",
  "pending": true
}
```

---

## 👑 STEP 5: Admin Login

```powershell
$body = @{
    email = "kandpalravindra21@gmail.com"
    password = "Kandpal@345"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$adminToken = $response.data.token

Write-Host "✅ Admin logged in successfully!"
Write-Host "Admin Token: $adminToken"
```

---

## 👥 STEP 6: Admin Views Pending Users

```powershell
$headers = @{ Authorization = "Bearer $adminToken" }

Invoke-RestMethod -Uri "http://localhost:5000/api/admin/pending-users" -Headers $headers | ConvertTo-Json -Depth 4
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "pendingUsers": [
      {
        "id": 4,
        "email": "alice.smith@company.com",
        "first_name": "Alice",
        "last_name": "Smith",
        "is_verified": true,
        "pending_approval": true,
        "created_at": "2025-01-08T..."
      }
    ],
    "count": 1
  }
}
```

---

## ✨ STEP 7: Admin Assigns Role

```powershell
$headers = @{ Authorization = "Bearer $adminToken" }
$body = @{ role = "project_manager" } | ConvertTo-Json

# Replace '4' with actual userId from Step 6
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users/4/assign-role" -Method Post -Headers $headers -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 3
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Role 'project_manager' assigned successfully to Alice Smith",
  "data": {
    "user": {
      "id": 4,
      "email": "alice.smith@company.com",
      "first_name": "Alice",
      "last_name": "Smith",
      "role": "project_manager",
      "role_approved": true
    }
  }
}
```

**What Happened:**
- ✅ Role assigned: `project_manager`
- ✅ `role_approved = true`
- ✅ `pending_approval = false`
- ✅ User can NOW login!

---

## 🎉 STEP 8: User Login (After Role Assignment)

```powershell
$body = @{
    email = "alice.smith@company.com"
    password = "Test@123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$userToken = $response.data.token

Write-Host "✅ User logged in successfully!"
$response | ConvertTo-Json -Depth 3
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGci...",
    "user": {
      "id": 4,
      "email": "alice.smith@company.com",
      "firstName": "Alice",
      "lastName": "Smith",
      "role": "project_manager"
    }
  }
}
```

---

## 📊 STEP 9: Access Role-Based Dashboard

```powershell
$headers = @{ Authorization = "Bearer $userToken" }

Invoke-RestMethod -Uri "http://localhost:5000/api/dashboard" -Headers $headers | ConvertTo-Json -Depth 4
```

**Expected Response (Project Manager Dashboard):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 4,
      "email": "alice.smith@company.com",
      "name": "Alice Smith",
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

---

## 🎯 COMPLETE WORKFLOW SUMMARY

1. ✅ **User signs up** → No role selected
2. ✅ **Email sent** → 6-digit OTP
3. ✅ **User verifies email** → Account verified but cannot login
4. ❌ **Login fails** → "Pending admin approval"
5. ✅ **Admin logs in** → Views pending users
6. ✅ **Admin assigns role** → User becomes active
7. ✅ **User logs in** → Gets JWT token
8. ✅ **Dashboard opens** → Role-based permissions

---

## 📝 Quick Test Commands (Copy-Paste Ready)

### All-in-One Test Script:
Save this to a file `test-complete-flow.ps1`:

```powershell
# Signup
$signup = @{ email="test@company.com"; password="Test@123"; confirmPassword="Test@123"; firstName="Test"; lastName="User" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/signup" -Method Post -Body $signup -ContentType "application/json"

# Get OTP (from database)
node -e "require('dotenv').config(); const {Pool}=require('pg'); const pool=new Pool({host:'localhost',port:5432,database:'plan_to_bill',user:'postgres',password:'ravindra'}); pool.query('SELECT verification_otp FROM users WHERE email=''test@company.com''').then(r=>{console.log('OTP:',r.rows[0].verification_otp); process.exit(0)});"

# Verify (use OTP from above)
# $verify = @{ email="test@company.com"; otp="YOUR_OTP_HERE" } | ConvertTo-Json
# Invoke-RestMethod -Uri "http://localhost:5000/api/auth/verify-email" -Method Post -Body $verify -ContentType "application/json"

# Admin login
$admin = @{ email="kandpalravindra21@gmail.com"; password="Kandpal@345" } | ConvertTo-Json
$adminResp = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $admin -ContentType "application/json"
$adminToken = $adminResp.data.token

# View pending users
$headers = @{ Authorization = "Bearer $adminToken" }
Invoke-RestMethod -Uri "http://localhost:5000/api/admin/pending-users" -Headers $headers

# Assign role (replace userId)
# $role = @{ role="project_manager" } | ConvertTo-Json
# Invoke-RestMethod -Uri "http://localhost:5000/api/admin/users/USER_ID/assign-role" -Method Post -Headers $headers -Body $role -ContentType "application/json"
```

---

## ✅ SERVER STATUS CHECK

Before testing, verify server is running:

```powershell
Invoke-RestMethod -Uri "http://localhost:5000/api/health" | ConvertTo-Json
```

Expected:
```json
{
  "success": true,
  "message": "Server is running"
}
```

---

**🚀 You're ready to test the complete workflow!**
