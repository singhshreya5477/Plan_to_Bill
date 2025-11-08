# Dashboard Information Guide

## Overview
The Dashboard is the central hub of Plan-to-Bill, providing an overview of all projects, tasks, and key metrics after login. It combines project management with financial tracking in one unified interface.

---

## 🎯 Dashboard Layout

### 1. **KPI Cards** (Top Row)
Four key performance indicators displayed prominently:

| KPI | Description | Color | Icon |
|-----|-------------|-------|------|
| **Active Projects** | Number of projects currently in progress | Blue | 📁 |
| **Delayed Tasks** | Tasks that are behind schedule | Red | ⚠️ |
| **Hours Logged** | Total hours tracked across all projects | Green | ⏱️ |
| **Revenue Earned** | Total revenue from completed/ongoing projects | Purple | 💰 |

Each card includes:
- Current value
- Trend indicator (e.g., +12%, -5%)
- Color-coded icon
- Responsive layout

---

## 📊 Project View Section

### Navigation Tabs
Three main tabs for different views:

1. **Project Tab** (Default)
   - Shows all projects in card/list view
   - Filter by status
   - Create new projects
   - View project details

2. **Tasks Tab**
   - Quick link to task management
   - View tasks across all projects
   - Redirects to `/tasks` page

3. **Settings Tab**
   - Project configuration
   - Default settings
   - Preferences
   - Redirects to `/settings` page

---

## 🎴 View Modes

### Cards View (Grid)
**Visual card-based layout** showing projects as colorful cards:

**Card Components:**
```
┌─────────────────────────────────┐
│  [Colored Header]               │
│  Project Name                   │
│  Description                    │
│  [Image Previews: □ □ □]       │
├─────────────────────────────────┤
│  👤 Manager    📅 Deadline      │
│  ━━━━━━━━━━━━━ 65%             │
│  🎯 5 tasks    👥 3    ₹100K    │
└─────────────────────────────────┘
```

**Features:**
- Color-coded headers (unique per project)
- Image preview placeholders
- Progress bar with percentage
- Manager name and deadline
- Task count and team size
- Budget display
- Hover effects with shadow

### List View
**Compact row-based layout** for quick scanning:

```
[Icon] Project Name                Progress  Budget  Deadline
       Description • Manager          65%    ₹100K   Dec 15
```

**Features:**
- Horizontal layout
- Quick stats display
- Efficient space usage
- Better for many projects

---

## 🎨 Project Cards

### Current Projects

