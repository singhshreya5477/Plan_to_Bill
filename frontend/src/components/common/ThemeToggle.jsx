import { FiSun, FiMoon } from 'react-icons/fi';
import { useThemeStore } from '../../store/themeStore';

const ThemeToggle = () => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-lg hover:bg-opacity-10 hover:bg-gray-500 transition-all"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-6 h-6">
        {/* Sun Icon */}
        <FiSun
          className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
            theme === 'light'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 rotate-90 scale-0'
          }`}
          style={{ color: 'rgb(var(--text-secondary))' }}
        />
        
        {/* Moon Icon */}
        <FiMoon
          className={`absolute inset-0 h-6 w-6 transition-all duration-300 ${
            theme === 'dark'
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0'
          }`}
          style={{ color: 'rgb(var(--text-secondary))' }}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
