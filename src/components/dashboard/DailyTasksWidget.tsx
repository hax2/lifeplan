'use client';
import { useEffect, useState } from "react";
import { Plus, Archive } from "lucide-react";
import toast from "react-hot-toast";
import { DailyTask } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProgressBar } from "../ui/ProgressBar";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog } from '../ui/Dialog';
import { Skeleton } from '../ui/Skeleton';

const SkeletonList = () => (
  <div className="space-y-2">
    {Array.from({ length: 4 }).map((_, i) => (
      <Skeleton key={i} className="h-10 w-full" />
    ))}
  </div>
);

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const DailyTasksWidget = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const fetchTasks = async () => {
    setIsLoading(true);
    const today = getTodayDateString();
    const response = await fetch(`/api/daily-tasks?date=${today}&isArchived=false`);
    if (response.ok) setTasks(await response.json());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (task: DailyTask) => {
    const originalTasks = [...tasks];
    const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t);
    setTasks(updatedTasks);

    const today = getTodayDateString();
    const method = !task.isCompleted ? 'POST' : 'DELETE';
    const url = !task.isCompleted
      ? '/api/daily-tasks/completion'
      : `/api/daily-tasks/completion?templateId=${task.id}&date=${today}`;
    
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: method === 'POST' ? JSON.stringify({ templateId: task.id, date: today }) : undefined,
    });

    if (!response.ok) {
      toast.error("Failed to update task.");
      setTasks(originalTasks);
    }
  };

  const handleArchiveTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to archive this daily task?")) return;
    try {
      const res = await fetch('/api/daily-tasks/archive', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setTasks(tasks.filter(task => task.id !== id));
        toast.success("Daily task archived!");
      } else {
        toast.error("Failed to archive task.");
      }
    } catch (error) {
      console.error("Error archiving daily task:", error);
      toast.error("An error occurred while archiving.");
    }
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  
  return (
    <Card variant="flat" className="flex flex-col space-y-3 max-h-[45vh]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Daily Rhythm</h2>
        <Dialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          trigger={
            <Button variant="ghost" size="md" className="ml-2 p-2 rounded-full" aria-label="Add Daily Task">
              <Plus size={20} />
            </Button>
          }
          title="Add Daily Task"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!newTaskTitle.trim()) return;
              const tempId = `temp-${Date.now()}`;
              const optimisticTask = { id: tempId, title: newTaskTitle, isCompleted: false } as DailyTask;
              setTasks(prev => [...prev, optimisticTask]);
              setDialogOpen(false);
              setNewTaskTitle("");
              try {
                const res = await fetch('/api/daily-tasks', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ title: optimisticTask.title }),
                });
                if (res.ok) {
                  const newTask = await res.json();
                  setTasks(prev => prev.map(t => t.id === tempId ? newTask : t));
                  toast.success("Daily task added!");
                } else {
                  setTasks(prev => prev.filter(t => t.id !== tempId));
                  toast.error("Failed to add task.");
                }
              } catch {
                setTasks(prev => prev.filter(t => t.id !== tempId));
                toast.error("Failed to add task.");
              }
            }}
            className="flex flex-col gap-4"
          >
            <input
              type="text"
              value={newTaskTitle}
              onChange={e => setNewTaskTitle(e.target.value)}
              placeholder="Enter daily habit..."
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
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {isLoading ? (
          <SkeletonList />
        ) : (
          <>
            <AnimatePresence>
              {tasks.slice().sort((a, b) => Number(a.isCompleted) - Number(b.isCompleted)).map(task => (
                <motion.li
                  layout="position"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  key={task.id}
                  className={cn(
                    'group flex gap-3 rounded-lg p-3 transition-[background,color] duration-150 cursor-pointer',
                    task.isCompleted
                      ? 'bg-emerald-50 dark:bg-emerald-900/40'
                      : 'hover:bg-slate-100 dark:hover:bg-zinc-700'
                  )}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  onClick={e => {
                    // Only toggle if not clicking archive or checkbox
                    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input[type="checkbox"]')) return;
                    handleToggle(task);
                  }}
                  onDoubleClick={() => {
                    setRenamingId(task.id);
                    setRenameValue(task.title);
                  }}
                >
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => handleToggle(task)}
                    className="h-5 w-5 accent-skin-accent cursor-pointer"
                    onClick={e => e.stopPropagation()}
                  />
                  {renamingId === task.id ? (
                    <input
                      className="flex-1 break-words leading-snug bg-transparent border-b-2 border-skin-border focus:border-skin-accent outline-none text-skin-text"
                      value={renameValue}
                      autoFocus
                      onChange={e => setRenameValue(e.target.value)}
                      onBlur={async () => {
                        if (renameValue.trim() && renameValue !== task.title) {
                          const res = await fetch(`/api/daily-tasks/${task.id}`, {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title: renameValue }),
                          });
                          if (res.ok) {
                            setTasks(prev => prev.map(t => t.id === task.id ? { ...t, title: renameValue } : t));
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
                    <span className={cn("flex-1 break-words leading-snug", task.isCompleted ? "text-slate-500 line-through dark:text-slate-400" : "")}
                    >
                      {task.title}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleArchiveTask(task.id);
                    }}
                  >
                    <Archive size={16} />
                  </Button>
                </motion.li>
              ))}
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