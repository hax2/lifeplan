'use client';
import { type FC } from 'react';
import { motion } from 'framer-motion';

export const ProgressBar: FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
      <motion.div
        className="bg-sky-500 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  );
};
