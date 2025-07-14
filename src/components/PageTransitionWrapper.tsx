'use client';


import { AnimatePresence } from 'framer-motion';

/**

This wrapper component uses Framer Motion's AnimatePresence to enable

shared layout animations between pages. When a component with a layoutId

is removed from one page and another with the same layoutId is added

to the next, AnimatePresence will animate the transition.
*/
export const PageTransitionWrapper = ({ children }: { children: React.ReactNode }) => {
// mode="popLayout" is ideal for animations where elements are added/removed
// and we want other elements to animate to their new positions smoothly.
return <AnimatePresence mode="popLayout">{children}</AnimatePresence>;
};
