'use client';


import { Sidebar } from '@/components/dashboard/Sidebar';
import { PageTransitionWrapper } from '@/components/PageTransitionWrapper';

export default function DashboardLayout({
children,
}: {
children: React.ReactNode;
}) {
return (
<div className="flex h-screen bg-skin-bg text-skin-text font-sans">
<aside className="w-80 h-full bg-skin-card border-r border-skin-border flex-shrink-0">
<Sidebar />
</aside>
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
