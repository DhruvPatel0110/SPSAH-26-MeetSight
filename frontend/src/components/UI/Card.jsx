import { motion } from 'framer-motion';

const Card = ({
  children,
  className = '',
  gradient = false,
  hover = true,
  padding = 'default'
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    default: 'p-6',
    lg: 'p-8'
  };

  const baseStyles = `bg-primary-surface rounded-xl ${paddingStyles[padding]} ${className}`;
  const gradientStyles = gradient ? 'border border-white/10' : 'border border-white/10';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, boxShadow: '0 4px 20px rgba(96, 165, 250, 0.15)' } : {}}
      className={`${baseStyles} ${gradientStyles}`}
    >
      {children}
    </motion.div>
  );
};

export default Card;
