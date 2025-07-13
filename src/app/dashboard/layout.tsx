'use client';
import { Sidebar } from '@/components/dashboard/Sidebar';
//import { useState } from 'react';
//import { Menu } from 'lucide-react';

// This is the simplified and correct layout.
// All the unnecessary code causing the build error has been removed.
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-skin-bg text-skin-text font-sans">
      <aside className="w-80 h-full bg-skin-card border-r border-skin-border flex-shrink-0">
        {/* The Sidebar is now called without the unnecessary prop */}
        <Sidebar />
      </aside>
      <main className="flex-1 h-full overflow-y-auto">
        <div className="p-8">
          {/* We render the children directly, which is the standard and correct way */}
          {children}
        </div>
      </main>
    </div>
  );
}