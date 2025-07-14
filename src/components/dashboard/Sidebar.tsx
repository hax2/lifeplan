import React from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { LogOut, Sun, Moon, X, LayoutDashboard, Check, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

// Placeholder widgets for now
const DailyTasksWidget = () => <Card className="mb-4">Daily Tasks Widget</Card>;
const WeeklyTasksWidget = () => <Card>Weekly Tasks Widget</Card>;

export interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  user?: { name: string; email: string };
}

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  darkMode,
  toggleDarkMode,
  user,
}) => {
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-72 bg-[var(--c-card)] border-r border-[var(--c-border)] flex flex-col transition-transform duration-300',
        isOpen ? 'translate-x-0' : '-translate-x-full',
        'md:static md:translate-x-0 md:w-64 md:shadow-none'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-[var(--c-border)]">
        <div>
          <h1 className="text-2xl font-bold">Samer&apos;s Dashboard</h1>
          {user && (
            <div className="text-secondary text-sm mt-1">{user.name}</div>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onClose}
          icon={<X size={20} />}
          aria-label="Close sidebar"
        />
      </div>

      {/* Widgets (scrollable) */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        <DailyTasksWidget />
        <WeeklyTasksWidget />
      </div>

      {/* Bottom Navigation (fixed) */}
      <div className="border-t border-[var(--c-border)] p-6">
        <nav className="flex flex-col gap-2 mb-4">
          <Button variant="ghost" size="sm" icon={<LayoutDashboard size={18} />}>Active</Button>
          <Button variant="ghost" size="sm" icon={<Check size={18} />}>Done</Button>
          <Button variant="ghost" size="sm" icon={<Archive size={18} />}>Archive</Button>
        </nav>
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            size="sm"
            icon={darkMode ? <Sun size={18} /> : <Moon size={18} />}
            onClick={toggleDarkMode}
          >
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Button>
          <Button variant="ghost" size="sm" icon={<LogOut size={18} />}>Sign Out</Button>
        </div>
      </div>
    </aside>
  );
}; 