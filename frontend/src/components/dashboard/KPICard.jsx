import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const KPICard = ({ title, value, icon: Icon, color = 'blue', trend }) => {
  const colorClasses = {
    blue: 'gradient-bg-blue text-white shadow-lg',
    red: 'gradient-bg-fire text-white shadow-lg',
    green: 'gradient-bg-ocean text-white shadow-lg',
    purple: 'gradient-bg-purple text-white shadow-lg',
    yellow: 'gradient-bg-sunset text-white shadow-lg'
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
          <p className="text-sm font-medium text-white/80 mb-1 transition-all group-hover:translate-x-1">{title}</p>
          <p className="text-3xl font-bold text-white transition-all group-hover:scale-110 inline-block drop-shadow-lg">{value}</p>
          {trend && (
            <div className={`flex items-center mt-2 text-sm transition-all group-hover:translate-x-1 text-white/90`}>
              {isPositiveTrend ? (
                <FiTrendingUp className="mr-1 h-4 w-4 animate-bounce-subtle" />
              ) : (
                <FiTrendingDown className="mr-1 h-4 w-4" />
              )}
              <span className="font-medium">{trend}</span>
              <span className="ml-1 text-white/70">vs last month</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full ${colorClasses[color]} transition-all group-hover:scale-110 group-hover:rotate-6 backdrop-blur-sm bg-white/20`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );
};

export default KPICard;
