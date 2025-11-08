# 🧪 Enhanced Signup Page - Quick Testing Guide

## 🚀 Getting Started

**Access the page:** http://localhost:3001/signup

---

## ✅ Test Scenarios

### 📋 Test 1: Admin Account Creation

**Steps:**
1. Go to http://localhost:3001/signup
2. Select **"⚡ Admin"** from Account Type dropdown
3. Fill in:
   - Full Name: `Jane Admin`
   - Work Email: `jane@newcompany.com`
   - Password: `admin1234` (8+ characters)
   - Confirm Password: `admin1234`
   - Phone: `+91 98765 43210` (optional)
   - Company Name: `TechCorp Solutions`
   - ✅ Check "This is a new company"
   - Admin Access Code: `ADMIN2024`
4. **Expected Result:**
   - ⚠️ Yellow info box appears showing admin privileges
   - Admin Access Code field is visible
   - All validation passes
5. Click **"Create Account"**
6. **Expected:** Redirect to dashboard, auto-logged in

---

### 📋 Test 2: Project Manager Account

**Steps:**
1. Select **"👔 Project Manager"**
2. Fill in:
   - Full Name: `Mike Manager`
   - Work Email: `mike@acme.com`
   - Password: `manager123`
   - Confirm Password: `manager123`
   - Company Name: `Acme Corp`
   - Department: `IT`
   - Employee ID: `EMP123`
   - Hourly Rate: `1500`
   - ✅ Check "Can Approve Expenses"
3. **Expected Result:**
   - Department dropdown appears
   - Employee ID field visible
   - Hourly Rate with ₹ symbol and "/hour" suffix
   - Checkbox for expense approval
4. Click **"Create Account"**
5. **Expected:** Success → Dashboard

---

### 📋 Test 3: Team Member Account

**Steps:**
1. Select **"👤 Team Member"**
2. Fill in:
   - Full Name: `Sarah Developer`
   - Work Email: `sarah@acme.com`
   - Password: `dev12345`
   - Confirm Password: `dev12345`
   - Company Name: `Acme Corp`
   - Reports To: `John Smith`
   - Designation: `Frontend Developer`
   - Hourly Rate: `1200`
   - Skills: `React, TypeScript, CSS`
3. **Expected Result:**
   - "Reports To" dropdown with managers
   - Designation text field
   - Hourly Rate field
   - Skills text field
4. Click **"Create Account"**
5. **Expected:** Success → Dashboard

---

### 📋 Test 4: Sales/Finance Account

**Steps:**
1. Select **"💼 Sales / Finance"**
2. Fill in:
   - Full Name: `John Sales`
   - Work Email: `john@acme.com`
   - Password: `sales123`
   - Confirm Password: `sales123`
   - Company Name: `Acme Corp`
   - Department: Select **"Sales"** radio button
   - Employee ID: `SAL001`
3. Check permissions:
   - ✅ Can create Sales Orders
   - ✅ Can create Purchase Orders
   - ✅ Can create Customer Invoices
   - ✅ Can create Vendor Bills
   - ⬜ Can approve expenses (optional)
4. **Expected Result:**
   - Radio buttons for dept selection
   - 5 permission checkboxes
   - First 4 checked by default
5. Click **"Create Account"**
6. **Expected:** Success → Dashboard

---

## 🔍 Validation Tests

### ❌ Test 5: Empty Form Submission

**Steps:**
1. Leave all fields empty
2. Click **"Create Account"**
3. **Expected:** Red error box: "Please select an account type/role"

---

### ❌ Test 6: Short Password

**Steps:**
1. Select any role
2. Fill name and email
3. Password: `123` (less than 8 characters)
4. Confirm Password: `123`
5. Fill company name
6. Click **"Create Account"**
7. **Expected:** Red error below password: "Password must be at least 8 characters"

---

### ❌ Test 7: Password Mismatch

**Steps:**
1. Select any role
2. Fill name and email
3. Password: `password123`
4. Confirm Password: `password456` (different)
5. Click **"Create Account"**
6. **Expected:** Red error: "Passwords do not match"

---

### ❌ Test 8: Admin Without Access Code

**Steps:**
1. Select **"⚡ Admin"**
2. Fill all basic info
3. Check "This is a new company"
4. **Leave Admin Access Code empty**
5. Click **"Create Account"**
6. **Expected:** Error: "Admin Access Code is required for admin accounts"

---

### ❌ Test 9: PM Without Hourly Rate

**Steps:**
1. Select **"👔 Project Manager"**
2. Fill all basic info
3. Select department
4. **Leave Hourly Rate empty**
5. Click **"Create Account"**
6. **Expected:** Error: "Hourly Rate is required for Project Managers"

---

### ❌ Test 10: Duplicate Admin (Multi-Company Feature)

**Steps:**
1. Select **"⚡ Admin"**
2. Fill in:
   - Name: `Another Admin`
   - Email: `another@acme.com`
   - Password: `admin123`
   - Confirm Password: `admin123`
   - Company Name: `Acme Corp` (existing company)
   - ⬜ Leave "This is a new company" UNCHECKED
   - Admin Access Code: `ADMIN2024`
3. Click **"Create Account"**
4. **Expected:** Error: "This company already has an admin: admin@acme.com"

---

## 👁️ UI/UX Tests

### ✅ Test 11: Password Visibility Toggle

**Steps:**
1. Enter password: `test1234`
2. Click 👁️ (eye icon) in password field
3. **Expected:** Password becomes visible as plain text
4. Click 👁️‍🗨️ (eye-off icon)
5. **Expected:** Password becomes hidden again

---

### ✅ Test 12: Role Change Updates Fields

