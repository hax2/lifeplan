'use client'
import { Project } from "@/lib/types";
import { RotateCcw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Card } from "../ui/Card";

export const ArchiveWidget = ({ onProjectRestored }: { onProjectRestored: () => void }) => {
    const [archived, setArchived] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchArchived = async () => {
        setIsLoading(true);
        const res = await fetch('/api/archive');
        if (res.ok) setArchived(await res.json());
        setIsLoading(false);
    };

    useEffect(() => {
        // We add this interval to periodically check for newly archived projects
        // This makes the UI feel more alive
        const interval = setInterval(fetchArchived, 5000); // Refresh every 5 seconds
        fetchArchived(); // Initial fetch
        return () => clearInterval(interval); // Cleanup on component unmount
    }, []);

    const handleRestore = async (id: string) => {
        const res = await fetch('/api/archive/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            toast.success("Project restored!");
            setArchived(archived.filter(p => p.id !== id));
            onProjectRestored();
        } else {
            toast.error("Failed to restore project.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure? This will permanently delete the project and all its subtasks.")) return;

        const res = await fetch('/api/archive/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
        });
        if (res.ok) {
            toast.success("Project permanently deleted.");
            setArchived(archived.filter(p => p.id !== id));
        } else {
            toast.error("Failed to delete project.");
        }
    };

    return (
        <Card>
            <h2 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Archive</h2>
            {isLoading ? <p className="text-sm text-slate-500 dark:text-slate-400">Loading...</p> : 
            archived.length > 0 ? (
                <ul className="space-y-2 text-sm max-h-48 overflow-y-auto pr-2">
                    {archived.map(project => (
                        <li key={project.id} className="flex justify-between items-center group p-2 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="text-slate-700 truncate pr-2 dark:text-slate-200">{project.title}</span>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                                <button onClick={() => handleRestore(project.id)} title="Restore" className="text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400"><RotateCcw size={16} /></button>
                                <button onClick={() => handleDelete(project.id)} title="Delete Permanently" className="text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"><Trash2 size={16} /></button>
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">No archived projects.</p>
            )}
        </Card>
    );
};