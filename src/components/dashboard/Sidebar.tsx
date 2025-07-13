'use client';

import Link from 'next/link';
import { DailyTasksWidget } from "./DailyTasksWidget";
import { WeeklyTasksWidget } from "./WeeklyTasksWidget";
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export const Sidebar = ({ onProjectAction }: { onProjectAction: () => void }) => {
  const pathname = usePathname();

  const navLinkClasses = (href: string) => 
    cn(
      "block font-medium rounded-lg px-4 py-2 transition-colors",
      pathname === href 
        ? "bg-sky-100 text-sky-700" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    );

  return (
    <div className="flex flex-col h-full p-6 bg-white border-r border-slate-200">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">
        Samer's Dashboard
      </h1>
      <p className="text-slate-500 mb-8 text-sm">Your focus and rhythm command center.</p>

      <div className="flex-grow space-y-8">
        <DailyTasksWidget />
        <WeeklyTasksWidget />
      </div>

      <nav className="mb-8 space-y-2">
        <Link href="/dashboard" className={navLinkClasses("/dashboard")}>
          Active
        </Link>
        <Link href="/dashboard/done" className={navLinkClasses("/dashboard/done")}>
          Done
        </Link>
        <Link href="/dashboard/archive" className={navLinkClasses("/dashboard/archive")}>
          Archived
        </Link>
      </nav>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mt-auto flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
};
