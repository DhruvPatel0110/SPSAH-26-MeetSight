const Card = ({
  children,
  className = '',
  padding = 'default',
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-6'
  };

  return (
    <div
      className={`bg-surface border border-line rounded-lg shadow-sm dark:shadow-none ${paddingStyles[padding] || 'p-6'} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
