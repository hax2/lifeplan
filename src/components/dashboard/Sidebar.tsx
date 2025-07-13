'use client';

import Link from 'next/link';
import { DailyTasksWidget } from "./DailyTasksWidget";
import { WeeklyTasksWidget } from "./WeeklyTasksWidget";
import { LogOut, Sun, Moon } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDarkMode } from '@/components/ui/DarkModeProvider';

export const Sidebar = () => {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const navLinkClasses = (href: string) => 
    cn(
      "block font-medium rounded-lg px-4 py-2",
      pathname === href 
        ? "bg-sky-100 text-sky-700 dark:bg-sky-700 dark:text-sky-100" 
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-50"
    );

  return (
    <div className="flex flex-col h-full p-6 bg-white border-r border-slate-200 dark:bg-zinc-950 dark:border-zinc-800">
      <h1 className="text-2xl font-bold text-slate-900 mb-2 dark:text-white">
        Samer&apos;s Dashboard
      </h1>
      <p className="text-slate-500 mb-4 text-sm dark:text-slate-400">
        {new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        }).format(new Date())}
      </p>

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
        onClick={toggleDarkMode}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-50"
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mt-4 flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-50"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
};
