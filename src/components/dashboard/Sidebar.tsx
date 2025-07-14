'use client';

import Link from 'next/link';
import { DailyTasksWidget } from "./DailyTasksWidget";
import { WeeklyTasksWidget } from "./WeeklyTasksWidget";
import { LogOut, Sun, Moon, X } from 'lucide-react';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useDarkMode } from '@/components/ui/DarkModeProvider';
import { Button } from '@/components/ui/Button';

export const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useDarkMode();

  const navLinkClasses = (href: string) => 
    cn(
      "block font-medium rounded-lg px-4 py-2",
      pathname === href 
        ? "bg-skin-accent/10 text-skin-accent" 
        : "text-skin-text/70 hover:bg-skin-border/20 hover:text-skin-text"
    );

  return (
    <div className="flex flex-col h-full p-6 bg-skin-card border-r border-skin-border">
      {/* Close button for mobile */}
      {onClose && (
        <div className="flex justify-end mb-4 md:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
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
        className="flex items-center gap-2 text-sm text-skin-text/70 hover:text-skin-text"
      >
        {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        {darkMode ? 'Light Mode' : 'Dark Mode'}
      </button>

      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="mt-4 flex items-center gap-2 text-sm text-skin-text/70 hover:text-skin-text"
      >
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
};
