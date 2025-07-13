import { useEffect, useState } from 'react';
export const useReducedMotion = () => {
  const [pref, setPref] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPref(mq.matches);
    const handler = () => setPref(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return pref;
};