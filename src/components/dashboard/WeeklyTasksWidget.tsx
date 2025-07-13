'use client';
import { useEffect, useState, FormEvent } from "react";
import { Check, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { WeeklyTask } from "@/lib/types";
import { cn, formatDateRelativeToNow } from "@/lib/utils";
import { Card } from "../ui/Card";
import { motion, AnimatePresence } from "framer-motion";

const Skeleton = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <div key={i} className="h-10 bg-slate-200 rounded-lg animate-pulse dark:bg-zinc-700" />
    ))}
  </div>
);

export const WeeklyTasksWidget = () => {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [completedTaskIds, setCompletedTaskIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  const fetchTasks = async () => {
    setIsLoading(true);
    const response = await fetch(`/api/weekly-tasks`);
    if (response.ok) setTasks(await response.json());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (task: WeeklyTask) => {
    setCompletedTaskIds(prev => new Set(prev).add(task.id));

    const res = await fetch('/api/weekly-tasks/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task.id }),
    });

    if (res.ok) {
      toast.success("Weekly task marked complete!");
      setTasks(prevTasks => prevTasks.map(t => t.id === task.id ? { ...t, lastCompletedAt: new Date().toISOString() } : t));
      setCompletedTaskIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(task.id);
          return newSet;
      });
    } else {
      toast.error("Failed to mark task complete.");
       setCompletedTaskIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(task.id);
            return newSet;
        });
    }
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
      const newTask = await res.json();
      setNewTaskTitle("");
      setTasks(prevTasks => [...prevTasks, newTask]);
      toast.success("Weekly task added!");
    } else {
      toast.error("Failed to add task.");
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Weekly Habits</h2>
      <div className="space-y-3">
        {isLoading ? (
          <Skeleton />
        ) : (
          <AnimatePresence>
            {tasks.map(task => {
              const isCompleted = completedTaskIds.has(task.id);
              return (
                <motion.div
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                key={task.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                transition={{ duration: 0.2, ease: "easeInOut" }}
              >
                <div className="flex flex-col flex-grow min-w-0">
                  <span className="truncate">{task.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Last: {formatDateRelativeToNow(task.lastCompletedAt)}
                  </span>
                </div>
                <button
                  onClick={() => handleToggle(task)}
                  disabled={isCompleted}
                  className={cn(
                    'ml-2 px-4 py-1 whitespace-nowrap rounded-md text-sm text-white disabled:opacity-60',
                    isCompleted ? 'bg-emerald-500' : 'bg-skin-accent hover:brightness-110'
                  )}
                >
                  <AnimatePresence>
                    {isCompleted ? (
                      <motion.span
                        key="completed"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-1"
                      >
                        <Check size={16} /> Done
                      </motion.span>
                    ) : (
                      <motion.span key="complete">
                        Complete
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
       <form onSubmit={handleAddTask} className="flex items-center gap-2 mt-4">
        <input
          type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a weekly habit..."
          className="flex-grow bg-transparent text-sm p-1 border-b-2 border-slate-200 focus:outline-none focus:border-sky-500 transition-colors dark:bg-zinc-800 dark:border-zinc-600 dark:text-slate-100 dark:focus:border-sky-400"
        />
        <button type="submit" className="text-sky-500 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300" title="Add habit"><Plus size={20} /></button>
      </form>
    </Card>
  );
};