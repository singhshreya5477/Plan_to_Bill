# OneFlow Plan-to-Bill - Component Architecture

## 📁 Project Structure

```
src/
├── pages/
│   ├── auth/
│   │   ├── Login.jsx                    # User authentication page
│   │   └── Signup.jsx                   # User registration page
│   │
│   ├── Dashboard.jsx                    # Main dashboard with KPIs and projects
│   ├── Tasks.jsx                        # Kanban board for task management
│   ├── TaskCreate.jsx                   # Task creation/edit form
│   ├── Projects.jsx                     # Projects list view
│   └── ...
│
├── components/
│   ├── dashboard/
│   │   ├── KPICard.jsx                  # Key performance indicator cards
│   │   └── ProjectCard.jsx              # Project card with cover image, tags, priority
│   │
│   ├── tasks/
│   │   ├── TaskCard.jsx                 # Draggable task card for Kanban
│   │   ├── KanbanColumn.jsx             # Column wrapper for Kanban board
│   │   └── ...
│   │
│   └── navigation/
│       ├── TopMenu.jsx                  # Main navigation menu (8 items)
│       ├── ViewsDropdown.jsx            # Kanban/List view selector
│       └── UserAvatars.jsx              # User avatar display component
│
├── types/
│   ├── project.types.js                 # Project TypeScript interfaces (JSDoc)
│   └── task.types.js                    # Task TypeScript interfaces (JSDoc)
│
└── ...
```

---

## 🎯 Flow Architecture

### Overall Flow
```
Login View → Dashboard (Projects List) → Individual Project Details
     ↓              ↓                            ↓
   Auth      Projects Grid             Project Tasks/Settings
            (Card View)                   (Kanban Board)
```

---

## 📦 Core Components

### 1. **ProjectCard Component**

Displays project information with visual elements.

**Location:** `src/components/dashboard/ProjectCard.jsx`

**Features:**
- Cover image display
- Tag badges (Service, Customer Care, etc.)
- Priority stars (★★)
- Project metrics (date, task count, range)
- Assignee avatar
- Progress indicator

**Props Interface:**
```javascript
{
  project: {
    id: string,
    name: string,                    // "RD Services"
    coverImage: string,              // Image URL
    tags: string[],                  // ["Service", "Customer Care"]
    priority: number,                // 1-5 stars
    deadline: string,                // "21/03/22"
    metrics: { range: string },      // "0-10"
    tasks: number,                   // 10
    progress: number,                // 0-100
    assignee: {
      avatar: string,                // "MR"
      name: string
    },
    color: string                    // "#9333ea"
  }
}
```

**Visual Layout:**
```
┌─────────────────────────────────────────┐
│  [Service] [Customer Care] badges       │ ← Tags
├─────────────────────────────────────────┤
│                                         │
│     [Cover Image - Purple Flowers]      │ ← Visual identifier
│                                         │
├─────────────────────────────────────────┤
│  [★ ★] Project Name                     │ ← Priority stars
│  RD Services                            │ ← Project title
│                                         │
│  📅 21/03/22                            │ ← Date
│  ❤ 0-10                                │ ← Metric range
│  📋 10 tasks                            │ ← Task count
│                                         │
│  [mr] User Avatar         65%          │ ← Assignee & Progress
└─────────────────────────────────────────┘
```

---

### 2. **TopMenu Component**

Main navigation menu with 8 items.

**Location:** `src/components/navigation/TopMenu.jsx`

**Menu Items:**
1. My Tasks → `/my-tasks`
2. All Tasks → `/tasks`
3. Sales Order → `/sales-orders`
4. Invoice → `/customer-invoices`
5. Purchase Order → `/purchase-orders`
6. Vendor Bills → `/vendor-bills`
7. Products → `/products`
8. Expenses → `/expenses`

**Features:**
- Active state highlighting
- Icon + label for each item
- Responsive horizontal scroll
- Router integration

---

### 3. **ViewsDropdown Component**

Dropdown for switching between Kanban and List views.

**Location:** `src/components/navigation/ViewsDropdown.jsx`

**Props:**
```javascript
{
  viewMode: 'kanban' | 'list',
  onChange: (mode) => void
}
```

**Features:**
- Dropdown UI with icon
- View mode selection (Kanban/List)
- localStorage persistence
- Click-outside-to-close

**View Modes:**
- **Kanban:** Board view with columns (New, In Progress, Done)
- **List:** Table view with rows

---

### 4. **UserAvatars Component**

Displays user avatars in a horizontal row.

**Location:** `src/components/navigation/UserAvatars.jsx`

**Props:**
```javascript
{
  users: Array<{
    id: string,
    name: string,
    initial: string,    // "A"
    color: string       // "#9333ea"
  }>,
  maxVisible: number    // Default: 7
}
```

**Visual:**
```
[A] [B] [A] [R] [M] [B] [S] [+9]
```

---

### 5. **TaskCard Component**

Draggable card for Kanban board.

**Location:** `src/components/tasks/TaskCard.jsx`

**Props Interface:**
```javascript
{
  task: {
    id: string,
    title: string,                   // "Celebrated Sandpiper"
    status: 'New' | 'InProgress' | 'Done',
    assignee: {
      name: string,                  // "Aditya"
      avatar: string
    },
    projectId: string,
    projectColor: string,            // For visual identification
    dueDate?: string,
    priority?: 'low' | 'medium' | 'high'
  },
  onDragStart: (e, task) => void,
  onClick: (task) => void
}
```

**Visual Layout:**
```
┌─────────────────────────────────────┐
│  Task Title                         │
│  "Celebrated Sandpiper"             │
│                                     │
│  ━━━━━━━━━━━━━━━━━━━━              │ ← Project color bar
│                                     │
│  [A] Aditya                         │ ← Assignee
│                                     │
│  📅 Due Date    ● Priority          │ ← Footer
│  [InProgress] badge                 │ ← Status
└─────────────────────────────────────┘
```

