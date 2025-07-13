'use client'

import { Project, Subtask } from "@/lib/types";
import { ArrowLeft, CheckCircle2, Circle, Plus, Archive } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState, FormEvent, useCallback } from "react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/Card";
import { motion, AnimatePresence } from "framer-motion";
import { useProjectStore } from "@/lib/store";

const ProjectDetailSkeleton = () => (
    <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-skin-card border-skin-border">
        <div className="p-6 border-b border-skin-border animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-48 mb-6 bg-skin-card"></div>
            <div className="h-8 bg-slate-200 rounded w-1/2 mb-2 bg-skin-card"></div>
            <div className="h-5 bg-slate-200 rounded w-3/4 bg-skin-card"></div>
        </div>
        <div className="p-6 animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-32 mb-6 bg-skin-card"></div>
            <div className="space-y-4">
                <div className="h-12 bg-slate-200 rounded-lg bg-skin-card"></div>
                <div className="h-12 bg-slate-200 rounded-lg bg-skin-card"></div>
                <div className="h-12 bg-slate-200 rounded-lg w-5/6 dark:bg-slate-700"></div>
            </div>
        </div>
    </Card>
);

export default function ProjectDetailPage() {
    const { id } = useParams();
    const router = useRouter();

    const getProjectById = useProjectStore(state => state.getProjectById);
    const updateProjectInStore = useProjectStore(state => state.updateProject);
    const [project, setProject] = useState<Project | undefined>(getProjectById(id as string));
    const [isLoading, setIsLoading] = useState(!project);

    const [newSubtaskText, setNewSubtaskText] = useState("");

    const fetchProject = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (res.ok) {
                const fetchedProject = await res.json();
                setProject(fetchedProject);
                updateProjectInStore(fetchedProject);
            } else {
                toast.error("Could not load project details.");
                router.push('/dashboard');
            }
        } catch {
            toast.error("A network error occurred.");
            router.push('/dashboard');
        } finally {
            setIsLoading(false);
        }
    }, [id, router, updateProjectInStore]);

    useEffect(() => {
        if (!project) {
            fetchProject();
        }
    }, [project, fetchProject]);

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
        const updatedProject = { ...project, subtasks: updatedSubtasks };
        setProject(updatedProject);
        updateProjectInStore(updatedProject);

        const res = await fetch(`/api/subtasks/${subtask.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ isCompleted: !subtask.isCompleted }),
        });
        
        if (!res.ok) {
            toast.error("Failed to update subtask.");
            fetchProject(); // Revert on failure
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
    
    if (isLoading) {
        return <ProjectDetailSkeleton />;
    }

    if (!project) {
        return (
             <div className="text-center p-10 text-skin-text">
                <h2 className="text-xl font-semibold">Project not found</h2>
                <Link href="/dashboard" className="text-sky-600 hover:underline text-skin-accent">
                    Return to dashboard
                </Link>
            </div>
        );
    }

    return (
        <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-skin-card border-skin-border">
            <div className="p-6 border-b border-skin-border">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 text-skin-text hover:text-skin-text">
                    <ArrowLeft size={16} />
                    Back to All Projects
                </Link>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-skin-text">{project.title}</h1>
                        <p className="text-slate-500 mt-1 text-skin-text">{project.description || 'No description provided.'}</p>
                    </div>
                     <button onClick={handleArchiveProject} className="flex-shrink-0 ml-4 p-2 text-slate-500 hover:text-red-600 text-skin-text hover:text-red-600" title="Archive Project">
                        <Archive size={20} />
                    </button>
                </div>
            </div>
            <div className="p-6">
                <h3 className="font-bold mb-4 text-skin-text">Checklist</h3>
                <div className="space-y-3 mb-6">
                    <AnimatePresence>
                    {project.subtasks.map(subtask => (
                        <motion.button
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            key={subtask.id}
                            onClick={() => handleToggleSubtask(subtask)}
                            className={cn('w-full relative flex items-center gap-3 p-3 rounded-lg text-left', subtask.isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/50' : 'bg-slate-100 hover:bg-slate-200 bg-skin-card hover:bg-skin-card')}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            {subtask.isCompleted ? <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 dark:text-emerald-400" /> : <Circle className="h-5 w-5 text-slate-400 flex-shrink-0 text-skin-text" />}
                            <span className={cn("flex-grow", subtask.isCompleted && "text-slate-500 line-through text-skin-text")}>{subtask.text}</span>
                        </motion.button>
                    ))}
                    </AnimatePresence>
                    {project.subtasks.length === 0 && (
                        <p className="text-slate-500 text-center py-4 text-skin-text">No subtasks for this project yet.</p>
                    )}
                </div>
                <form onSubmit={handleAddSubtask} className="flex items-center gap-3">
                    <input
                        type="text" value={newSubtaskText} onChange={(e) => setNewSubtaskText(e.target.value)}
                        placeholder="Add a new checklist item..."
                        className="w-full px-4 py-2 text-md border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-100 dark:focus:ring-sky-400 dark:focus:border-sky-400"
                    />
                    <button type="submit" className="p-3 bg-sky-500 text-white rounded-md hover:bg-sky-600 disabled:opacity-50 transition-colors dark:bg-sky-700 dark:hover:bg-sky-600" disabled={!newSubtaskText.trim()} title="Add item">
                        <Plus size={24} />
                    </button>
                </form>
            </div>
        </Card>
    );
}