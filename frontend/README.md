# OneFlow - Plan to Bill in One Place

A comprehensive Project Management System that enables project managers to take projects from planning → execution → billing in one unified platform.

## 🎯 Features

### Core Modules
- **Dashboard**: Real-time KPI widgets, project cards with filters (Planned, In Progress, Completed, On Hold)
- **Projects**: Create, edit, and manage projects with progress tracking and budget management
- **Tasks**: Task board with states (New → In Progress → Blocked → Done), hour logging, and assignments
- **Analytics**: Charts for project progress, resource utilization, and profitability analysis
- **Timesheets**: Track billable and non-billable hours with approval workflow
- **Financial Management**:
  - Sales Orders (What customers buy)
  - Purchase Orders (What you buy from vendors)
  - Customer Invoices (Your revenue)
  - Vendor Bills (Your costs)
  - Expenses (Team reimbursements)

### 🆕 Enhanced User Registration

**Multi-Step Company Signup:**
- **4-Step Wizard**: Company Info → Admin Account → Company Details → Subscription
- **Real-time Slug Validation**: Check URL availability (.plantobill.com)
- **Auto-Slug Generation**: Converts company name to URL-friendly format
- **Currency & Timezone**: Support for 6 currencies and 10 timezones
- **Subscription Plans**: Free, Basic (₹999/mo), Pro (₹2,999/mo), Enterprise
- **Progress Indicator**: Visual step tracker with checkmarks
- **Smart Navigation**: Can't proceed without completing required fields

**Role-Based Individual Signup:**
- **Dynamic Forms**: Adapts based on selected role (Admin, PM, Team, Sales/Finance)
- **24 Form Fields**: Comprehensive data collection for each role
- **Multi-Company Support**: Create new companies or join existing ones
- **Password Security**: 8+ character requirement with show/hide toggle
- **Theme Integration**: Seamless light/dark mode support
- **Auto-Login**: Smooth onboarding after successful registration

### User Roles
- **⚡ Admin**: Full system access, company administration, requires access code
- **👔 Project Manager**: Create/edit projects, assign team, manage tasks, approve expenses, hourly rate tracking
- **👤 Team Member**: View tasks, log hours, submit expenses, reports to manager, hourly rate tracking
- **💼 Sales/Finance**: Create and link financial documents, granular permissions for different operations

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Install dependencies**
```bash
npm install
```

2. **Start development server**
```bash
npm run dev
```

The application will open at `http://localhost:3000`

### Demo Accounts

You can log in with these demo accounts:

- **Admin**: admin@oneflow.com (password: any)
- **Project Manager**: pm@oneflow.com (password: any)
- **Team Member**: member@oneflow.com (password: any)
- **Sales**: sales@oneflow.com (password: any)
- **Finance**: finance@oneflow.com (password: any)

## 📁 Project Structure

```
Plan_to_Bill/
├── src/
│   ├── components/
│   │   ├── layout/          # Layout components (Sidebar, Header, MainLayout)
│   │   ├── dashboard/       # Dashboard-specific components (KPICard, ProjectCard)
│   │   └── common/          # Common components (ThemeToggle)
│   ├── pages/
│   │   ├── auth/            
│   │   │   ├── Login.jsx    # User login page
│   │   │   ├── Signup.jsx   # Legacy signup (deprecated)
│   │   │   └── SignupNew.jsx # 🆕 Enhanced role-based signup
│   │   ├── financial/       # Financial management pages
│   │   │   ├── SalesOrders.jsx
│   │   │   ├── PurchaseOrders.jsx
│   │   │   ├── CustomerInvoices.jsx
│   │   │   ├── VendorBills.jsx
│   │   │   └── Expenses.jsx
│   │   ├── Dashboard.jsx    # Main dashboard
│   │   ├── Projects.jsx     # Projects list and management
│   │   ├── ProjectDetail.jsx # Individual project view
│   │   ├── Tasks.jsx        # Task management
│   │   ├── Analytics.jsx    # Analytics and charts
│   │   ├── Timesheets.jsx   # Timesheet tracking
│   │   ├── Profile.jsx      # User profile (with company info)
│   │   └── Settings.jsx     # Application settings
│   ├── store/               
│   │   ├── authStore.js     # User authentication state
│   │   ├── projectStore.js  # Project management state
│   │   ├── themeStore.js    # Theme (light/dark) state
│   │   └── companyStore.js  # 🆕 Multi-company state
│   ├── App.jsx              # Main application component with routing
│   ├── main.jsx            # Application entry point
│   └── index.css           # Global styles with CSS variables
├── docs/                    # 🆕 Documentation files
│   ├── MULTI_COMPANY_SETUP.md       # Multi-company backend guide
│   ├── SIGNUP_PAGE_DOCS.md          # Complete signup documentation
│   ├── SIGNUP_TESTING_GUIDE.md      # 25 test scenarios
│   ├── SIGNUP_IMPLEMENTATION_SUMMARY.md # Implementation details
│   ├── SIGNUP_QUICK_REFERENCE.md    # Quick reference card
│   ├── TESTING_GUIDE.md             # General testing guide
│   └── THEME_SYSTEM.md              # Theme system documentation
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.cjs
└── README.md
```