**Interaction:**
- Drag & drop between columns
- Click to open detail modal
- Visual priority indicator

---

### 6. **KanbanColumn Component**

Container for Kanban board columns.

**Location:** `src/components/tasks/KanbanColumn.jsx`

**Props:**
```javascript
{
  title: string,           // "New", "In Progress", "Done"
  count: number,           // Number of tasks
  status: string,          // Column status identifier
  color: string,           // Column color
  children: ReactNode,     // TaskCard components
  onDragOver: (e) => void,
  onDrop: (e) => void,
  onAddTask: () => void
}
```

**Features:**
- Drag & drop zone
- Task count badge
- Add task button
- Color-coded header

---

## 🎨 Dashboard View

### Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│  [TopMenu Navigation]              [User Avatars]            │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  [KPI Card] [KPI Card] [KPI Card] [KPI Card]                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  [Project Tab] [Tasks Tab] [Settings Tab]  [Views ▼] [New]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Project 1  │  │ Project 2  │  │ Project 3  │            │
│  │ Card       │  │ Card       │  │ Card       │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Project 4  │  │ Project 5  │  │ Project 6  │            │
│  │ Card       │  │ Card       │  │ Card       │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📋 Tasks View (Kanban Board)

### Layout Structure

```
┌──────────────────────────────────────────────────────────────┐
│  [Project Tab] [Tasks Tab] [Settings Tab]  [Views ▼] [New]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐                │
│  │  New    │    │In Progress│  │  Done   │                │
│  │   (5)   │    │    (3)    │  │   (2)   │                │
│  ├─────────┤    ├─────────┤    ├─────────┤                │
│  │ Task 1  │    │ Task 6  │    │ Task 9  │                │
│  ├─────────┤    ├─────────┤    ├─────────┤                │
│  │ Task 2  │    │ Task 7  │    │ Task 10 │                │
│  ├─────────┤    ├─────────┤    └─────────┘                │
│  │ Task 3  │    │ Task 8  │                                │
│  ├─────────┤    └─────────┘                                │
│  │ Task 4  │                                               │
│  ├─────────┤                                               │
│  │ Task 5  │                                               │
│  └─────────┘                                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Type Definitions

### Project Type
```javascript
// src/types/project.types.js

interface Project {
  id: string;
  name: string;                    // "RD Services"
  coverImage: string;              // Image URL
  tags: string[];                  // ["Service", "Customer Care"]
  priority: number;                // 1-5 stars
  date: string;                    // "21/03/22"
  metrics: {
    range: string;                 // "0-10"
    taskCount: number;
  };
  assignee: {
    id: string;
    name: string;
    avatar: string;
  };
  color: string;                   // "#9333ea"
  status: 'planned' | 'in_progress' | 'completed' | 'on_hold';
  progress: number;                // 0-100
  // ... additional fields
}
```

### Task Type
```javascript
// src/types/task.types.js

interface Task {
  id: string;
  title: string;                   // "Celebrated Sandpiper"
  status: 'New' | 'InProgress' | 'Done';
  assignee: {
    name: string;                  // "Aditya"
    avatar: string;
  };
  projectId: string;
  projectColor?: string;
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}
```

### ViewMode Type
```javascript
type ViewMode = 'kanban' | 'list';
```

---

## 🚀 Usage Examples

### Using ProjectCard
```jsx
import ProjectCard from '../components/dashboard/ProjectCard';

const project = {
  id: '1',
  name: 'RD Services',
  coverImage: 'https://example.com/image.jpg',
  tags: ['Service', 'Customer Care'],
  priority: 2,
  deadline: '21/03/22',
  tasks: 10,
  // ... other fields
};

<ProjectCard project={project} />
```

### Using ViewsDropdown
```jsx
import ViewsDropdown from '../components/navigation/ViewsDropdown';

const [viewMode, setViewMode] = useState('kanban');

<ViewsDropdown 
  viewMode={viewMode} 
  onChange={setViewMode}
/>
```

### Using TaskCard in Kanban
```jsx
import TaskCard from '../components/tasks/TaskCard';
import KanbanColumn from '../components/tasks/KanbanColumn';

const tasks = [/* task array */];

<KanbanColumn 
  title="New" 
  count={tasks.length}
  status="new"
  color="#3b82f6"
  onDragOver={handleDragOver}
  onDrop={handleDrop}
>
  {tasks.map(task => (
    <TaskCard 
      key={task.id}
      task={task}
      onDragStart={handleDragStart}
      onClick={handleTaskClick}
    />
  ))}
</KanbanColumn>
```

---

## 🎨 Styling & Theming

All components use CSS variables for theming:
- `--bg-primary`: Main background
- `--bg-secondary`: Card backgrounds
- `--bg-tertiary`: Nested elements
- `--text-primary`: Main text color
- `--text-secondary`: Secondary text
- `--primary`: Primary brand color
- `--border-color`: Border colors

---

## 📝 Notes

- All components are responsive and mobile-friendly
- Drag & drop functionality uses native HTML5 API
- ViewMode preference persists in localStorage
- Project cards show cover images from Unsplash
- Priority is indicated by star count (1-5)
- Task cards are color-coded by project

---

## 🔗 Related Pages

- **Login:** `/login` - Authentication page
- **Dashboard:** `/dashboard` - Main view with projects
- **Tasks:** `/tasks` - Kanban board
- **Task Create:** `/tasks/create` - Task creation form
- **Projects:** `/projects` - Project list

---

**Last Updated:** November 8, 2025
