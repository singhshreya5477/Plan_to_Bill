import { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiGrid, FiList } from 'react-icons/fi';

/**
 * ViewsDropdown Component
 * Dropdown selector for switching between Kanban and List views
 * Stores preference in localStorage
 * 
 * Props:
 * - viewMode: 'kanban' | 'list'
 * - onChange: (mode) => void
 */
const ViewsDropdown = ({ viewMode = 'kanban', onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const views = [
    { id: 'kanban', label: 'Kanban', icon: FiGrid },
    { id: 'list', label: 'List', icon: FiList }
  ];

  const currentView = views.find(v => v.id === viewMode) || views[0];
  const CurrentIcon = currentView.icon;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectView = (viewId) => {
    onChange(viewId);
    setIsOpen(false);
    // Store preference in localStorage
    localStorage.setItem('preferredViewMode', viewId);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
        style={{ 
          backgroundColor: 'rgb(var(--bg-secondary))',
          color: 'rgb(var(--text-primary))',
          border: '1px solid rgb(var(--border-color))'
        }}
      >
        <CurrentIcon className="w-4 h-4" />
        <span>Views</span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-50"
          style={{ 
            backgroundColor: 'rgb(var(--bg-secondary))',
            border: '1px solid rgb(var(--border-color))'
          }}
        >
          {views.map((view) => {
            const Icon = view.icon;
            const isSelected = view.id === viewMode;
            
            return (
              <button
                key={view.id}
                onClick={() => handleSelectView(view.id)}
                className="w-full flex items-center space-x-3 px-4 py-3 text-sm transition-all hover:opacity-80"
                style={{
                  backgroundColor: isSelected ? 'rgb(var(--primary) / 0.1)' : 'transparent',
                  color: isSelected ? 'rgb(var(--primary))' : 'rgb(var(--text-primary))'
                }}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{view.label}</span>
                {isSelected && (
                  <span className="ml-auto text-xs">✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewsDropdown;
