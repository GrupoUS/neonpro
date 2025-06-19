"use client";

import React from 'react';
import { motion } from 'framer-motion';
import MetricCard, { MetricCardProps } from './MetricCard';
import { cn } from '@/lib/utils';

interface MetricCardGroupProps {
  cards: MetricCardProps[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
  staggerDelay?: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function MetricCardGroup({
  cards,
  columns = 4,
  className,
  staggerDelay = 0.1
}: MetricCardGroupProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn(
        'grid gap-6',
        gridCols[columns],
        className
      )}
    >
      {cards.map((card, index) => (
        <motion.div
          key={`metric-${index}`}
          variants={item}
          transition={{ delay: index * staggerDelay }}
        >
          <MetricCard {...card} />
        </motion.div>
      ))}
    </motion.div>
  );
}