#### 1. **Super Rabbit**
- **Color**: Purple (#9333ea)
- **Manager**: drashti pateliya
- **Description**: RU Services
- **Status**: In Progress (65%)
- **Budget**: ₹100K
- **Deadline**: Dec 15, 2025
- **Team**: 3 members
- **Tasks**: 5 tasks
- **Images**: 3 previews

#### 2. **Neon**
- **Color**: Pink (#ec4899)
- **Manager**: drashti pateliya
- **Description**: RD Sales
- **Status**: In Progress (45%)
- **Budget**: ₹85K
- **Deadline**: Dec 20, 2025
- **Team**: 2 members
- **Tasks**: 8 tasks
- **Images**: 3 previews

#### 3. **Uncommon Hippopotamus**
- **Color**: Blue (#3b82f6)
- **Manager**: rizz_lord
- **Description**: RD Upgrade
- **Status**: In Progress (80%)
- **Budget**: ₹150K
- **Deadline**: Nov 30, 2025
- **Team**: 3 members
- **Tasks**: 12 tasks
- **Images**: 3 previews

#### 4. **Brand Website Redesign**
- **Color**: Cyan (#06b6d4)
- **Manager**: John Doe
- **Description**: Complete redesign
- **Status**: Planned (15%)
- **Budget**: ₹100K
- **Deadline**: Jan 15, 2026
- **Team**: 3 members
- **Tasks**: 6 tasks
- **Images**: 2 previews

#### 5. **Mobile App Development**
- **Color**: Green (#10b981)
- **Manager**: Jane Smith
- **Description**: iOS and Android app
- **Status**: Planned (10%)
- **Budget**: ₹250K
- **Deadline**: Mar 20, 2026
- **Team**: 2 members
- **Tasks**: 15 tasks
- **Images**: 4 previews

#### 6. **E-commerce Platform**
- **Color**: Orange (#f59e0b)
- **Manager**: Mike Johnson
- **Description**: Custom e-commerce
- **Status**: On Hold (40%)
- **Budget**: ₹180K
- **Deadline**: Nov 30, 2025
- **Team**: 4 members
- **Tasks**: 9 tasks
- **Images**: 3 previews

---

## 🔍 Filtering System

### Status Filters
Five filter buttons to organize projects:

1. **All Projects** (Default)
   - Shows all projects regardless of status
   - Total overview

2. **In Progress**
   - Currently active projects
   - Work is being done
   - Shows: Super Rabbit, Neon, Uncommon Hippopotamus

3. **Planned**
   - Future projects
   - Not yet started
   - Shows: Brand Website, Mobile App

4. **Completed**
   - Finished projects
   - 100% progress
   - Archived

5. **On Hold**
   - Temporarily paused
   - Awaiting decisions
   - Shows: E-commerce Platform

**UI Features:**
- Pill-shaped buttons
- Active filter highlighted in primary color
- Smooth transitions
- Responsive horizontal scrolling on mobile

---

## 🔄 Interactive Features

### View Toggle
Switch between Cards and List views:
- **Grid Icon** (📊): Cards view
- **List Icon** (≡): List view
- Seamless transition
- Remembers user preference

### New Project Button
- **Location**: Top right corner
- **Icon**: Plus (+) icon
- **Action**: Opens project creation form
- **Shortcut**: Quick access from any tab

### Project Click Actions
- **Cards**: Click entire card to open project details
- **List**: Click row to navigate
- **Destination**: `/projects/{id}` route
- **Hover**: Shadow and scale effect

---

## 💰 Financial Integration

### Connected Modules
Projects link to financial features:

1. **Sales Orders**
   - Order tracking per project
   - Revenue management
   - Route: `/sales-orders`

2. **Invoices**
   - Customer billing
   - Payment tracking
   - Route: `/customer-invoices`

3. **Purchase Orders**
   - Vendor orders
   - Procurement tracking
   - Route: `/purchase-orders`

4. **Vendor Bills**
   - Payables management
   - Expense tracking
   - Route: `/vendor-bills`

5. **Products**
   - Product catalog
   - Inventory
   - (To be implemented)

6. **Expenses**
   - Project expenses
   - Cost tracking
   - Route: `/expenses`

### Financial Workflow
```
Project Created
    ↓
Sales Order → Customer Invoice → Revenue
    ↓
Purchase Order → Vendor Bills → Expenses
    ↓
Project Budget vs Actual Tracking
```

---

## 📱 Responsive Design

### Desktop (1024px+)
- 3-column grid for cards
- Full KPI dashboard
- All filters visible
- Side-by-side tab navigation

### Tablet (768px - 1023px)
- 2-column grid for cards
- Compact KPI cards
- Horizontal scrolling filters
- Stacked navigation

### Mobile (< 768px)
- Single column layout
- Stacked KPI cards
- Touch-optimized buttons
- Mobile-first navigation

---

## 🎨 Theme Support

### Light Theme
- White/light gray backgrounds
- Dark text
- Vibrant project colors
- Soft shadows

### Dark Theme
- Dark backgrounds
- Light text
- Adjusted project colors
- Glowing effects

**Theme Variables:**
- `--bg-primary`: Main background
- `--bg-secondary`: Card background
- `--bg-tertiary`: Nested elements
- `--text-primary`: Main text
- `--text-secondary`: Subtle text
- `--text-tertiary`: Muted text
- `--primary`: Brand color
- `--border`: Border color

---

## 🔔 Dashboard Metrics Calculation

### Active Projects
```javascript
projects.filter(p => p.status === 'in_progress').length
```

### Revenue Earned
```javascript
projects.reduce((sum, p) => sum + p.revenue, 0)
```

### Delayed Tasks
- Tracks tasks past deadline
- Cross-project count
- Updates in real-time

### Hours Logged
- Aggregates timesheet entries
- Per-project tracking
- Team member contributions

---

## 🚀 Quick Actions

### From Dashboard
1. **Create New Project**: Click "New" button
2. **View Project Details**: Click any project card
3. **Filter Projects**: Use status filters
4. **Switch View**: Toggle cards/list mode
5. **Access Tasks**: Click "Tasks" tab
6. **Open Settings**: Click "Settings" tab

### Keyboard Shortcuts (Planned)
- `N`: New project
- `C`: Cards view
- `L`: List view
- `1-5`: Status filters
- `Esc`: Clear filters

---

## 📊 Data Structure

### Project Object
```javascript
{
  id: 1,
  name: 'Super Rabbit',
  client: 'Digital Solutions',
  status: 'in_progress',
  progress: 65,
  budget: 100000,
  spent: 45000,
  revenue: 40000,
  deadline: '2025-12-15',
  manager: 'drashti pateliya',
  team: ['Alice', 'Bob', 'Charlie'],
  description: 'RU Services',
  color: '#9333ea',
  images: 3,
  tasks: 5
}
```

### Status Values
- `planned`: Not started yet
- `in_progress`: Currently active
- `on_hold`: Temporarily paused
- `completed`: Finished
- `cancelled`: Abandoned (not shown)

---

## 🔗 Navigation Flow

```
Login → Dashboard
    ↓
    ├─ KPI Overview
    │   ├─ View All Projects
    │   ├─ Check Delayed Tasks
    │   └─ Review Revenue
    ↓
    ├─ Project View
    │   ├─ Filter by Status
    │   ├─ Switch View Mode
    │   └─ Open Project Details
    ↓
    ├─ Tasks View
    │   └─ Go to Tasks Page
    ↓
    └─ Settings View
        └─ Configure Preferences
```

---

## 🎯 User Roles & Permissions

### Admin
- Full access to all projects
- Can create/edit/delete projects
- Sees all financial data
- Manages team assignments

### Project Manager
- Access to assigned projects
- Can update project status
- Views team performance
- Limited financial access

### Team Member
- Views assigned projects only
- Can update task progress
- Logs time entries
- Read-only financial data

### Sales/Finance
- Full financial module access
- Views all projects
- Creates orders/invoices
- Reports and analytics

---

## 📈 Performance Metrics

### Load Time
- Initial render: < 1s
- Project cards: Lazy loading
- Images: Progressive loading
- Optimized re-renders

### Scalability
- Handles 100+ projects
- Pagination support (planned)
- Virtual scrolling (planned)
- Search functionality (planned)

---

## 🔧 Customization Options

### Dashboard Preferences
- Default view mode (cards/list)
- Default filter (all/status)
- KPI card order
- Color themes
- Date formats
- Currency symbols

### Project Display
- Card size
- Information density
- Sort order
- Group by client/manager
- Custom fields

---

## 🐛 Troubleshooting

### Projects Not Showing
1. Check filter selection
2. Verify project status
3. Clear cache
4. Refresh page

### KPI Data Incorrect
1. Check data sync
2. Verify calculations
3. Review API responses
4. Check date ranges

### View Mode Not Switching
1. Clear browser cache
2. Check localStorage
3. Verify JavaScript enabled
4. Try different browser

---

## 🔮 Future Enhancements

### Planned Features
- [ ] Drag-and-drop project sorting
- [ ] Gantt chart view
- [ ] Calendar view
- [ ] Kanban board
- [ ] Advanced filtering
- [ ] Custom dashboards
- [ ] Widget system
- [ ] Export to PDF/Excel
- [ ] Real-time collaboration
- [ ] Activity feed
- [ ] Notifications center
- [ ] Quick add forms
- [ ] Bulk operations
- [ ] Project templates
- [ ] AI-powered insights

---

## 📚 Related Documentation

- `LOGIN_PAGE_GUIDE.md` - Login system details
- `SINGLE_COMPANY_SIGNUP_DOCS.md` - Signup process
- `THEME_SYSTEM.md` - Theme customization
- `TESTING_GUIDE.md` - Testing procedures

---

## 🎓 Best Practices

### For Users
1. **Filter regularly** to focus on relevant projects
2. **Use cards view** for visual overview
3. **Switch to list view** for quick scanning
4. **Check KPIs daily** for health monitoring
5. **Update project status** regularly

### For Developers
1. **Keep data fresh** with efficient API calls
2. **Optimize images** for faster loading
3. **Implement caching** for better performance
4. **Use skeleton loaders** during data fetch
5. **Test with realistic data** volumes

---

**Last Updated**: November 8, 2025  
**Version**: 2.0.0 (Enhanced Dashboard with Project View)  
**Component**: `src/pages/Dashboard.jsx`
