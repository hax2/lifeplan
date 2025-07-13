'use client';
import { type FC } from 'react';
import { motion } from 'framer-motion';

export const ProgressBar: FC<{ value: number; max: number }> = ({ value, max }) => {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden dark:bg-zinc-700">
      <motion.div
        className="bg-sky-500 h-2 rounded-full dark:bg-sky-400"
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: 'easeInOut' }}
      />
    </div>
  );
};
