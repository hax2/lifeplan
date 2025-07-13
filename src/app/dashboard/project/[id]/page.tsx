'use client'

import { Project, Subtask } from "@/lib/types";
import { ArrowLeft, CheckCircle2, Circle, Plus, Archive, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, FormEvent } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [project, setProject] = useState<Project | null>(null);
    const [newSubtaskText, setNewSubtaskText] = useState("");

    const fetchProject = async () => {
        if (!id) return;
        const res = await fetch(`/api/projects/${id}`);
        if (res.ok) {
            setProject(await res.json());
        } else {
            toast.error("Could not load project.");
            router.push('/dashboard');
        }
    };

    useEffect(() => {
        fetchProject();
    }, [id]);

    const handleAddSubtask = async (e: FormEvent) => {
        e.preventDefault();
        if (!newSubtaskText.trim() || !project) return;
        
        const res = await fetch('/api/subtasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: newSubtaskText, projectId: project.id }),
        });

        if (res.ok) {
            setNewSubtaskText("");
            fetchProject();
        } else {
            toast.error("Failed to add subtask.");
        }
    };

    const handleToggleSubtask = async (subtask: Subtask) => {
        if (!project) return;
        
        const updatedSubtasks = project.subtasks.map(s => 
            s.id === subtask.id ? { ...s, isCompleted: !s.isCompleted } : s
        );
        setProject({ ...project, subtasks: updatedSubtasks });

        const res = await fetch(`/api/subtasks/${subtask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCompleted: !subtask.isCompleted }),
        });
        
        if (!res.ok) {
            toast.error("Failed to update subtask.");
            fetchProject();
        }
    };

    const handleArchiveProject = async () => {
        if (!project || !window.confirm("Are you sure you want to archive this project?")) return;

        const res = await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
        
        if (res.ok) {
            toast.success("Project archived.");
            router.push('/dashboard');
        } else {
            toast.error("Failed to archive project.");
        }
    };
    
    if (!project) {
        return <div className="text-center p-10 text-slate-500">Loading project...</div>;
    }

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-2xl">
            <div className="p-6 border-b border-slate-200">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 transition-colors">
                    <ArrowLeft size={16} />
                    Back to All Projects
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{project.title}</h1>
                        <p className="text-slate-500 mt-1">{project.description || 'No description provided.'}</p>
                    </div>
                     <button onClick={handleArchiveProject} className="flex-shrink-0 ml-4 p-2 text-slate-500 hover:text-red-600 transition-colors" title="Archive Project">
                        <Archive size={20} />
                    </button>
                </div>
            </div>
            <div className="p-6">
                <h3 className="font-bold mb-4 text-slate-800">Checklist</h3>
                <div className="space-y-3 mb-6">
                    {project.subtasks.map(subtask => (
                        <button
                            key={subtask.id}
                            onClick={() => handleToggleSubtask(subtask)}
                            className={cn(
                                'w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 text-left',
                                subtask.isCompleted
                                ? 'bg-emerald-50 text-slate-500 line-through'
                                : 'bg-slate-100 hover:bg-slate-200'
                            )}
                        >
                            {subtask.isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                            ) : (
                                <Circle className="h-5 w-5 text-slate-400 flex-shrink-0" />
                            )}
                            <span className="flex-grow">{subtask.text}</span>
                        </button>
                    ))}
                    {project.subtasks.length === 0 && (
                        <p className="text-slate-500 text-center py-4">No subtasks for this project yet.</p>
                    )}
                </div>
                <form onSubmit={handleAddSubtask} className="flex items-center gap-3">
                    <input
                        type="text" value={newSubtaskText} onChange={(e) => setNewSubtaskText(e.target.value)}
                        placeholder="Add a new checklist item..."
                        className="w-full px-4 py-2 text-md border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                    />
                    <button type="submit" className="p-3 bg-sky-500 text-white rounded-md hover:bg-sky-600 disabled:opacity-50 transition-colors" disabled={!newSubtaskText.trim()} title="Add item">
                        <Plus size={24} />
                    </button>
                </form>
            </div>
        </Card>
    );
}