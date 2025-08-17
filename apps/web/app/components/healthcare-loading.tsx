'use client';

import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export const HealthcareLoadingSpinner = ({
  size = 'default',
}: {
  size?: 'sm' | 'default' | 'lg';
}) => {
  const sizes = {
    sm: 'h-4 w-4',
    default: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: 'linear',
      }}
      className="flex items-center justify-center"
    >
      <Heart className={`${sizes[size]} text-emerald-400 fill-current`} />
    </motion.div>
  );
};

export const HealthcareLoadingPulse = () => {
  return (
    <div className="flex items-center space-x-2">
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
        }}
        className="h-3 w-3 rounded-full bg-emerald-400"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          delay: 0.2,
        }}
        className="h-3 w-3 rounded-full bg-emerald-400"
      />
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: 'easeInOut',
          delay: 0.4,
        }}
        className="h-3 w-3 rounded-full bg-emerald-400"
      />
    </div>
  );
};
