'use client';


import { useEffect, useState, useRef, useCallback } from 'react';
import { Project } from '@/lib/types';
import { Plus, Archive, CheckCircle2, Sparkles, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore } from '@/lib/store';
import Link from 'next/link';

const ProjectCardSkeleton = () => (
<div className="rounded-xl shadow-sm border p-6 bg-skin-card border-skin-border">
<div className="animate-pulse flex flex-col h-full">
<div className="h-5 bg-slate-200 dark:bg-zinc-700 rounded w-3/4 mb-2"></div>
<div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded w-1/2 mb-4"></div>
<div className="space-y-2 flex-grow">
<div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded"></div>
<div className="h-4 bg-slate-200 dark:bg-zinc-700 rounded w-5/6"></div>
</div>
<div className="mt-4">
<div className="h-2 bg-slate-200 dark:bg-zinc-700 rounded-full"></div>
</div>
</div>
</div>
);

const EmptyState = ({ onClickNew }: { onClickNew: () => void }) => (
<div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-16 bg-skin-card rounded-xl border border-dashed border-skin-border">
<FileText className="mx-auto h-12 w-12 text-slate-400" />
<h3 className="mt-4 text-xl font-medium text-slate-800 dark:text-slate-200">No Active Projects</h3>
<p className="text-slate-500 mt-2 dark:text-slate-400">Get started by creating a new project.</p>
<div className="mt-6">
<button
onClick={onClickNew}
className="flex items-center mx-auto gap-2 bg-skin-accent text-white font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition-colors shadow-sm"
>
<Plus size={20} />
<span>Create New Project</span>
</button>
</div>
</div>
);

export default function ActivePage() {
const { projects, setProjects, addProject, removeProject, updateProject } = useProjectStore();
const [isLoading, setIsLoading] = useState(true);
const [newProjectDraft, setNewProjectDraft] = useState<Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'isArchived' | 'isDone' | 'subtasks'> & { title: string, description: string | null } | null>(null);
const [aiLoadingProjectId, setAiLoadingProjectId] = useState<string | null>(null);
const titleInputRef = useRef<HTMLInputElement>(null);


const fetchProjects = useCallback(async () => {
setIsLoading(true);
try {
const res = await fetch('/api/projects?done=false');
if (!res.ok) throw new Error('Server responded with an error');
const data: Project[] = await res.json();
setProjects(data);
} catch {
toast.error('Failed to load projects');
} finally {
setIsLoading(false);
}
}, [setProjects]);

useEffect(() => {
if (projects.length === 0) {
fetchProjects();
} else {
setIsLoading(false);
}
}, [fetchProjects, projects.length]);

useEffect(() => {
if (newProjectDraft) {
titleInputRef.current?.focus();
}
}, [newProjectDraft]);

const handleStartNewProject = () => {
setNewProjectDraft({ title: '', description: '' });
};

const handleSaveNewProject = async () => {
if (!newProjectDraft || !newProjectDraft.title.trim()) {
toast.error('Project title cannot be empty.');
return;
}

try {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newProjectDraft),
  });

  if (!res.ok) throw new Error('Failed to create project');

  const newProject = await res.json();
  addProject({ ...newProject, subtasks: [] });
  toast.success('Project created!');
  setNewProjectDraft(null);
} catch {
  toast.error('Failed to create project.');
}


};

const markDone = async (id: string) => {
removeProject(id);
await fetch(`/api/projects/${id}`, {
method: 'PATCH',
headers: { 'Content-Type': 'application/json' },
body: JSON.stringify({ isDone: true }),
});
toast.success('Project marked as done!');
};

const archiveProject = async (id: string) => {
removeProject(id);
await fetch(`/api/projects/${id}`, { method: 'DELETE' });
window.dispatchEvent(new CustomEvent('projectArchiveChange'));
toast.success('Project archived.');
};

const handleSubtaskGeneration = async (project: Project) => {
setAiLoadingProjectId(project.id);
toast.loading('Generating subtasks...', { id: 'ai-toast' });
try {
const res = await fetch(`/api/projects/${project.id}/suggest-subtasks`, { method: 'POST' });
if (!res.ok) throw new Error('Failed to generate subtasks.');
const { count } = await res.json();
const pRes = await fetch(`/api/projects/${project.id}`);
if (pRes.ok) {
const updated = await pRes.json();
updateProject(updated);
toast.success(`${count} subtasks added!`, { id: 'ai-toast' });
}
} catch {
toast.error('An error occurred.', { id: 'ai-toast' });
} finally {
setAiLoadingProjectId(null);
}
};

