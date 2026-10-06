const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 w-full',
    title: 'h-8 w-3/4',
    text: 'h-4 w-full',
    circle: 'h-12 w-12 rounded-full',
    card: 'h-48 w-full'
  };

  return (
    <div 
      className={`bg-primary-hover animate-shimmer ${variants[variant]} ${className}`}
      style={{
        backgroundImage: 'linear-gradient(90deg, transparent, rgba(0, 212, 255, 0.1), transparent)',
        backgroundSize: '200% 100%'
      }}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-primary-surface rounded-xl p-6 border border-accent-cyan/20">
    <Skeleton variant="title" className="mb-4" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" className="w-2/3" />
  </div>
);

export const SkeletonTranscript = () => (
  <div className="space-y-3">
    {[...Array(8)].map((_, i) => (
      <Skeleton key={i} variant="text" className={i % 3 === 0 ? 'w-5/6' : 'w-full'} />
    ))}
  </div>
);

export default Skeleton;
