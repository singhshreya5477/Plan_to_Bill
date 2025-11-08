import { FiBell, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b px-6 py-4 transition-all" style={{ 
      backgroundColor: 'rgb(var(--bg-secondary))', 
      borderColor: 'rgb(var(--border-color))' 
    }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--text-primary))' }}>
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--text-secondary))' }}>
            Here's what's happening with your projects today.
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <button className="relative p-2 rounded-lg transition-all hover:bg-opacity-10 hover:bg-gray-500">
            <FiBell className="h-6 w-6" style={{ color: 'rgb(var(--text-secondary))' }} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-900/20"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            <FiLogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
