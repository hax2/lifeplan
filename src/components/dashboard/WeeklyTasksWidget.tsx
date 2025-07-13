'use client';
import { useEffect, useState, FormEvent } from 'react';
import { Check, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { WeeklyTask } from '@/lib/types';
import { cn, formatDateRelativeToNow } from '@/lib/utils';
import { Card } from '../ui/Card';
import { motion, AnimatePresence } from 'framer-motion';

const Skeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className="h-10 bg-slate-200 rounded-lg animate-pulse dark:bg-zinc-700"
      />
    ))}
  </div>
);

export const WeeklyTasksWidget = () => {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(
    new Set()
  );
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    const res = await fetch('/api/weekly-tasks');
    if (res.ok) setTasks(await res.json());
    setIsLoading(false);
  };

  /* ⬇️ only once on mount */
  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (task: WeeklyTask) => {
    // optimistic flag
    setCompletedTaskIds(prev => new Set(prev).add(task.id));

    const res = await fetch('/api/weekly-tasks/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id }),
    });

    if (res.ok) {
      toast.success('Weekly task marked complete!');
      setTasks(prev =>
        prev.map(t =>
          t.id === task.id
            ? { ...t, lastCompletedAt: new Date().toISOString() }
            : t
        )
      );
    } else {
      toast.error('Failed to mark task complete.');
    }

    // clear the optimistic flag in either case
    setCompletedTaskIds(prev => {
      const next = new Set(prev);
      next.delete(task.id);
      return next;
    });
  };

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const res = await fetch('/api/weekly-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle }),
    });

    if (res.ok) {
      setTasks(prev => [...prev, await res.json()]);
      setNewTaskTitle('');
      toast.success('Weekly task added!');
    } else {
      toast.error('Failed to add task.');
    }
  };

  return (
    <Card>
      <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">
        Weekly Habits
      </h2>

      <div className="space-y-3">
        {isLoading ? (
          <Skeleton />
        ) : (
          <>
            <AnimatePresence>
              {tasks.map(task => {
                const isCompleted = completedTaskIds.has(task.id);
                return (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                    className="flex items-start gap-3 rounded-lg bg-slate-100 p-3 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                  >
                    <div className="flex min-w-0 flex-grow flex-col">
                      <span className="truncate">{task.title}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Last: {formatDateRelativeToNow(task.lastCompletedAt)}
                      </span>
                    </div>

                    <button
                      onClick={() => handleToggle(task)}
                      disabled={isCompleted}
                      className={cn(
                        'ml-2 rounded-md px-4 py-1 text-sm text-white disabled:opacity-60',
                        isCompleted
                          ? 'bg-emerald-500'
                          : 'bg-skin-accent hover:brightness-110'
                      )}
                    >
                      <AnimatePresence mode="wait">
                        {isCompleted ? (
                          <motion.span
                            key="done"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex items-center gap-1"
                          >
                            <Check size={16} /> Done
                          </motion.span>
                        ) : (
                          <motion.span
                            key="complete"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            Complete
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </>
        )}

        {/* add-task form stays outside the ternary but inside the div */}
        <form
          onSubmit={handleAddTask}
          className="mt-4 flex items-center gap-2"
        >
          <input
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            placeholder="Add a weekly habit..."
            className="flex-grow border-b-2 border-slate-200 bg-transparent p-1 text-sm transition-colors focus:border-sky-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-slate-100 dark:focus:border-sky-400"
          />
          <button
            type="submit"
            title="Add habit"
            className="text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300"
          >
            <Plus size={20} />
          </button>
        </form>
      </div>
    </Card>
  );
};
