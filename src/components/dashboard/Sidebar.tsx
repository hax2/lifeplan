'use client';

import Link from 'next/link';
import { DailyTasksWidget } from "./DailyTasksWidget";
import { WeeklyTasksWidget } from "./WeeklyTasksWidget";
import { LogOut, Sun, Moon, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { useDarkMode } from '@/components/ui/DarkModeProvider';
import { Button } from '@/components/ui/Button';

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <div className="flex flex-col h-full p-6 bg-skin-card border-r border-skin-border">
      {/* Close button for mobile */}
      {onClose && (
        <div className="flex justify-end mb-4 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="btn-icon"
          >
            <X size={20} />
          </Button>
        </div>
      )}
      <h1 className="text-2xl font-bold text-skin-text mb-2">
        Samer&apos;s Dashboard
      </h1>
      <p className="text-skin-text/60 mb-4 text-sm">
        {new Intl.DateTimeFormat('en-US', {
          weekday: 'long',
          month: 'short',
          day: 'numeric',
        }).format(new Date())}
      </p>

      <div className="flex flex-col flex-grow min-h-0">
        <div className="flex-grow min-h-0 pr-1 space-y-3">
          <DailyTasksWidget />
          <hr className="border-skin-border/70" />
          <WeeklyTasksWidget />
        </div>
        <div className="mt-4 flex flex-col gap-1">
          <Link href="/dashboard" className="block text-xs font-normal rounded px-2 py-1 w-full text-left transition-colors hover:bg-skin-border/20 focus:outline-none focus:ring-2 focus:ring-skin-accent">
            Active
          </Link>
          <Link href="/dashboard/done" className="block text-xs font-normal rounded px-2 py-1 w-full text-left transition-colors hover:bg-skin-border/20 focus:outline-none focus:ring-2 focus:ring-skin-accent">
            Done
          </Link>
          <Link href="/dashboard/archive" className="block text-xs font-normal rounded px-2 py-1 w-full text-left transition-colors hover:bg-skin-border/20 focus:outline-none focus:ring-2 focus:ring-skin-accent">
            Archived
          </Link>
          <hr className="my-2 border-skin-border/70" />
          <button
            onClick={toggleDarkMode}
            className="flex items-center gap-2 text-xs font-normal rounded px-2 py-1 w-full text-left transition-colors hover:bg-skin-border/20 focus:outline-none focus:ring-2 focus:ring-skin-accent"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-2 text-xs font-normal rounded px-2 py-1 w-full text-left transition-colors hover:bg-skin-border/20 focus:outline-none focus:ring-2 focus:ring-skin-accent"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
