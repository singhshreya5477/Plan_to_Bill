import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const KPICard = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-blue-500/50',
    red: 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-lg shadow-red-500/50',
    green: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/50',
    purple: 'bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/50',
    yellow: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/50'
  };

  const isPositiveTrend = trend && trend.startsWith('+');

  return (
    <div className="card hover-lift cursor-pointer group relative overflow-hidden">
      {/* Shimmer effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        <div className="animate-shimmer absolute inset-0"></div>
      </div>
      
      <div className="flex items-center justify-between relative z-10">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1 transition-all group-hover:translate-x-1" style={{ color: 'rgb(var(--text-secondary))' }}>{title}</p>
          <p className="text-4xl font-bold transition-all group-hover:scale-105 inline-block" style={{ color: 'rgb(var(--text-primary))' }}>{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm transition-all group-hover:translate-x-1`} style={{ color: 'rgb(var(--text-secondary))' }}>
              {isPositiveTrend ? (
                <FiTrendingUp className="mr-1 h-4 w-4 animate-bounce-subtle" style={{ color: 'rgb(var(--success))' }} />
              ) : (
                <FiTrendingDown className="mr-1 h-4 w-4" style={{ color: 'rgb(var(--error))' }} />
              )}
              <span className="font-semibold" style={{ color: isPositiveTrend ? 'rgb(var(--success))' : 'rgb(var(--error))' }}>{trend}</span>
              <span className="ml-1" style={{ color: 'rgb(var(--text-tertiary))' }}>vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${colorClasses[color]} transition-all group-hover:scale-110 group-hover:rotate-6`}>
          <Icon className="h-8 w-8 drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
