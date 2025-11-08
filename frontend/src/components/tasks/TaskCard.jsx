import { FiUser, FiCalendar, FiCircle } from 'react-icons/fi';

/**
 * TaskCard Component
 * Draggable task card for Kanban board
 * 
 * Props Interface:
 * - task: {
 *     id: string,
 *     title: string,
 *     status: 'New' | 'InProgress' | 'Done',
 *     assignee: { name: string, avatar: string },
 *     projectId: string,
 *     projectColor: string,
 *     dueDate?: string,
 *     priority?: 'low' | 'medium' | 'high'
 *   }
 * - onDragStart: (e, task) => void
 * - onClick: (task) => void
 */
const TaskCard = ({ task, onDragStart, onClick }) => {
  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  };

  const priorityColor = task.priority ? priorityColors[task.priority] : '#6b7280';

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart && onDragStart(e, task)}
      onClick={() => onClick && onClick(task)}
      className="p-4 rounded-lg cursor-pointer transition-all hover:shadow-md"
      style={{
        backgroundColor: 'rgb(var(--bg-secondary))',
        border: '1px solid rgb(var(--border-color))'
      }}
    >
      {/* Task Title */}
      <h4 
        className="text-sm font-semibold mb-3 line-clamp-2"
        style={{ color: 'rgb(var(--text-primary))' }}
      >
        {task.title}
      </h4>

      {/* Project Color Bar */}
      {task.projectColor && (
        <div 
          className="h-1 rounded-full mb-3"
          style={{ backgroundColor: task.projectColor }}
        />
      )}

      {/* Assignee */}
      <div className="flex items-center space-x-2 mb-2">
        <div 
          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
          style={{ backgroundColor: task.projectColor || '#6b7280' }}
        >
          {task.assignee?.avatar || task.assignee?.name?.charAt(0).toUpperCase() || '?'}
        </div>
        <span 
          className="text-xs"
          style={{ color: 'rgb(var(--text-secondary))' }}
        >
          {task.assignee?.name || 'Unassigned'}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t" 
        style={{ borderColor: 'rgb(var(--border-color))' }}>
        
        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center space-x-1 text-xs" 
            style={{ color: 'rgb(var(--text-secondary))' }}>
            <FiCalendar className="w-3 h-3" />
            <span>{task.dueDate}</span>
          </div>
        )}

        {/* Priority Indicator */}
        {task.priority && (
          <div className="flex items-center space-x-1">
            <FiCircle 
              className="w-3 h-3" 
              style={{ color: priorityColor, fill: priorityColor }}
            />
          </div>
        )}
      </div>

      {/* Status Badge (optional, for reference) */}
      <div className="mt-2">
        <span 
          className="text-xs px-2 py-1 rounded"
          style={{
            backgroundColor: `${task.projectColor || '#6b7280'}20`,
            color: task.projectColor || '#6b7280'
          }}
        >
          {task.status}
        </span>
      </div>
    </div>
  );
};

export default TaskCard;
