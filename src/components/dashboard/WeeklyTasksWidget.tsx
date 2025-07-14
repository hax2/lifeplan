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
import { ProgressBar } from '../ui/ProgressBar';

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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const completedCount = tasks.filter(t => t.lastCompletedAt).length;

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
  // const handleToggle = async (task: WeeklyTask) => {
  //   // optimistic UI: flag it completed
  //   setCompletedTaskIds(prev => new Set(prev).add(task.id));

  //   const res = await fetch('/api/weekly-tasks/completion', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ taskId: task.id }),
  //   });

  //   if (res.ok) {
  //     toast.success('Weekly task marked complete!');
  //     mutate(prev => (prev ?? []).map(t =>
  //       t.id === task.id
  //         ? { ...t, lastCompletedAt: new Date().toISOString() }
  //         : t
  //     ));
  //   } else {
  //     toast.error('Failed to mark task complete.');
  //   }

  //   // clear optimistic flag either way
  //   setCompletedTaskIds(prev => {
  //     const next = new Set(prev);
  //     next.delete(task.id);
  //     return next;
  //   });
  // };

  // const handleArchiveTask = async (id: string) => {
  //   if (!window.confirm("Are you sure you want to archive this weekly task?")) return;
  //   try {
  //     const res = await fetch('/api/weekly-tasks/archive', {
  //       method: 'PATCH',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify({ id }),
  //     });
  //     if (res.ok) {
  //       mutate(tasks.filter(task => task.id !== id));
  //       toast.success("Weekly task archived!");
  //     } else {
  //       toast.error("Failed to archive task.");
  //     }
  //   } catch (error) {
  //     console.error("Error archiving weekly task:", error);
  //     toast.error("An error occurred while archiving.");
  //   }
  // };

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
                const isCompleted = Boolean(task.lastCompletedAt);
                return (
                  <motion.li
                    key={task.id}
                    layout="position"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg p-3 transition-[background,color] duration-150 cursor-pointer',
                      isCompleted
                        ? 'bg-emerald-50 dark:bg-emerald-900/40'
                        : 'hover:bg-slate-100 dark:hover:bg-zinc-700'
                    )}
                    onClick={e => {
                      if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                      // setCompletedTaskIds(prev => new Set(prev).add(task.id)); // This line was removed
                      mutate(prev => (prev ?? []).map(t => t.id === task.id ? { ...t, lastCompletedAt: isCompleted ? null : new Date().toISOString() } : t), false);
                      // fetch('/api/weekly-tasks/completion', { // This line was removed
                      //   method: 'POST',
                      //   headers: { 'Content-Type': 'application/json' },
                      //   body: JSON.stringify({ taskId: task.id }),
                      // }).then(res => { // This line was removed
                      //   if (!res.ok) { // This line was removed
                      //     mutate(); // This line was removed
                      //   } // This line was removed
                      //   setCompletedTaskIds(prev => { // This line was removed
                      //     const next = new Set(prev); // This line was removed
                      //     next.delete(task.id); // This line was removed
                      //     return next; // This line was removed
                      //   }); // This line was removed
                      // }); // This line was removed
                    }}
                    onDoubleClick={() => {
                      setRenamingId(task.id);
                      setRenameValue(task.title);
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => {
                        // setCompletedTaskIds(prev => new Set(prev).add(task.id)); // This line was removed
                        mutate(prev => (prev ?? []).map(t => t.id === task.id ? { ...t, lastCompletedAt: isCompleted ? null : new Date().toISOString() } : t), false);
                        // fetch('/api/weekly-tasks/completion', { // This line was removed
                        //   method: 'POST',
                        //   headers: { 'Content-Type': 'application/json' },
                        //   body: JSON.stringify({ taskId: task.id }),
                        // }).then(res => { // This line was removed
                        //   if (!res.ok) { // This line was removed
                        //     mutate(); // This line was removed
                        //   } // This line was removed
                        //   setCompletedTaskIds(prev => { // This line was removed
                        //     const next = new Set(prev); // This line was removed
                        //     next.delete(task.id); // This line was removed
                        //     return next; // This line was removed
                        //   }); // This line was removed
                        // }); // This line was removed
                      }}
                      className="h-5 w-5 accent-skin-accent cursor-pointer"
                      onClick={e => e.stopPropagation()}
                    />
                    <div className="flex-1 min-w-0">
                      {renamingId === task.id ? (
                        <input
                          className="w-full bg-transparent border-b-2 border-skin-border focus:border-skin-accent outline-none text-skin-text font-medium"
                          value={renameValue}
                          autoFocus
                          onChange={e => setRenameValue(e.target.value)}
                          onBlur={async () => {
                            if (renameValue.trim() && renameValue !== task.title) {
                              const res = await fetch(`/api/weekly-tasks/${task.id}`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ title: renameValue }),
                              });
                              if (res.ok) {
                                mutate();
                                toast.success('Task renamed!');
                              } else {
                                toast.error('Failed to rename task.');
                              }
                            }
                            setRenamingId(null);
                          }}
                          onKeyDown={e => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            } else if (e.key === 'Escape') {
                              setRenamingId(null);
                            }
                          }}
                        />
                      ) : (
                        <div className="flex flex-col min-w-0">
                          <span className={cn("break-words leading-snug font-medium truncate", isCompleted ? "text-slate-500 line-through dark:text-slate-400" : "")}>{task.title}</span>
                          <span className="text-xs text-skin-text/60 truncate">
                            {task.lastCompletedAt ? `Last: ${formatDateRelativeToNow(task.lastCompletedAt)}` : 'Not completed yet'}
                          </span>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={e => {
                        e.stopPropagation();
                        if (!window.confirm("Are you sure you want to archive this weekly task?")) return;
                        fetch('/api/weekly-tasks/archive', {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ id: task.id }),
                        }).then(res => {
                          if (res.ok) {
                            mutate(prev => (prev ?? []).filter(t => t.id !== task.id));
                            toast.success("Weekly task archived!");
                          } else {
                            toast.error("Failed to archive task.");
                          }
                        }).catch(() => toast.error("An error occurred while archiving."));
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
      <div className="mt-6">
        <p className='text-sm text-skin-text/60 mb-2 text-center'>{completedCount} of {tasks.length} tasks completed</p>
        <ProgressBar value={completedCount} max={tasks.length === 0 ? 1 : tasks.length} />
      </div>
    </Card>
  );
};
