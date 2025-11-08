/**
 * @typedef {'New' | 'InProgress' | 'Done'} TaskStatus
 * Task status types for Kanban board columns
 */

/**
 * @typedef {'low' | 'medium' | 'high'} TaskPriority
 * Task priority levels
 */

/**
 * @typedef {'kanban' | 'list'} ViewMode
 * View mode for tasks display
 */

/**
 * @typedef {Object} TaskAssignee
 * @property {string} id - Assignee ID
 * @property {string} name - Assignee name (e.g., "Aditya")
 * @property {string} avatar - Avatar initials or URL
 */

/**
 * @typedef {Object} Task
 * @property {string} id - Unique task identifier
 * @property {string} title - Task title (e.g., "Celebrated Sandpiper")
 * @property {TaskStatus} status - Current status (New, InProgress, Done)
 * @property {TaskAssignee} assignee - Assigned user
 * @property {string} projectId - Associated project ID
 * @property {string} [projectColor] - Project color for visual identification
 * @property {string} [dueDate] - Due date string
 * @property {TaskPriority} [priority] - Task priority level
 * @property {string} [description] - Task description
 */

/**
 * @typedef {Object} TaskCardProps
 * @property {Task} task - Task data
 * @property {function(Event, Task): void} [onDragStart] - Drag start handler
 * @property {function(Task): void} [onClick] - Click handler
 */

/**
 * @typedef {Object} KanbanColumnProps
 * @property {string} title - Column title
 * @property {number} count - Number of tasks in column
 * @property {string} status - Column status identifier
 * @property {string} [color] - Column color
 * @property {React.ReactNode} children - Child components (TaskCards)
 * @property {function(Event): void} onDragOver - Drag over handler
 * @property {function(Event): void} onDrop - Drop handler
 * @property {function(): void} [onAddTask] - Add task handler
 */

export const TaskTypes = {};
