'use client';
import { useEffect, useState, FormEvent } from "react";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import toast from "react-hot-toast";
import { DailyTask } from "@/lib/types";
import { cn } from "@/lib/utils";
import { ProgressBar } from "../ui/ProgressBar";
import { Card } from "../ui/Card";

const getTodayDateString = () => new Date().toISOString().split('T')[0];

export const DailyTasksWidget = () => {
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const fetchTasks = async () => {
    const today = getTodayDateString();
    const response = await fetch(`/api/daily-tasks?date=${today}`);
    if (response.ok) setTasks(await response.json());
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

  const handleAddTask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const res = await fetch('/api/daily-tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTaskTitle }),
    });

    if (res.ok) {
      const newTask = await res.json();
      setTasks([...tasks, newTask]);
      setNewTaskTitle("");
      toast.success("Daily task added!");
    } else {
      toast.error("Failed to add task.");
    }
  };

  const completedCount = tasks.filter(t => t.isCompleted).length;
  
  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-slate-900">Daily Rhythm</h2>
      <div className="space-y-3">
        {tasks.map(task => (
          <button
            key={task.id}
            onClick={() => handleToggle(task)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left',
              task.isCompleted
                ? 'bg-emerald-50 text-slate-500 line-through'
                : 'bg-slate-100 hover:bg-slate-200'
            )}
          >
            {task.isCompleted ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            ) : (
              <Circle className="h-5 w-5 text-slate-400 flex-shrink-0" />
            )}
            <span>{task.title}</span>
          </button>
        ))}
      </div>
       <form onSubmit={handleAddTask} className="flex items-center gap-2 mt-4">
        <input
          type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a daily habit..."
          className="flex-grow bg-transparent text-sm p-1 border-b-2 border-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button type="submit" className="text-sky-500 hover:text-sky-700" title="Add habit"><Plus size={20} /></button>
      </form>
      <div className="mt-6">
        <p className='text-sm text-slate-500 mb-2 text-center'>{completedCount} of {tasks.length} tasks completed</p>
        <ProgressBar value={completedCount} max={tasks.length} />
      </div>
    </Card>
  );
};