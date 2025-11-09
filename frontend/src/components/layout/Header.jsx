import { FiBell, FiLogOut } from 'react-icons/fi';
import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../common/ThemeToggle';
import { useState, useEffect } from 'react';

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [greeting, setGreeting] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update greeting based on time of day
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Good morning');
      } else if (hour < 17) {
        setGreeting('Good afternoon');
      } else {
        setGreeting('Good evening');
      }
    };
    
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getEmoji = () => {
    const hour = new Date().getHours();
    if (hour < 12) return '☀️';
    if (hour < 17) return '🌤️';
    return '🌙';
  };

  return (
    <header className="border-b px-6 py-4 transition-all" style={{ 
      backgroundColor: 'rgb(var(--bg-secondary))', 
      borderColor: 'rgb(var(--border-color))' 
    }}>
      <div className="flex items-center justify-between">
        <div className="group cursor-default">
          <h2 className="text-2xl font-semibold transition-all duration-300 group-hover:scale-105" 
              style={{ color: 'rgb(var(--text-primary))' }}>
            {greeting}, <span className="inline-block transition-all duration-300 group-hover:rotate-12">{getEmoji()}</span>{' '}
            <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
              {user?.name || user?.firstName || 'User'}
            </span>!
          </h2>
          <div className="flex items-center gap-4 mt-1">
            <p className="text-sm transition-all duration-300 group-hover:translate-x-1" 
               style={{ color: 'rgb(var(--text-secondary))' }}>
              Here's what's happening with your projects today
            </p>
            <span className="text-xs px-2 py-1 rounded-full transition-all duration-300 group-hover:scale-110"
                  style={{ 
                    backgroundColor: 'rgb(var(--primary) / 0.1)', 
                    color: 'rgb(var(--primary))' 
                  }}>
              {currentTime.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true 
              })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <button className="relative p-2 rounded-lg transition-all hover:bg-opacity-10 hover:bg-gray-500 hover:scale-110 active:scale-95 group">
            <FiBell className="h-6 w-6 transition-all group-hover:rotate-12 group-hover:text-blue-500" 
                   style={{ color: 'rgb(var(--text-secondary))' }} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full opacity-0 group-hover:opacity-20 group-hover:scale-150 transition-all duration-300"></span>
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all hover:bg-red-50 dark:hover:bg-red-900/20 hover:scale-105 active:scale-95 group"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            <FiLogOut className="h-5 w-5 transition-all group-hover:translate-x-1 group-hover:text-red-500" />
            <span className="font-medium group-hover:text-red-500">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
