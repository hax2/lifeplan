'use client';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAction = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      <aside className="w-80 h-full bg-white border-r border-gray-200 flex-shrink-0">
        <Sidebar onProjectAction={handleAction} />
      </aside>
      <main className="flex-1 h-full overflow-y-auto">
        <div className="p-8">
          {children && (
            <children.type
              {...children.props}
              key={refreshKey}
              onProjectAction={handleAction}
            />
          )}
        </div>
      </main>
    </div>
  );
}