**Steps:**
1. Select **"⚡ Admin"** → Note the fields that appear
2. Switch to **"👔 Project Manager"**
3. **Expected:** Admin fields disappear, PM fields appear
4. Switch to **"👤 Team Member"**
5. **Expected:** PM fields disappear, Team fields appear
6. Switch to **"💼 Sales / Finance"**
7. **Expected:** Team fields disappear, Sales/Finance fields appear

---

### ✅ Test 13: Theme Toggle Compatibility

**Steps:**
1. Fill out form partially
2. Navigate to dashboard (if logged in) or login page
3. Toggle theme (light/dark)
4. Return to signup page
5. **Expected:** 
   - Form maintains data
   - Colors adapt to new theme
   - All text is readable
   - Borders and backgrounds change appropriately

---

### ✅ Test 14: Section Dividers

**Steps:**
1. Scroll through the form
2. **Expected:** See 3 divider lines with labels:
   - "Basic Information"
   - "Role-Specific Details" (after selecting role)
   - "Additional Settings"

---

### ✅ Test 15: Additional Settings

**Steps:**
1. Scroll to bottom
2. **Check Account Status:**
   - Active (default selected)
   - Inactive
3. **Check Send Welcome Email:**
   - ✅ Checkbox checked by default
   - Uncheck and recheck
4. **Expected:** All controls work smoothly

---

## 📱 Responsive Tests

### ✅ Test 16: Mobile View

**Steps:**
1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone 12 Pro or similar
4. **Expected:**
   - Single column layout
   - All fields stack vertically
   - Buttons full width
   - Text readable
   - No horizontal scroll

---

### ✅ Test 17: Tablet View

**Steps:**
1. In DevTools, select iPad or similar
2. **Expected:**
   - Wider form container
   - Grid layout for some fields (PM: department + employee ID)
   - Comfortable spacing

---

## 🎨 Visual Tests

### ✅ Test 18: Light Theme

**Steps:**
1. Ensure theme is set to Light
2. **Check:**
   - White/light gray background
   - Dark text on light bg
   - Blue primary color for buttons
   - Subtle shadows
   - Clear borders

---

### ✅ Test 19: Dark Theme

**Steps:**
1. Switch to Dark theme
2. **Check:**
   - Dark background
   - Light text on dark bg
   - Primary color adjusted for contrast
   - No pure white elements (softer colors)
   - Visible but not harsh borders

---

## 🔗 Navigation Tests

### ✅ Test 20: Cancel Button

**Steps:**
1. Fill form partially
2. Click **"Cancel"** button
3. **Expected:** Navigate to /login page

---

### ✅ Test 21: "Already have an account?" Link

**Steps:**
1. Scroll to bottom of form
2. Click **"Sign in"** link
3. **Expected:** Navigate to /login page

---

### ✅ Test 22: Direct Access When Logged In

**Steps:**
1. Login to the app
2. Manually navigate to http://localhost:3001/signup
3. **Expected:** Automatically redirect to /dashboard

---

## 🎯 Integration Tests

### ✅ Test 23: Create Account → Auto Login → Dashboard

**Steps:**
1. Complete full signup flow with valid data
2. Click **"Create Account"**
3. **Expected:**
   - No login screen appears
   - Directly land on dashboard
   - Header shows "Welcome back, [name]!"
   - Sidebar shows all menu items

---

### ✅ Test 24: Company Badge Display

**Steps:**
1. Signup with company name "Test Corp"
2. After redirect to dashboard
3. **Expected:**
   - Header shows company badge "Test Corp"
   - Badge has rounded pill shape
   - Badge uses primary color

---

### ✅ Test 25: Profile Page Company Info

**Steps:**
1. Complete signup
2. Navigate to Profile page (sidebar)
3. **Expected:**
   - Company name shows with 💼 icon
   - Company text uses primary color
   - All user info displayed correctly

---

## 📊 Testing Summary Checklist

| Category | Tests | Status |
|----------|-------|--------|
| **Role-Specific Forms** | 4 tests | ⬜ |
| **Validation** | 6 tests | ⬜ |
| **UI/UX** | 5 tests | ⬜ |
| **Responsive** | 2 tests | ⬜ |
| **Visual/Theme** | 2 tests | ⬜ |
| **Navigation** | 3 tests | ⬜ |
| **Integration** | 3 tests | ⬜ |
| **TOTAL** | **25 tests** | ⬜ |

---

## 🐛 Known Issues to Check

- [ ] Browser console shows no errors
- [ ] No React warnings in DevTools
- [ ] All images/icons load correctly
- [ ] No layout shifts during page load
- [ ] Form submission doesn't cause flicker
- [ ] Validation errors clear when corrected
- [ ] No memory leaks on form interactions

---

## 📝 Test Report Template

After testing, document results:

```
Date: [Current Date]
Browser: [Chrome/Firefox/Safari]
OS: [Windows/Mac/Linux]
Theme Tested: [Light/Dark/Both]

✅ Passed: [X/25]
❌ Failed: [Y/25]
⚠️ Issues: [List any bugs found]

Notes:
- [Any observations]
- [Performance notes]
- [Suggestions]
```

---

## 🎉 Happy Testing!

**Remember:**
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test on real devices (mobile, tablet)
- Test both light and dark themes
- Test with slow network (DevTools → Network → Slow 3G)
- Test with screen readers for accessibility

**URL to Test:** http://localhost:3001/signup

---

**Need Help?**
- Check browser console (F12)
- Review `SIGNUP_PAGE_DOCS.md` for full documentation
- Check `src/pages/auth/SignupNew.jsx` for implementation details
