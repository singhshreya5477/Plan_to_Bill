/**
 * PageTransition Component
 * Wrapper component that adds smooth page transitions
 */
const PageTransition = ({ children, className = '' }) => {
  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
};

export default PageTransition;
