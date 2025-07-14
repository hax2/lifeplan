'use client'


import { Project, Subtask } from "@/lib/types";
import { ArrowLeft, CheckCircle2, Circle, Plus, Archive, Edit, Save, X, Sparkles } from "lucide-react";
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

const { getProjectById, updateProject, removeProject } = useProjectStore();
const [project, setProject] = useState<Project | undefined>(getProjectById(id as string));
const [isLoading, setIsLoading] = useState(!project);
const [isEditing, setIsEditing] = useState(false);
const [editData, setEditData] = useState({ title: '', description: '' });
const [aiLoading, setAiLoading] = useState(false);

const [newSubtaskText, setNewSubtaskText] = useState("");

const fetchProject = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
        const res = await fetch(`/api/projects/${id}`);
        if (res.ok) {
            const fetchedProject = await res.json();
            setProject(fetchedProject);
            updateProject(fetchedProject);
            setEditData({ title: fetchedProject.title, description: fetchedProject.description || '' });
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
}, [id, router, updateProject]);

useEffect(() => {
    if (!project) {
        fetchProject();
    } else {
         setEditData({ title: project.title, description: project.description || '' });
    }
}, [project, fetchProject]);

const handleEditSave = async () => {
    if (!project) return;
    const toastId = toast.loading('Saving...');
    try {
        const res = await fetch(`/api/projects/${project.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(editData),
        });
        if (res.ok) {
            const updatedProject = await res.json();
            setProject(p => p ? {...p, ...updatedProject} : undefined);
            updateProject(updatedProject);
            toast.success('Project updated!', { id: toastId });
            setIsEditing(false);
        } else { throw new Error('Failed to save'); }
    } catch {
        toast.error('Could not save changes.', { id: toastId });
    }
};

const handleAddSubtask = async (e: FormEvent) => {
    e.preventDefault();
    if (!newSubtaskText.trim() || !project) return;

    const tempId = `temp-${Date.now()}`;
    const newOptimisticSubtask: Subtask = { id: tempId, text: newSubtaskText, isCompleted: false, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    
    const updater = (p: Project | undefined) => p ? { ...p, subtasks: [...p.subtasks, newOptimisticSubtask] } : undefined;
    setProject(updater);
    setNewSubtaskText("");

    const res = await fetch('/api/subtasks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ text: newSubtaskText, projectId: project.id }) });

    if (res.ok) {
        const createdSubtask = await res.json();
        const finalUpdater = (p: Project | undefined) => {
            if (!p) return undefined;
            const finalSubtasks = p.subtasks.map(s => s.id === tempId ? createdSubtask : s);
            updateProject({ id: p.id, subtasks: finalSubtasks });
            return { ...p, subtasks: finalSubtasks };
        };
        setProject(finalUpdater);
    } else {
        toast.error("Failed to add subtask.");
        setProject(p => p ? { ...p, subtasks: p.subtasks.filter(s => s.id !== tempId) } : undefined);
    }
};

const handleToggleSubtask = async (subtask: Subtask) => {
    if (!project) return;
    
    const updatedSubtasks = project.subtasks.map(s => s.id === subtask.id ? { ...s, isCompleted: !s.isCompleted } : s);
    setProject(p => p ? { ...p, subtasks: updatedSubtasks } : undefined);
    updateProject({ id: project.id, subtasks: updatedSubtasks });

    const res = await fetch(`/api/subtasks/${subtask.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isCompleted: !subtask.isCompleted }) });
    
    if (!res.ok) {
        toast.error("Failed to update subtask.");
        fetchProject(); // Revert on failure
    }
};

