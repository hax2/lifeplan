/* ----------------------------------------------------------------
 * src/components/dashboard/WeeklyTasksWidget.tsx
 * ---------------------------------------------------------------- */
'use client';

import { useEffect, useState } from 'react';
import { Plus, Archive } from 'lucide-react';
import toast from 'react-hot-toast';
import { WeeklyTask } from '@/lib/types';
import { cn, formatDateRelativeToNow } from '@/lib/utils';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog } from '../ui/Dialog';
import useSWR from 'swr';

const Skeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="h-10 animate-pulse rounded-lg bg-skin-border/50"
      />
    ))}
  </div>
);

export function useWeeklyTasks() {
  return useSWR<WeeklyTask[]>('/api/weekly-tasks?isArchived=false',
    (url: string) => fetch(url).then(r => r.json()).then((data: unknown) => Array.isArray(data) ? data : []));
}

export const WeeklyTasksWidget = () => {
  const { data: tasks = [], isLoading, mutate } = useWeeklyTasks();
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);

  // -------- data fetching ---------------------------------------------------
  // const fetchTasks = async () => {
  //   setIsLoading(true);
  //   const res = await fetch('/api/weekly-tasks?isArchived=false');
  //   if (res.ok) setTasks(await res.json());
  //   setIsLoading(false);
  // };

  /* fetch once on mount */
  useEffect(() => {
    // fetchTasks();
  }, []);

  // -------- handlers --------------------------------------------------------
  const handleToggle = async (task: WeeklyTask) => {
    // optimistic UI: flag it completed
    setCompletedTaskIds(prev => new Set(prev).add(task.id));

    const res = await fetch('/api/weekly-tasks/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id }),
    });

    if (res.ok) {
      toast.success('Weekly task marked complete!');
      mutate(prev => (prev ?? []).map(t =>
        t.id === task.id
          ? { ...t, lastCompletedAt: new Date().toISOString() }
          : t
      ));
    } else {
      toast.error('Failed to mark task complete.');
    }

    // clear optimistic flag either way
    setCompletedTaskIds(prev => {
      const next = new Set(prev);
      next.delete(task.id);
      return next;
    });
  };

  const handleArchiveTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to archive this weekly task?")) return;
    try {
      const res = await fetch('/api/weekly-tasks/archive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        mutate(tasks.filter(task => task.id !== id));
        toast.success("Weekly task archived!");
      } else {
        toast.error("Failed to archive task.");
      }
    } catch (error) {
      console.error("Error archiving weekly task:", error);
      toast.error("An error occurred while archiving.");
    }
  };

  // -------- render ----------------------------------------------------------
  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Weekly Habits</h2>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          trigger={
            <Button variant="ghost" size="md" className="ml-2 p-2 rounded-full" aria-label="Add Weekly Task">
              <Plus size={20} />
            </Button>
          }
          title="Add Weekly Task"
        >
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newTaskTitle.trim()) return;
                const tempId = `temp-${Date.now()}`;
                const optimisticTask = { id: tempId, title: newTaskTitle, lastCompletedAt: null } as WeeklyTask;
                mutate([...tasks, optimisticTask], false);
                setDialogOpen(false);
                setNewTaskTitle('');
                try {
                  const res = await fetch('/api/weekly-tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title: optimisticTask.title }),
                  });
                  if (res.ok) {
                    const newTask = await res.json();
                    mutate(prev => (prev ?? []).map(t => t.id === tempId ? newTask : t));
                    toast.success('Weekly task added!');
                  } else {
                    mutate(prev => (prev ?? []).filter(t => t.id !== tempId));
                    toast.error('Failed to add task.');
                  }
                } catch {
                  mutate(prev => (prev ?? []).filter(t => t.id !== tempId));
                  toast.error('Failed to add task.');
                }
              }}
              className="flex flex-col gap-4"
            >
              <input
                type="text"
                value={newTaskTitle}
                onChange={e => setNewTaskTitle(e.target.value)}
                placeholder="Enter weekly habit..."
                className="bg-transparent border-b-2 border-skin-border p-2 text-sm focus:border-skin-accent focus:outline-none text-skin-text"
                autoFocus
              />
              <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Add
                </Button>
              </div>
            </form>
        </Dialog>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          <Skeleton />
        ) : (
          <>
            <AnimatePresence>
              {tasks.map(task => {
                const isCompleted = completedTaskIds.has(task.id);
                return (
                  <motion.li
                    key={task.id}
                    layout="position"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className={cn(
                      'flex gap-3 rounded-lg p-3 transition-[background,color] duration-150',
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-900/40'
                        : 'hover:bg-slate-100 dark:hover:bg-zinc-700'
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => handleToggle(task)}
                      className="h-5 w-5 accent-skin-accent"
                    />
                    <div className="flex min-w-0 flex-grow flex-col">
                      <span className="break-words leading-snug">{task.title}</span>
                      <span className="text-xs text-skin-text/60">
                        Last: {formatDateRelativeToNow(task.lastCompletedAt)}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleArchiveTask(task.id);
                      }}
                    >
                      <Archive size={16} />
                    </Button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </>
        )}
      </div>
    </Card>
  );
};
