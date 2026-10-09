const Skeleton = ({ className = '', variant = 'default' }) => {
  const variants = {
    default: 'h-4 w-full',
    title: 'h-6 w-3/4',
    text: 'h-4 w-full',
    circle: 'h-9 w-9 rounded-full',
    card: 'h-36 w-full'
  };

  return (
    <div 
      className={`bg-raised animate-pulse rounded-md ${variants[variant] || variants.default} ${className}`}
    />
  );
};

export const SkeletonCard = () => (
  <div className="bg-surface rounded-lg p-6 border border-line">
    <Skeleton variant="title" className="mb-4" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" className="mb-2" />
    <Skeleton variant="text" className="w-2/3" />
  </div>
);

export const SkeletonTranscript = () => (
  <div className="space-y-3">
    {[...Array(6)].map((_, i) => (
      <Skeleton key={i} variant="text" className={i % 3 === 0 ? 'w-5/6' : 'w-full'} />
    ))}
  </div>
);

export default Skeleton;
