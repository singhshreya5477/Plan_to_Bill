import { Link } from 'react-router-dom';
import { FiCalendar, FiCheckSquare, FiHeart, FiStar } from 'react-icons/fi';

const ProjectCard = ({ project }) => {
  // Render priority stars
  const renderStars = (priority) => {
    return [...Array(priority)].map((_, i) => (
      <FiStar key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
    ));
  };

  return (
    <Link 
      to={`/projects/${project.id}`} 
      className="block rounded-xl overflow-hidden transition-all hover:shadow-2xl hover-lift group animate-fade-in relative border-2"
      style={{ 
        backgroundColor: 'rgb(var(--bg-secondary))',
        borderColor: 'rgb(var(--border-color))'
      }}
    >
      {/* Animated gradient border on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10"
        style={{ 
          background: `linear-gradient(135deg, ${project.color}40, transparent, ${project.color}40)`,
          filter: 'blur(10px)'
        }}
      />
      
      {/* Holographic shimmer effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      </div>
      
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${project.color} 0%, transparent 100%)` }}
      />
      
      {/* Floating particles */}
      <div className="absolute top-4 right-4 w-2 h-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ backgroundColor: project.color, boxShadow: `0 0 20px ${project.color}` }}>
        <div className="absolute inset-0 rounded-full animate-ping" style={{ backgroundColor: project.color }}></div>
      </div>
      
      {/* Tags */}
      <div className="p-3 flex flex-wrap gap-2 relative z-10">
        {project.tags && project.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full text-xs font-bold transition-all hover-scale cursor-pointer shadow-md group-hover:shadow-lg backdrop-blur-sm relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${project.color}50, ${project.color}70)`,
              color: project.color,
              border: `1px solid ${project.color}30`
            }}
          >
            {/* Tag shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700"></div>
            <span className="relative z-10">{tag}</span>
          </span>
        ))}
      </div>

      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden group/image">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.name}
            className="w-full h-full object-cover transition-all duration-700 group-hover:scale-125 group-hover:brightness-110 group-hover:saturate-150"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center transition-all duration-700 group-hover:scale-110 relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${project.color}15, ${project.color}35)`,
            }}
          >
            {/* Cyber grid background */}
            <div className="absolute inset-0 cyber-grid opacity-20"></div>
            
            {/* Animated gradient blob */}
            <div className="absolute inset-0 opacity-30">
              <div 
                className="w-32 h-32 rounded-full blur-2xl blob-animate"
                style={{ background: `radial-gradient(circle, ${project.color}80, transparent)` }}
              ></div>
            </div>
            
            <span className="text-5xl font-black opacity-20 relative z-10 group-hover:scale-110 transition-transform" 
              style={{ color: project.color }}>
              {project.name?.charAt(0) || 'P'}
            </span>
          </div>
        )}
        
        {/* Layered gradients */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-70 group-hover:opacity-50 transition-opacity"></div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-all duration-500"
          style={{ background: `linear-gradient(135deg, ${project.color}, transparent)` }}
        ></div>
        
        {/* Glowing border at bottom of image */}
        <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ 
            background: `linear-gradient(90deg, transparent, ${project.color}, transparent)`,
            boxShadow: `0 0 20px ${project.color}`
          }}
        ></div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Priority Stars & Title */}
        <div>
          <div className="flex items-center gap-1 mb-2 transition-all group-hover:scale-105 group-hover:gap-2">
            {renderStars(project.priority || 0).map((star, idx) => (
              <div key={idx} className="transform transition-all hover:scale-125 hover:rotate-12" style={{ transitionDelay: `${idx * 50}ms` }}>
                {star}
              </div>
            ))}
          </div>
          <h3 
            className="text-lg font-bold line-clamp-1 transition-all group-hover:translate-x-1 relative inline-block"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            {project.name}
            {/* Animated underline */}
            <div className="absolute bottom-0 left-0 h-0.5 w-0 group-hover:w-full transition-all duration-500"
              style={{ backgroundColor: project.color }}
            ></div>
          </h3>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 text-sm transition-all group-hover:translate-x-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          <div className="flex items-center gap-1 hover-scale cursor-pointer group/metric transition-all hover:gap-2">
            <FiCalendar className="w-4 h-4 group-hover/metric:text-blue-500 transition-colors" />
            <span className="group-hover/metric:font-semibold transition-all">{project.deadline}</span>
          </div>
          
          <div className="flex items-center gap-1 hover-scale cursor-pointer group/metric transition-all hover:gap-2">
            <FiHeart className="w-4 h-4 text-red-500 group-hover/metric:animate-ping" />
            <span className="group-hover/metric:font-semibold transition-all">{project.metrics?.range || '0-10'}</span>
          </div>
          
          <div className="flex items-center gap-1 hover-scale cursor-pointer group/metric transition-all hover:gap-2">
            <FiCheckSquare className="w-4 h-4 group-hover/metric:text-green-500 transition-colors" />
            <span className="group-hover/metric:font-semibold transition-all">{project.tasks} tasks</span>
          </div>
        </div>

        {/* Assignee Avatar */}
        <div className="pt-3 border-t transition-all" style={{ borderColor: 'rgb(var(--border-color))' }}>
          <div className="flex items-center justify-between">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white transition-all group-hover:scale-125 group-hover:rotate-12 cursor-pointer shadow-lg relative overflow-hidden"
              style={{ 
                background: `linear-gradient(135deg, ${project.color}, ${project.color}cc)`,
                boxShadow: `0 4px 15px ${project.color}50`
              }}
            >
              {/* Rotating ring */}
              <div className="absolute inset-0 rounded-full border-2 border-white/30 opacity-0 group-hover:opacity-100 animate-spin" style={{ animationDuration: '3s' }}></div>
              
              {/* Avatar text */}
              <span className="relative z-10">{project.assignee?.avatar || 'AA'}</span>
              
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-50 transition-opacity"
                style={{ background: `radial-gradient(circle, ${project.color}, transparent)`, filter: 'blur(8px)' }}
              ></div>
            </div>
            
            {/* Progress indicator with glow */}
            <div className="text-base font-black transition-all group-hover:scale-125 relative" 
              style={{ 
                color: project.color,
                textShadow: `0 0 20px ${project.color}60, 0 0 40px ${project.color}40`
              }}>
              <span className="relative z-10">{project.progress}%</span>
              
              {/* Pulsing glow */}
              <div className="absolute inset-0 opacity-50 group-hover:animate-ping"
                style={{ color: project.color }}
              >
                {project.progress}%
              </div>
            </div>
          </div>
          
          {/* Progress bar with multiple layers */}
          <div className="mt-3 h-2.5 rounded-full overflow-hidden shadow-inner relative" 
            style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
            
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            </div>
            
            {/* Main progress bar */}
            <div 
              className="h-full transition-all duration-1000 relative overflow-hidden rounded-full shadow-lg group-hover:shadow-2xl"
              style={{ 
                width: `${project.progress}%`,
                background: `linear-gradient(90deg, ${project.color}dd, ${project.color}, ${project.color}dd)`,
                boxShadow: `0 0 15px ${project.color}80, inset 0 1px 0 rgba(255,255,255,0.3)`
              }}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              {/* Top highlight */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-b from-white/50 to-transparent"></div>
              
              {/* Pulse effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"
                style={{ backgroundColor: `${project.color}30` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
