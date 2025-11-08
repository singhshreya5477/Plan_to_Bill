# Multi-Company Feature Documentation

## Overview
OneFlow now supports multi-company functionality, allowing multiple organizations to use the platform with complete data isolation. Each company can have one administrator and multiple team members.

## Features

### 1. **Company-Based Registration**
- Users select or create a company during signup
- New companies can be registered by checking "This is a new company"
- Existing companies can be joined by team members

### 2. **One Admin Per Company Rule**
- Each company can only have **ONE admin** (Company Owner)
- System validates during signup to prevent duplicate admins
- Clear error modal guides users to select different role if admin already exists

### 3. **Company Display**
- Company name displayed in header next to username
- Company badge shown in user profile
- Company context maintained throughout the session

## User Flow

### Creating a New Company (Admin)
1. Navigate to Signup page
2. Fill in name, email, and password
3. Enter company name
4. Check "This is a new company" checkbox
5. Select "Admin (Company Owner)" role
6. Submit form
7. Admin account created for new company

### Joining Existing Company (Team Member)
1. Navigate to Signup page
2. Fill in name, email, and password
3. Select company from dropdown or type company name
4. Leave "This is a new company" unchecked
5. Select appropriate role (Project Manager, Team Member, etc.)
6. Submit form
7. Team member account created under existing company

### Login Flow
1. Enter email and password
2. System identifies user's company from email
3. User logged in with company context
4. Company name displayed in header and profile

## Technical Implementation

### State Management

#### `src/store/companyStore.js`
Manages company data and validation logic:
- `companies`: Array of all companies
- `addCompany()`: Creates new company
- `checkCompanyExists()`: Validates if company exists
- `getCompanyByName()`: Retrieves company details

#### `src/store/authStore.js`
Enhanced with company field:
- `company`: Current user's company name
- `login()`: Stores company during authentication
- `updateUser()`: Updates user and company info

### Components

#### `src/pages/auth/Signup.jsx`
Enhanced signup form with:
- Company name field with icon
- "This is a new company" checkbox
- Admin validation logic
- Error modal for duplicate admin attempts
- Dynamic company selection

#### `src/components/layout/Header.jsx`
Displays company badge next to username

#### `src/pages/Profile.jsx`
Shows company information with briefcase icon

## Mock Data Structure

```javascript
// Initial companies in companyStore.js
const companies = [
  { 
    id: 1, 
    name: 'Acme Corp', 
    admin_email: 'admin@acme.com',
    created_at: '2024-01-15'
  },
  { 
    id: 2, 
    name: 'TechStart Inc', 
    admin_email: 'admin@techstart.com',
    created_at: '2024-02-01'
  }
];
```

## Testing

### Test Scenarios

#### 1. Create New Company as Admin
```
✅ Navigate to /signup
✅ Enter: name="John Doe", email="john@newcompany.com", password="test123"
✅ Enter: company="New Company Inc"
✅ Check "This is a new company"
✅ Select role "Admin (Company Owner)"
✅ Click Register
✅ Expected: Success → redirect to login
```

#### 2. Attempt Duplicate Admin (Should Fail)
```
❌ Navigate to /signup
❌ Enter: name="Jane Doe", email="jane@acme.com", password="test123"
❌ Enter: company="Acme Corp"
❌ Leave "This is a new company" unchecked
❌ Select role "Admin (Company Owner)"
❌ Click Register
❌ Expected: Modal appears with error message
```

#### 3. Join Existing Company as Team Member
```
✅ Navigate to /signup
✅ Enter: name="Bob Smith", email="bob@acme.com", password="test123"
✅ Enter: company="Acme Corp"
✅ Leave "This is a new company" unchecked
✅ Select role "Team Member"
✅ Click Register
✅ Expected: Success → redirect to login
```

#### 4. Login and View Company
```
✅ Navigate to /login
✅ Enter: email="admin@acme.com", password="test123"
✅ Click Login
✅ Expected: 
   - Redirected to /dashboard
   - Header shows "Welcome back, admin!" with "Acme Corp" badge
   - Navigate to /profile
   - Profile shows company name with briefcase icon
```

## Backend Integration (TODO)

### Required API Endpoints

#### 1. Company Management
```
POST   /api/companies              - Create new company
GET    /api/companies              - List all companies
GET    /api/companies/:id          - Get company details
PUT    /api/companies/:id          - Update company
DELETE /api/companies/:id          - Delete company
GET    /api/companies/:id/users    - List company users
```

#### 2. User Management with Company
```
POST   /api/auth/register          - Register user with company
POST   /api/auth/login             - Login (returns user + company)
GET    /api/users/:id              - Get user with company
PUT    /api/users/:id              - Update user
```

### Database Schema

#### Companies Table
```sql
CREATE TABLE companies (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) UNIQUE NOT NULL,
  admin_user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### Users Table (Enhanced)
```sql
ALTER TABLE users ADD COLUMN company_id INTEGER REFERENCES companies(id);
CREATE INDEX idx_users_company ON users(company_id);
```

### API Request/Response Examples

#### Register New Company
```javascript
// POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@newcompany.com",
  "password": "securepassword",
  "company_name": "New Company Inc",
  "is_new_company": true,
  "role": "admin"
}