const handleAction = async (action: 'archive' | 'done') => {
    if (!project || (action === 'archive' && !window.confirm("Are you sure?"))) return;

    removeProject(project.id);
    router.push('/dashboard');

    if (action === 'archive') {
        await fetch(`/api/projects/${project.id}`, { method: 'DELETE' });
        window.dispatchEvent(new CustomEvent('projectArchiveChange'));
        toast.success("Project archived.");
    } else if (action === 'done') {
        await fetch(`/api/projects/${project.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ isDone: true }) });
        toast.success("Project marked as done.");
    }
};

const handleSubtaskGeneration = async () => {
    if (!project) return;
    setAiLoading(true);
    toast.loading('Generating subtasks...', { id: 'ai-toast' });
    try {
        const res = await fetch(`/api/projects/${project.id}/suggest-subtasks`, { method: 'POST' });
        if (!res.ok) throw new Error('Failed to generate subtasks.');
        toast.success(`Subtasks added!`, { id: 'ai-toast' });
        await fetchProject();
    } catch {
        toast.error('An error occurred.', { id: 'ai-toast' });
    } finally {
        setAiLoading(false);
    }
};

if (isLoading) return <motion.div><ProjectDetailSkeleton /></motion.div>;
if (!project) return null;

return (
    <motion.div layoutId={id as string}>
        <Card className="w-full max-w-4xl mx-auto shadow-2xl bg-skin-card border-skin-border">
            <div className="p-6 border-b border-skin-border">
                <Link href="/dashboard" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-4 text-skin-text hover:text-skin-accent/80">
                    <ArrowLeft size={16} />
                    Back to All Projects
                </Link>
                <div className="flex justify-between items-start gap-4">
                    {isEditing ? (
                        <div className="flex-grow">
                             <input type="text" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} className="text-3xl font-bold text-skin-text bg-transparent border-b-2 border-skin-border focus:border-skin-accent focus:outline-none w-full" />
                             <textarea value={editData.description} onChange={e => setEditData({...editData, description: e.target.value})} className="text-skin-text mt-1 bg-transparent border-b-2 border-skin-border focus:border-skin-accent focus:outline-none w-full resize-none" />
                        </div>
                    ) : (
                        <div className="flex-grow">
                            <h1 className="text-3xl font-bold text-skin-text">{project.title}</h1>
                            <p className="text-slate-500 mt-1 text-skin-text dark:text-slate-400">{project.description || 'No description provided.'}</p>
                        </div>
                    )}
                    <div className="flex-shrink-0 flex items-center gap-1 bg-skin-card/50 backdrop-blur-sm rounded-full p-1 border border-skin-border">
                         {isEditing ? (
                            <>
                                <button onClick={handleEditSave} className="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full" title="Save Changes"><Save size={20}/></button>
                                <button onClick={() => setIsEditing(false)} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full" title="Cancel"><X size={20}/></button>
                            </>
                         ) : (
                            <>
                                <button onClick={() => setIsEditing(true)} className="p-2 text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 rounded-full" title="Edit Project"><Edit size={20}/></button>
                                <button onClick={handleSubtaskGeneration} disabled={aiLoading} className="p-2 text-slate-500 hover:text-sky-600 disabled:opacity-50 dark:hover:text-sky-400 rounded-full" title="Auto-generate Subtasks">
                                    <Sparkles className={cn("h-5 w-5", aiLoading && "animate-spin")} />
                                </button>
                                <button onClick={() => handleAction('done')} className="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-full" title="Mark as Done"><CheckCircle2 size={20}/></button>
                                <button onClick={() => handleAction('archive')} className="p-2 text-slate-500 hover:text-red-600 dark:hover:text-red-400 rounded-full" title="Archive Project"><Archive size={20} /></button>
                            </>
                         )}
                    </div>
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
                            className={cn('w-full relative flex items-center gap-3 p-3 rounded-lg text-left', subtask.isCompleted ? 'bg-emerald-50 dark:bg-emerald-900/50' : 'bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700')}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                        >
                            {subtask.isCompleted ? <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 dark:text-emerald-400" /> : <Circle className="h-5 w-5 text-slate-400 flex-shrink-0 text-skin-text/50" />}
                            <span className={cn("flex-grow", subtask.isCompleted && "text-slate-500 line-through dark:text-slate-400")}>{subtask.text}</span>
                        </motion.button>
                    ))}
                    </AnimatePresence>
                    {project.subtasks.length === 0 && (
                        <p className="text-slate-500 text-center py-4 text-skin-text dark:text-slate-400">No subtasks for this project yet.</p>
                    )}
                </div>
                <form onSubmit={handleAddSubtask} className="flex items-center gap-3">
                    <input
                        type="text" value={newSubtaskText} onChange={(e) => setNewSubtaskText(e.target.value)}
                        placeholder="Add a new checklist item..."
                        className="w-full px-4 py-2 text-md border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 dark:bg-zinc-800 dark:border-zinc-700 dark:text-slate-100 dark:focus:ring-sky-400 dark:focus:border-sky-400"
                    />
                    <button type="submit" className="p-3 bg-skin-accent text-white rounded-md hover:brightness-110 disabled:opacity-50 transition-colors" disabled={!newSubtaskText.trim()} title="Add item">
                        <Plus size={24} />
                    </button>
                </form>
            </div>
        </Card>
    </motion.div>
);
}