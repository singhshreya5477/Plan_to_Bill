# 🚀 Company Signup - Quick Start Guide

## 📍 Access

**URL:** http://localhost:3001/company-signup

**From Login Page:** Click "Create Company Account" link

---

## ⚡ Quick Test (2 minutes)

### Step 1: Company Information
```
Company Name: Test Corp
Slug: test-corp (auto-generated)
Industry: IT & Software
→ Click "Next"
```

### Step 2: Admin Account
```
Full Name: Jane Admin
Email: jane@testcorp.com
Password: admin12345
Confirm: admin12345
→ Click "Next"
```

### Step 3: Company Details
```
Address: (leave empty or add any)
Currency: INR ₹
Timezone: Asia/Kolkata
Fiscal Year: April
→ Click "Next"
```

### Step 4: Subscription
```
Plan: Select "Free"
✓ Check "I agree to terms"
→ Click "Create Company Account"
```

**Result:** ✅ Redirected to dashboard, logged in as admin!

---

## 🎯 Key Features to Try

### 1. Auto-Slug Generation
Type company name → Watch slug generate automatically
- "Acme Corp" → "acme-corp"
- "Tech & Design" → "tech-design"

### 2. Slug Availability Check
- Try "acme-corp" → ❌ Already taken
- Change to "acme-corp-2" → ✅ Available!

### 3. Navigation
- Click "Previous" to go back
- Click "Next" to proceed
- Try "Next" without filling fields → See errors

### 4. Validation
- Try password less than 8 chars → Error
- Mismatch passwords → Error
- Try to proceed without terms → Error

### 5. Progress Indicator
Watch the blue line fill as you progress:
```
1 ━━━━ 2 ━━━━ 3 ━━━━ 4
✓     ✓     2     3
```

---

## 🎨 Visual Elements

### Icons You'll See
- 💼 Briefcase - Company name
- 🌐 Globe - Company slug
- 👤 User - Full name
- ✉️ Mail - Email
- 🔒 Lock - Password
- 📍 Map pin - Address
- 💰 Dollar - Currency
- 🕐 Clock - Timezone
- 📅 Calendar - Fiscal year
- ✓ Check - Completed steps

### Color Feedback
- **Blue** - Primary actions, completed steps
- **Green** - Success (slug available)
- **Red** - Errors, slug taken
- **Gray** - Inactive, future steps

---

## 📋 All Available Options

### Industries (11)
- IT & Software
- Consulting
- Manufacturing
- Healthcare
- Education
- Finance & Banking
- Retail & E-commerce
- Construction
- Marketing & Advertising
- Real Estate
- Other

### Currencies (6)
- ₹ INR - Indian Rupee
- $ USD - US Dollar
- € EUR - Euro
- £ GBP - British Pound
- A$ AUD - Australian Dollar
- C$ CAD - Canadian Dollar

### Timezones (10)
- Asia/Kolkata
- America/New_York
- America/Los_Angeles
- America/Chicago
- Europe/London
- Europe/Paris
- Asia/Tokyo
- Asia/Shanghai
- Australia/Sydney
- Pacific/Auckland

### Subscription Plans (4)
- **Free** - ₹0
- **Basic** - ₹999/month
- **Pro** - ₹2,999/month
- **Enterprise** - Contact Sales

---

## 🐛 Common Issues

### Issue: Slug shows "Already taken"
**Fix:** Change the slug to something unique
- Add numbers: "company-2"
- Add location: "company-mumbai"
- Be creative: "mycompany-pm"

### Issue: Can't click "Next"
**Check:**
- All required fields filled?
- Slug shows ✅ Available?
- Password matches confirmation?

### Issue: Validation errors
**Solution:** Read error messages carefully
- Red text below fields shows what's wrong
- Fix the issue and error disappears

### Issue: Stuck on a step
**Actions:**
- Click "Previous" to go back
- Click "Cancel" to start over
- Check browser console (F12) for errors

---

## 💡 Tips & Tricks

### Choosing a Slug
✅ **Good slugs:**
- Short: "acme"
- Clear: "tech-solutions"
- Professional: "global-consulting"

❌ **Avoid:**
- Too long: "acme-corporation-private-limited-india"
- Special chars: "acme@corp"
- Spaces: "acme corp"

### Password Selection
✅ **Good passwords:**
- Mix of letters and numbers
- At least 8 characters
- Easy to remember

❌ **Avoid:**
- Too short: "pass123"
- Common: "password"
- Only letters or only numbers

### Subscription Choice
- **Free** - Perfect for testing, small teams
- **Basic** - Good for growing teams
- **Pro** - Best for established companies
- **Enterprise** - Large organizations with custom needs

---

## 🎯 Success Checklist

After completing signup, you should:
- [ ] See dashboard with welcome message
- [ ] See company name in header badge
- [ ] Be logged in as admin
- [ ] Have access to all menu items
- [ ] See "Welcome back, [your name]!" message

---

## 📱 Mobile Testing

1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select iPhone or Android
4. Test the flow
5. **Expected:**
   - Single column layout
   - Full-width fields
   - Touch-friendly buttons
   - Easy to scroll

---

## 🔄 Test Different Plans

Try creating companies with different plans:

**Test 1: Startup (Free)**
```
Company: "Startup Inc"
Plan: Free
Use case: Small team testing
```

**Test 2: Agency (Basic)**
```
Company: "Creative Agency"
Plan: Basic
Use case: 15-person team
```

**Test 3: Enterprise (Pro)**
```
Company: "Enterprise Corp"
Plan: Pro
Use case: 80-person company
```

---

## 📊 What Gets Created

After successful signup:

**In Company Store:**
```javascript
{
  name: "Test Corp",
  slug: "test-corp",
  industry: "IT & Software",
  currency: "INR",
  timezone: "Asia/Kolkata",
  fiscalYearStart: "April",
  plan: "free",
  admin_email: "jane@testcorp.com"
}
```

**In Auth Store:**
```javascript
{
  name: "Jane Admin",
  email: "jane@testcorp.com",
  role: "admin",
  company: "Test Corp",
  companySlug: "test-corp"
}
```

**URL Available:**
```
https://test-corp.plantobill.com (in production)
```

---

## 🎨 Theme Testing

1. Complete Step 1
2. Open dashboard in new tab
3. Toggle theme (light/dark)
4. Return to signup tab
5. **Expected:**
   - Colors update
   - All text readable
   - Form still functional

---

## 🔗 Related Pages

- **Login:** http://localhost:3001/login
- **User Signup:** http://localhost:3001/signup
- **Dashboard:** http://localhost:3001/dashboard (after signup)

---

## 📚 Full Documentation

For complete details, see:
- **COMPANY_SIGNUP_DOCS.md** - Technical documentation
- **COMPANY_SIGNUP_SUMMARY.md** - Implementation summary

---

## 🎊 You're Ready!

**Start creating your company account now:**

http://localhost:3001/company-signup

**Takes only 2 minutes! 🚀**

---

**Questions?** Check the browser console (F12) or review the documentation files.

**Happy Onboarding! 🎉**