// Response
{
  "success": true,
  "user": {
    "id": 123,
    "name": "John Doe",
    "email": "john@newcompany.com",
    "role": "admin",
    "company": {
      "id": 45,
      "name": "New Company Inc"
    }
  },
  "token": "jwt_token_here"
}
```

#### Join Existing Company
```javascript
// POST /api/auth/register
{
  "name": "Jane Smith",
  "email": "jane@acme.com",
  "password": "securepassword",
  "company_name": "Acme Corp",
  "is_new_company": false,
  "role": "team_member"
}

// Response
{
  "success": true,
  "user": {
    "id": 124,
    "name": "Jane Smith",
    "email": "jane@acme.com",
    "role": "team_member",
    "company": {
      "id": 1,
      "name": "Acme Corp"
    }
  },
  "token": "jwt_token_here"
}
```

#### Validate Admin Error
```javascript
// POST /api/auth/register (with duplicate admin)
{
  "name": "Bob Admin",
  "email": "bob@acme.com",
  "password": "securepassword",
  "company_name": "Acme Corp",
  "is_new_company": false,
  "role": "admin"
}

// Response (400 Bad Request)
{
  "success": false,
  "error": "ADMIN_EXISTS",
  "message": "This company already has an admin account",
  "company": "Acme Corp",
  "admin_email": "admin@acme.com"
}
```

## Validation Rules

### Frontend Validation
1. ✅ Company name required for all registrations
2. ✅ "This is a new company" must be checked for new companies
3. ✅ Admin role only available for new companies
4. ✅ Existing company must have admin already
5. ✅ Email format validation
6. ✅ Password minimum 6 characters

### Backend Validation (To Implement)
1. ⏳ Verify company doesn't exist when creating new
2. ⏳ Verify company exists when joining existing
3. ⏳ Verify no existing admin when admin role selected
4. ⏳ Email uniqueness across platform
5. ⏳ Rate limiting on registration attempts
6. ⏳ Company name uniqueness (case-insensitive)

## Security Considerations

### Data Isolation
- All queries must filter by `company_id`
- Users can only see data from their company
- API endpoints must validate company context
- JWT token includes company_id claim

### Access Control
- Admin can manage all users in their company
- Project Managers can manage projects in their company
- Team Members have read-only access to their company data
- Sales/Finance roles have department-specific permissions

### Middleware Example
```javascript
// Express middleware for company isolation
const requireCompanyContext = (req, res, next) => {
  const userCompanyId = req.user.company_id;
  
  // Inject company filter into query
  req.companyFilter = { company_id: userCompanyId };
  
  next();
};

// Usage
app.get('/api/projects', requireCompanyContext, async (req, res) => {
  const projects = await Project.find(req.companyFilter);
  res.json(projects);
});
```

## UI/UX Features

### Visual Indicators
- 🏢 Company badge in header (pill-shaped, theme-aware)
- 💼 Briefcase icon next to company name
- 🎨 Primary color for company badge
- ⚡ Smooth animations for modal

### Error Handling
- Modal popup for admin validation errors
- Clear action buttons: "Close" and "Change Role"
- Helpful error messages with context
- Animation: scale-in effect for modal appearance

### Responsive Design
- Mobile-friendly company selection
- Touch-friendly modal buttons
- Readable company badges on small screens

## Future Enhancements

### Planned Features
1. **Company Settings Page**
   - Edit company name
   - Upload company logo
   - Manage company-wide settings
   - Billing and subscription info

2. **Company Switching**
   - Allow users to be part of multiple companies
   - Quick company switcher in header
   - Separate data context per company

3. **Invite System**
   - Admin can invite users via email
   - Pre-filled signup links with company context
   - Email verification for invites

4. **Company Analytics**
   - Company-wide dashboards
   - Usage statistics
   - User activity logs

5. **Advanced Permissions**
   - Custom roles per company
   - Permission matrix for features
   - Department-based access control

## Support and Troubleshooting

### Common Issues

#### "Admin already exists" Error
- **Cause**: Trying to create admin for existing company
- **Solution**: Select different role or create new company

#### Company Not Found
- **Cause**: Company name doesn't exist
- **Solution**: Check spelling or create new company

#### Cannot See Company Data
- **Cause**: User not properly assigned to company
- **Solution**: Re-login or contact admin

## Contributing

When adding features related to multi-company:
1. Always filter queries by `company_id`
2. Display company context in relevant UI
3. Add proper validation for company isolation
4. Update this documentation
5. Add tests for company-specific scenarios

## Contact

For questions or issues:
- Frontend: Check `src/store/companyStore.js`
- Backend: Implement endpoints in `/MULTI_COMPANY_SETUP.md`
- Issues: Open GitHub issue with "multi-company" label
