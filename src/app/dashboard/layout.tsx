'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { PageTransitionWrapper } from '@/components/PageTransitionWrapper';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
children,
}: {
children: React.ReactNode;
}) {
const [open, setOpen] = useState(false);

return (
<div className="flex h-screen bg-skin-bg text-skin-text font-sans">
{/* Sidebar toggle button (visible < md) */}
<Button
  variant="ghost"
  className="fixed bottom-6 left-6 z-20 md:hidden shadow-lg bg-skin-card/70 backdrop-blur"
  onClick={() => setOpen((o) => !o)}
>
  <Menu size={20} />
</Button>

{/* Drawer */}
<aside
  className={cn(
    'fixed inset-y-0 left-0 w-72 transform bg-skin-card transition-transform duration-300 ease-in-out md:static md:translate-x-0 z-30',
    open ? 'translate-x-0' : '-translate-x-full'
  )}
>
  <Sidebar onClose={() => setOpen(false)} />
</aside>

{/* Overlay for mobile */}
{open && (
  <div
    className="fixed inset-0 bg-black/20 z-10 md:hidden"
    onClick={() => setOpen(false)}
  />
)}

<main className="flex-1 h-full overflow-y-auto">
{/* The p-8 is moved inside the wrapper to ensure page content
fades in and out smoothly during transitions. */}
<PageTransitionWrapper>
<div className="p-8">
{children}
</div>
</PageTransitionWrapper>
</main>
</div>
);
}
