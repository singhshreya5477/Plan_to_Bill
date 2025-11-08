/**
 * UserAvatars Component
 * Displays user avatars in a horizontal row with overflow indicator
 * Shows first N users and +X more indicator
 * 
 * Props:
 * - users: Array of { id, name, initial, color }
 * - maxVisible: Number of avatars to show before +N indicator (default: 7)
 */
const UserAvatars = ({ users = [], maxVisible = 7 }) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = users.length - maxVisible;

  return (
    <div className="flex items-center space-x-2">
      {visibleUsers.map((user, index) => (
        <div
          key={user.id}
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:scale-125 hover:-translate-y-1 transition-all shadow-lg hover:shadow-xl animate-fade-in hover-glow"
          style={{ 
            background: user.color,
            animationDelay: `${index * 0.1}s`
          }}
          title={user.name}
        >
          {user.initial}
        </div>
      ))}
      
      {remainingCount > 0 && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold cursor-pointer hover:scale-125 hover:-translate-y-1 transition-all shadow-lg hover:shadow-xl animate-bounce-subtle gradient-bg-vibrant text-white"
          title={`${remainingCount} more users`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default UserAvatars;
