'use client';
import { useEffect, useState, FormEvent } from "react";
import { Plus } from "lucide-react";
import toast from "react-hot-toast";
import { WeeklyTask } from "@/lib/types";
import { formatDateRelativeToNow } from "@/lib/utils";
import { Card } from "../ui/Card";

export const WeeklyTasksWidget = () => {
  const [tasks, setTasks] = useState<WeeklyTask[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");

  const fetchTasks = async () => {
    const response = await fetch(`/api/weekly-tasks`);
    if (response.ok) setTasks(await response.json());
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (task: WeeklyTask) => {
    const res = await fetch('/api/weekly-tasks/completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ weeklyTaskId: task.id }),
    });

    if (res.ok) {
      toast.success("Weekly task marked complete!");
      fetchTasks(); // Re-fetch to update lastCompletedAt
    } else {
      toast.error("Failed to mark task complete.");
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
      setNewTaskTitle("");
      toast.success("Weekly task added!");
      fetchTasks();
    } else {
      toast.error("Failed to add task.");
    }
  };

  return (
    <Card>
      <h2 className="text-xl font-bold mb-4 text-slate-900">Weekly Habits</h2>
      <div className="space-y-3">
        {tasks.map(task => (
          <div
            key={task.id}
            className="w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left bg-slate-100 hover:bg-slate-200"
          >
            <span className="flex-grow">{task.title}</span>
            <span className="text-xs text-slate-500 flex-shrink-0">
              Last: {formatDateRelativeToNow(task.lastCompletedAt)}
            </span>
            <button
              onClick={() => handleToggle(task)}
              className="ml-2 px-3 py-1 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition-colors text-sm"
            >
              Done
            </button>
          </div>
        ))}
      </div>
       <form onSubmit={handleAddTask} className="flex items-center gap-2 mt-4">
        <input
          type="text" value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)}
          placeholder="Add a weekly habit..."
          className="flex-grow bg-transparent text-sm p-1 border-b-2 border-slate-200 focus:outline-none focus:border-sky-500 transition-colors"
        />
        <button type="submit" className="text-sky-500 hover:text-sky-700" title="Add habit"><Plus size={20} /></button>
      </form>
    </Card>
  );
};
