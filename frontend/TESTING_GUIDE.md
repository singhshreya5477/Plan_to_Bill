# Multi-Company Feature Testing Guide

## ✅ Quick Test Instructions

The development server is running at: **http://localhost:3001/**

### Test Scenario 1: Try Creating Duplicate Admin (Should Show Error Modal)

1. **Open your browser** and go to: http://localhost:3001/signup

2. **Fill in the signup form:**
   - **Full Name**: Jane Admin
   - **Email**: jane@acme.com
   - **Password**: test123
   - **Company Name**: Acme Corp
   - **"This is a new company"**: ❌ Leave UNCHECKED (joining existing company)
   - **Role**: Admin (Company Owner)

3. **Click "Create Account"**

4. **Expected Result**: ✨
   - A modal should appear with:
     - ⚠️ Alert icon
     - Message: "This company already has an administrator account"
     - Details about existing admin
     - Two buttons: "Close" and "Change Role"

### Test Scenario 2: Create New Company as Admin (Should Succeed)

1. **Go to**: http://localhost:3001/signup

2. **Fill in the signup form:**
   - **Full Name**: Sarah Johnson
   - **Email**: sarah@startup.com
   - **Password**: test123
   - **Company Name**: My Startup Inc
   - **"This is a new company"**: ✅ CHECK THIS BOX
   - **Role**: Admin (Company Owner)

3. **Click "Create Account"**

4. **Expected Result**: ✨
   - Success! Redirected to login page
   - You can now login with: sarah@startup.com

### Test Scenario 3: Join Existing Company as Team Member (Should Succeed)

1. **Go to**: http://localhost:3001/signup

2. **Fill in the signup form:**
   - **Full Name**: Mike Developer
   - **Email**: mike@acme.com
   - **Password**: test123
   - **Company Name**: Acme Corp
   - **"This is a new company"**: ❌ Leave UNCHECKED
   - **Role**: Team Member

3. **Click "Create Account"**

4. **Expected Result**: ✨
   - Success! Redirected to login page
   - You can now login with: mike@acme.com

### Test Scenario 4: Login and View Company Name

1. **Go to**: http://localhost:3001/login

2. **Login with:**
   - **Email**: admin@acme.com
   - **Password**: (any password)

3. **Expected Result**: ✨
   - Redirected to dashboard
   - **Header shows**: "Welcome back, admin!" with **"Acme Corp"** badge
   - Badge is styled with primary color and rounded pill shape

4. **Navigate to Profile** (click sidebar → Profile)

5. **Expected Result**: ✨
   - Profile shows your name
   - Under name, you see role: "Admin"
   - Below that: 💼 **"Acme Corp"** with briefcase icon

---

## 🎨 Visual Features to Check

### Header Badge
- [ ] Company name appears next to "Welcome back"
- [ ] Badge has rounded pill shape
- [ ] Badge uses primary color (blue)
- [ ] Badge has light background
- [ ] Text is readable in both light/dark theme

### Signup Form
- [ ] Company field has briefcase icon (💼)
- [ ] "This is a new company" checkbox works
- [ ] Role dropdown shows "Admin (Company Owner)"
- [ ] All fields have proper theme colors

### Error Modal
- [ ] Modal appears with scale-in animation
- [ ] Alert icon (⚠️) is visible
- [ ] Background has dark overlay
- [ ] Modal is centered on screen
- [ ] "Close" button dismisses modal
- [ ] "Change Role" button is styled differently
- [ ] Modal is responsive on mobile

### Profile Page
- [ ] Company name shows with briefcase icon
- [ ] Company text uses primary color
- [ ] Layout looks clean with avatar and info

---

## 🐛 Common Issues & Solutions

### Issue: Modal doesn't appear
**Solution**: Check browser console (F12) for errors, verify `index.css` has `@keyframes scale-in` animation

### Issue: Company badge not showing in header
**Solution**: Make sure you're logged in with a user that has a company assigned

### Issue: Signup form looks broken
**Solution**: Check that Tailwind CSS is loaded, verify `index.css` has CSS variables

### Issue: Can't click modal buttons
**Solution**: Check z-index of modal, should be higher than other elements

---

## 📝 Current Mock Companies

These companies exist in the system (from `companyStore.js`):

| Company Name | Admin Email | Status |
|--------------|-------------|--------|
| Acme Corp | admin@acme.com | ✅ Active |
| TechStart Inc | admin@techstart.com | ✅ Active |

---

## 🔧 Testing Checklist

- [ ] Open http://localhost:3001/signup
- [ ] Try creating duplicate admin for "Acme Corp" → Modal appears
- [ ] Close modal with "Close" button → Modal disappears
- [ ] Try creating new company "My Startup Inc" as admin → Success
- [ ] Try joining "Acme Corp" as "Team Member" → Success
- [ ] Login with admin@acme.com → Company badge shows in header
- [ ] Navigate to Profile → Company name shows with icon
- [ ] Toggle dark/light theme → Company badge colors adapt
- [ ] Test on mobile view → Everything responsive

---

## 📸 Expected Screenshots

### 1. Signup Form
- All fields visible and properly styled
- Company field with icon
- "This is a new company" checkbox
- Role dropdown with Admin option

### 2. Error Modal
- Centered modal with overlay
- Alert icon and error message
- Two action buttons
- Smooth animation

### 3. Header with Company Badge
- "Welcome back, [name]!" text
- Company name in rounded badge
- Theme toggle button
- Clean spacing

### 4. Profile with Company
- User avatar (circle with initial)
- Name and role
- Company name with briefcase icon
- Edit button

---

## 🎯 Next Steps After Testing

If everything works:
1. ✅ Multi-company frontend is complete
2. 📝 Document any visual issues
3. 🔌 Ready for backend API integration
4. 📊 Plan company analytics dashboard

If issues found:
1. 🐛 Note specific errors in browser console
2. 📱 Test different screen sizes
3. 🎨 Verify theme colors in dark/light mode
4. 💬 Report issues for fixing

---

## 💡 Tips

- Use **Chrome DevTools** (F12) to inspect elements
- Test in both **light and dark theme**
- Try different screen sizes (mobile, tablet, desktop)
- Check **network tab** for any failed requests
- Use **React DevTools** to inspect component state

---

**Happy Testing! 🚀**