## 🛠️ Tech Stack

- **Frontend Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **Icons**: React Icons
- **Date Handling**: date-fns
- **Build Tool**: Vite
- **HTTP Client**: Axios (ready for API integration)

## 💡 Key Workflows

### 1. Fixed-Price Project
```
1. Sales creates Sales Order (₹1,00,000)
2. Project Manager creates milestones and tasks
3. Team logs hours on tasks
4. PM creates Customer Invoice when milestone completes
5. View profit = Revenue - Costs in project overview
```

### 2. Vendor Management
```
1. Create Purchase Order for vendor services
2. Link PO to project
3. Vendor completes work
4. Record Vendor Bill against PO
5. Project costs update automatically
```

### 3. Expense Tracking
```
1. Team member submits expense with receipt
2. Links expense to project
3. PM approves (billable/non-billable)
4. Costs reflected in project totals
5. Reimburse team member
```

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Role-Based Navigation**: Menu items adjust based on user role
- **Modern Interface**: Clean, professional design with Tailwind CSS
- **🆕 Dark/Light Theme**: System-wide theme toggle with smooth transitions
- **Interactive Charts**: Visual analytics with Recharts
- **Status Badges**: Color-coded project and task statuses
- **Progress Indicators**: Visual progress bars for projects
- **Quick Access**: Links panel for rapid document access
- **Search & Filter**: Powerful filtering across all modules
- **🆕 Enhanced Forms**: Dynamic role-based forms with smart validation
- **🆕 Company Badges**: Visual company identification in header and profile
- **Password Visibility Toggle**: User-friendly password entry
- **Inline Validation**: Real-time form validation with helpful errors

## 🔐 Authentication

The app uses Zustand for state management with persistent storage. In production, integrate with your backend API:

```javascript
// Example: Update authStore.js to call your API
const login = async (email, password) => {
  const response = await axios.post('/api/auth/login', { email, password });
  set({ user: response.data.user, token: response.data.token });
};
```

## 📊 Analytics Dashboard

Visualize key metrics:
- Project progress percentages
- Resource utilization by team member
- Cost vs Revenue analysis per project
- Billable vs Non-billable hours breakdown

## � Documentation

Comprehensive documentation is available in the project:

- **[SIGNUP_PAGE_DOCS.md](SIGNUP_PAGE_DOCS.md)** - Complete signup system documentation
- **[SIGNUP_TESTING_GUIDE.md](SIGNUP_TESTING_GUIDE.md)** - 25 test scenarios for signup
- **[SIGNUP_QUICK_REFERENCE.md](SIGNUP_QUICK_REFERENCE.md)** - Quick reference card
- **[MULTI_COMPANY_SETUP.md](MULTI_COMPANY_SETUP.md)** - Multi-company backend integration
- **[THEME_SYSTEM.md](THEME_SYSTEM.md)** - Dark/Light theme implementation
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - General testing instructions

## �🔄 Future Enhancements

- Drag-and-drop task board (Kanban style)
- Real-time notifications
- Document attachments
- **Email verification** for new accounts
- Advanced reporting
- Mobile app
- API integration with accounting software
- Multi-currency support
- Automated invoicing
- **Password strength meter**
- **Social login** (Google, GitHub)
- **Company invite system**
- **Multi-step signup wizard**

## 🤝 Contributing

This is a hackathon project designed to demonstrate real-world ERP workflows. Feel free to extend and customize based on your needs.

## 📝 License

MIT License - feel free to use this project for learning and development.

## 📧 Support

For questions or issues, please open an issue in the repository.

---

**Built for the Hackathon Challenge**: Understanding how modules talk to each other in real-world business workflows (Projects → Sales → Purchases → Billing).
