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
      className="block rounded-xl overflow-hidden transition-all hover:shadow-2xl hover-lift group animate-fade-in relative"
      style={{ 
        backgroundColor: 'rgb(var(--bg-secondary))',
        border: '1px solid rgb(var(--border-color))'
      }}
    >
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{ background: `linear-gradient(135deg, ${project.color} 0%, transparent 100%)` }}
      />
      
      {/* Tags */}
      <div className="p-3 flex flex-wrap gap-2 relative z-10">
        {project.tags && project.tags.map((tag, idx) => (
          <span
            key={idx}
            className="px-3 py-1 rounded-full text-xs font-bold transition-all hover-scale cursor-pointer shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${project.color}40, ${project.color}60)`,
              color: project.color,
              backdropFilter: 'blur(10px)'
            }}
          >
            {tag}
          </span>
        ))}
      </div>

      {/* Cover Image */}
      <div className="relative h-32 overflow-hidden">
        {project.coverImage ? (
          <img
            src={project.coverImage}
            alt={project.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-110"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-110"
            style={{ 
              background: `linear-gradient(135deg, ${project.color}20, ${project.color}40)`,
            }}
          >
            <span className="text-2xl font-bold opacity-30" style={{ color: project.color }}>
              {project.name?.charAt(0) || 'P'}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity"></div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
          style={{ background: `linear-gradient(135deg, ${project.color}, transparent)` }}
        ></div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Priority Stars & Title */}
        <div>
          <div className="flex items-center gap-1 mb-2 transition-all group-hover:scale-110">
            {renderStars(project.priority || 0)}
          </div>
          <h3 
            className="text-lg font-bold line-clamp-1 transition-colors group-hover:text-opacity-80"
            style={{ color: 'rgb(var(--text-primary))' }}
          >
            {project.name}
          </h3>
        </div>

        {/* Metrics */}
        <div className="flex items-center gap-4 text-sm transition-all group-hover:translate-x-1" style={{ color: 'rgb(var(--text-secondary))' }}>
          <div className="flex items-center gap-1 hover-scale">
            <FiCalendar className="w-4 h-4" />
            <span>{project.deadline}</span>
          </div>
          
          <div className="flex items-center gap-1 hover-scale">
            <FiHeart className="w-4 h-4 text-red-500 animate-pulse" />
            <span>{project.metrics?.range || '0-10'}</span>
          </div>
          
          <div className="flex items-center gap-1 hover-scale">
            <FiCheckSquare className="w-4 h-4" />
            <span>{project.tasks} tasks</span>
          </div>
        </div>

        {/* Assignee Avatar */}
        <div className="pt-3 border-t transition-all" style={{ borderColor: 'rgb(var(--border-color))' }}>
          <div className="flex items-center justify-between">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white transition-all group-hover:scale-110 group-hover:rotate-12 cursor-pointer shadow-md"
              style={{ background: `linear-gradient(135deg, ${project.color}, ${project.color}dd)` }}
            >
              {project.assignee?.avatar || 'AA'}
            </div>
            
            {/* Progress indicator */}
            <div className="text-sm font-bold transition-all group-hover:scale-110" 
              style={{ 
                color: project.color,
                textShadow: `0 0 10px ${project.color}40`
              }}>
              {project.progress}%
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="mt-3 h-2 rounded-full overflow-hidden shadow-inner" style={{ backgroundColor: 'rgb(var(--bg-tertiary))' }}>
            <div 
              className="h-full transition-all duration-1000 group-hover:animate-shimmer rounded-full shadow-lg"
              style={{ 
                width: `${project.progress}%`,
                background: `linear-gradient(90deg, ${project.color}, ${project.color}cc, ${project.color})`
              }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProjectCard;
