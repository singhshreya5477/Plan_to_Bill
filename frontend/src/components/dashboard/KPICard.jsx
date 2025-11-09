import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const KPICard = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: {
      gradient: 'from-cyan-500 via-blue-500 to-blue-600',
      glow: 'shadow-blue-500/50',
      particle: 'bg-blue-400'
    },
    red: {
      gradient: 'from-red-500 via-pink-500 to-pink-600',
      glow: 'shadow-red-500/50',
      particle: 'bg-red-400'
    },
    green: {
      gradient: 'from-emerald-500 via-teal-500 to-teal-600',
      glow: 'shadow-emerald-500/50',
      particle: 'bg-emerald-400'
    },
    purple: {
      gradient: 'from-purple-500 via-violet-500 to-indigo-600',
      glow: 'shadow-purple-500/50',
      particle: 'bg-purple-400'
    },
    yellow: {
      gradient: 'from-amber-500 via-yellow-500 to-orange-600',
      glow: 'shadow-amber-500/50',
      particle: 'bg-amber-400'
    }
  };

  const currentColor = colorClasses[color];
  const isPositiveTrend = trend && trend.startsWith('+');

  return (
    <div className="card hover-lift cursor-pointer group relative overflow-hidden border-2 border-transparent hover:border-opacity-30 transition-all duration-500"
      style={{ 
        borderColor: `rgb(var(--${color === 'blue' ? 'accent' : color === 'red' ? 'error' : color === 'green' ? 'success' : 'primary'}))` 
      }}>
      
      {/* Animated gradient background on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${currentColor.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
      
      {/* Rotating border effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className={`absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r ${currentColor.gradient} animate-pulse`}></div>
        <div className={`absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-l ${currentColor.gradient} animate-pulse`} style={{ animationDelay: '0.5s' }}></div>
      </div>
      
      {/* Particle effect */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className={`w-1 h-1 ${currentColor.particle} rounded-full animate-ping`}></div>
      </div>
      <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ transitionDelay: '0.1s' }}>
        <div className={`w-1 h-1 ${currentColor.particle} rounded-full animate-ping`}></div>
      </div>
      
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
        <div className="animate-shimmer absolute inset-0"></div>
      </div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium mb-2 transition-all group-hover:translate-x-1 duration-300" 
            style={{ color: 'rgb(var(--text-secondary))' }}>
            {title}
          </p>
          <p className="text-4xl font-bold transition-all group-hover:scale-110 inline-block origin-left duration-500 bg-gradient-to-r from-current to-current bg-clip-text" 
            style={{ color: 'rgb(var(--text-primary))' }}>
            {value}
          </p>
          {trend && (
            <div className={`flex items-center mt-3 text-sm transition-all group-hover:translate-x-1 duration-300`} 
              style={{ color: 'rgb(var(--text-secondary))' }}>
              {isPositiveTrend ? (
                <div className="flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30">
                  <FiTrendingUp className="mr-1 h-4 w-4 animate-bounce-subtle" style={{ color: 'rgb(var(--success))' }} />
                  <span className="font-semibold text-xs" style={{ color: 'rgb(var(--success))' }}>{trend}</span>
                </div>
              ) : (
                <div className="flex items-center px-2 py-1 rounded-full bg-red-100 dark:bg-red-900/30">
                  <FiTrendingDown className="mr-1 h-4 w-4" style={{ color: 'rgb(var(--error))' }} />
                  <span className="font-semibold text-xs" style={{ color: 'rgb(var(--error))' }}>{trend}</span>
                </div>
              )}
              <span className="ml-2 text-xs" style={{ color: 'rgb(var(--text-tertiary))' }}>vs last month</span>
            </div>
          )}
        </div>
        
        {/* Glowing icon with 3D effect */}
        <div className={`relative p-5 rounded-2xl bg-gradient-to-br ${currentColor.gradient} text-white shadow-2xl ${currentColor.glow} transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 tilt-3d`}>
          {/* Glow effect behind icon */}
          <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${currentColor.gradient} blur-xl opacity-50 group-hover:opacity-75 transition-opacity`}></div>
          
          {/* Icon */}
          <Icon className="h-8 w-8 drop-shadow-2xl relative z-10 group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all" />
          
          {/* Rotating ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-white/30 opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-opacity" style={{ animationDuration: '3s' }}></div>
        </div>
      </div>
      
      {/* Bottom gradient accent */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${currentColor.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
    </div>
  );
};

export default KPICard;
