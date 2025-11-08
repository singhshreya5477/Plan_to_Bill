import { FiPlus } from 'react-icons/fi';

/**
 * KanbanColumn Component
 * Container for a single column in the Kanban board
 * 
 * Props:
 * - title: string (column name)
 * - count: number (number of tasks)
 * - status: string (column status identifier)
 * - color: string (column color for visual distinction)
 * - children: React nodes (TaskCard components)
 * - onDragOver: (e) => void
 * - onDrop: (e) => void
 * - onAddTask: () => void
 */
const KanbanColumn = ({ 
  title, 
  count, 
  status, 
  color = '#6b7280',
  children, 
  onDragOver, 
  onDrop,
  onAddTask 
}) => {
  return (
    <div 
      className="flex-1 min-w-[300px] rounded-lg p-4"
      style={{ 
        backgroundColor: 'rgb(var(--bg-tertiary))',
        border: '1px solid rgb(var(--border-color))'
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: color }}
          />
          <h3 
            className="font-semibold"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            {title}
          </h3>
          <span 
            className="text-xs px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: 'rgb(var(--bg-secondary))',
              color: 'rgb(var(--text-secondary))'
            }}
          >
            {count}
          </span>
        </div>
        
        {onAddTask && (
          <button
            onClick={onAddTask}
            className="p-1 rounded hover:opacity-70 transition-opacity"
            style={{ color: 'rgb(var(--text-secondary))' }}
            title="Add task"
          >
            <FiPlus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={onDragOver}
        onDrop={onDrop}
        className="space-y-3 min-h-[400px]"
        data-status={status}
      >
        {children}
      </div>
    </div>
  );
};

export default KanbanColumn;