return (
<motion.div>
<div className="flex justify-between items-center mb-6">
<h2 className="text-3xl font-bold text-slate-900 dark:text-white">Active Projects</h2>
<button
onClick={handleStartNewProject}
className="flex items-center gap-2 bg-skin-accent text-white font-semibold px-4 py-2 rounded-lg hover:brightness-110 transition-colors shadow-sm"
>
<Plus size={20} />
<span>New Project</span>
</button>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)
    ) : (
      <AnimatePresence>
        {newProjectDraft && (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="rounded-xl shadow-xl border border-sky-300/80 bg-sky-50/50 dark:bg-sky-900/50 dark:border-sky-700/80"
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="p-6">
              <input
                ref={titleInputRef}
                type="text"
                value={newProjectDraft.title}
                onChange={(e) => setNewProjectDraft({ ...newProjectDraft, title: e.target.value })}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNewProject(); if (e.key === 'Escape') setNewProjectDraft(null); }}
                className="text-lg font-bold text-skin-text w-full bg-transparent border-b-2 border-slate-300 focus:outline-none focus:border-skin-accent transition-colors"
                placeholder="Start with an action verb..."
              />
              <textarea
                value={newProjectDraft.description ?? ''}
                onChange={(e) => setNewProjectDraft({ ...newProjectDraft, description: e.target.value })}
                rows={2}
                className="w-full text-slate-500 text-sm bg-transparent border-b-2 border-slate-300 focus:outline-none focus:border-skin-accent resize-none mt-2 transition-colors dark:text-slate-400"
                placeholder="Add a description (optional)..."
              ></textarea>
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => setNewProjectDraft(null)} className="px-3 py-1 border rounded-md shadow-sm text-sm font-medium bg-skin-card text-skin-text border-skin-border hover:bg-slate-50 dark:hover:bg-zinc-800">Cancel</button>
                <button onClick={handleSaveNewProject} className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-skin-accent hover:brightness-110">Create</button>
              </div>
            </div>
          </motion.div>
        )}
        {projects.map((p) => {
          const doneCount = p.subtasks.filter((s) => s.isCompleted).length;
          const totalCount = p.subtasks.length;
          const isCompleted = totalCount > 0 && doneCount === totalCount;
          
          return (
            <Link key={p.id} href={`/dashboard/project/${p.id}`} className="block">
              <motion.div
                layoutId={p.id}
                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn(
                  'cursor-pointer rounded-xl shadow-md border bg-skin-card border-skin-border flex flex-col h-full',
                  isCompleted && 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-700'
                )}
              >
                <div className="p-6 flex-grow flex flex-col">
                  <h3 className="text-lg font-bold mb-1 text-skin-text flex-grow">{p.title}</h3>
                  <p className="text-slate-500 text-sm mb-4 h-10 overflow-hidden dark:text-slate-400">{p.description || 'No description.'}</p>
                  
                   <div className="flex-shrink-0 flex items-center absolute top-4 right-4 bg-skin-card/50 backdrop-blur-sm rounded-full p-1">
                       <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSubtaskGeneration(p); }} disabled={aiLoadingProjectId === p.id} className="p-1 text-slate-400 hover:text-sky-500 transition-colors disabled:text-slate-300 dark:hover:text-sky-400" title="Auto-generate Subtasks"><Sparkles className={cn("h-5 w-5", aiLoadingProjectId === p.id && "animate-spin")} /></button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); markDone(p.id); }} className="p-1 text-slate-400 hover:text-emerald-500 transition-colors dark:hover:text-emerald-400" title="Mark as Done"><CheckCircle2 className="h-5 w-5" /></button>
                      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); archiveProject(p.id); }} className="p-1 text-slate-400 hover:text-red-500 transition-colors dark:hover:text-red-400" title="Archive Project"><Archive className="h-5 w-5" /></button>
                    </div>
                </div>
                  
                {p.subtasks.length > 0 && (
                  <div className="mt-auto p-6 pt-4 border-t border-skin-border">
                    <div className="flex justify-between items-center text-sm text-slate-500 mb-2 dark:text-slate-400">
                      <span>Progress</span>
                      <span>{doneCount} / {totalCount}</span>
                    </div>
                    <ProgressBar value={doneCount} max={totalCount} />
                  </div>
                )}
              </motion.div>
            </Link>
          );
        })}
         {projects.length === 0 && !newProjectDraft && <EmptyState onClickNew={handleStartNewProject} />}
      </AnimatePresence>
    )}
  </div>
</motion.div>
);
}