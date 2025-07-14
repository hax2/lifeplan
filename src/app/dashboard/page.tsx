'use client';


import { useEffect, useState, useRef, useCallback } from 'react';
import { Project } from '@/lib/types';
import { Plus, Archive, CheckCircle2, Sparkles, FileText, Circle } from 'lucide-react';
import toast from 'react-hot-toast';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore } from '@/lib/store';
import Link from 'next/link';

const ProjectCardSkeleton = () => (
<div className="rounded-xl shadow-sm border p-6 bg-skin-card border-skin-border min-h-[280px]">
<div className="animate-pulse flex flex-col h-full">
<div className="h-5 bg-skin-border/50 rounded w-3/4 mb-2"></div>
<div className="h-4 bg-skin-border/50 rounded w-1/2 mb-4"></div>
<div className="space-y-2 flex-grow">
<div className="h-4 bg-skin-border/50 rounded"></div>
<div className="h-4 bg-skin-border/50 rounded w-5/6"></div>
</div>
<div className="mt-4">
<div className="h-2 bg-skin-border/50 rounded-full"></div>
</div>
</div>
</div>
);

const EmptyState = ({ onClickNew }: { onClickNew: () => void }) => (
<div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-16 bg-skin-card rounded-xl border border-dashed border-skin-border">
<FileText className="mx-auto h-12 w-12 text-slate-400" />
<h3 className="mt-4 text-xl font-medium text-skin-text">No Active Projects</h3>
<p className="text-skin-text/60 mt-2">Get started by creating a new project.</p>
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
const { projects, setProjects, addProject, removeProject, updateProject } = useProjectStore((state) => state);
const [isLoading, setIsLoading] = useState(true);
const [draft, setDraft] = useState({ title: '', description: '' });
const [showDraft, setShowDraft] = useState(false);
const [aiLoadingProjectId, setAiLoadingProjectId] = useState<string | null>(null);
const titleInputRef = useRef<HTMLInputElement>(null);
const hasFocusedOnce = useRef(false);


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
if (showDraft && !hasFocusedOnce.current) {
titleInputRef.current?.focus();
hasFocusedOnce.current = true;
}
}, [showDraft]);

const handleChange = (field: 'title' | 'description') =>
  (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setDraft((d) => ({ ...d, [field]: e.target.value }));

const handleStartNewProject = () => {
setDraft({ title: '', description: '' });
setShowDraft(true);
hasFocusedOnce.current = false;
};

const handleSaveNewProject = async () => {
if (!draft.title.trim()) {
toast.error('Project title cannot be empty.');
return;
}

try {
  const res = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(draft),
  });

  if (!res.ok) throw new Error('Failed to create project');

  const newProject = await res.json();
  addProject({ ...newProject, subtasks: [] });
  toast.success('Project created!');
  setDraft({ title: '', description: '' });
  setShowDraft(false);
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
<motion.div layout="position">
<div className="flex justify-between items-center mb-6">
<h2 className="text-3xl font-bold text-skin-text">Active Projects</h2>
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
        {showDraft && (
          <motion.div
            layout="position"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className="rounded-xl shadow-lg border border-sky-300/80 bg-sky-50/50 dark:bg-sky-900/50 dark:border-sky-700/80"
            transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
          >
            <div className="p-6">
              <input
                ref={titleInputRef}
                type="text"
                value={draft.title}
                onChange={handleChange('title')}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveNewProject(); if (e.key === 'Escape') { setDraft({ title: '', description: '' }); setShowDraft(false); } }}
                className="text-lg font-bold text-skin-text w-full bg-transparent border-b-2 border-slate-300 focus:outline-none focus:border-skin-accent transition-colors"
                placeholder="Start with an action verb..."
              />
              <textarea
                value={draft.description}
                onChange={handleChange('description')}
                rows={2}
                className="w-full text-slate-500 text-sm bg-transparent border-b-2 border-slate-300 focus:outline-none focus:border-skin-accent resize-none mt-2 transition-colors dark:text-slate-400"
                placeholder="Optional description..."
              ></textarea>
              <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => { setDraft({ title: '', description: '' }); setShowDraft(false); }} className="px-3 py-1 border rounded-md shadow-sm text-sm font-medium bg-skin-card text-skin-text border-skin-border hover:bg-skin-border/20">Cancel</button>
                <button onClick={handleSaveNewProject} className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-skin-accent hover:brightness-110">Create</button>
              </div>
            </div>
          </motion.div>
        )}
        {projects.map((p) => {
          const subtasks = p.subtasks || [];
          const doneCount = subtasks.filter((s) => s.isCompleted).length;
          const totalCount = subtasks.length;
          const isCompleted = totalCount > 0 && doneCount === totalCount;
          const uncompletedSubtasks = subtasks.filter(s => !s.isCompleted).slice(0, 3);
          const remainingUncompletedCount = subtasks.filter(s => !s.isCompleted).length - uncompletedSubtasks.length;
          
          return (
            <Link key={p.id} href={`/dashboard/project/${p.id}`} className="block">
              <motion.div
                layout="position"
                layoutId={p.id}
                whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className={cn(
                  'cursor-pointer rounded-xl shadow-sm border bg-skin-card border-skin-border flex flex-col h-full min-h-[280px] hover:shadow-lg transition-[box-shadow] duration-150',
                  isCompleted && 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-700'
                )}
              >
                <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-skin-text pr-4 flex-1">{p.title}</h3>
                        <div className="flex items-center gap-1 flex-shrink-0 -mr-2 -mt-2">
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleSubtaskGeneration(p); }} disabled={aiLoadingProjectId === p.id} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-sky-500 transition-colors disabled:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-sky-400" title="Auto-generate Subtasks"><Sparkles className={cn("h-5 w-5", aiLoadingProjectId === p.id && "animate-spin")} /></button>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); markDone(p.id); }} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-emerald-500 transition-colors dark:hover:bg-slate-700 dark:hover:text-emerald-400" title="Mark as Done"><CheckCircle2 className="h-5 w-5" /></button>
                            <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); archiveProject(p.id); }} className="p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500 transition-colors dark:hover:bg-slate-700 dark:hover:text-red-400" title="Archive Project"><Archive className="h-5 w-5" /></button>
                        </div>
                    </div>

                  <p className="text-skin-text/60 text-sm mb-4 h-10 overflow-hidden">{p.description || 'No description.'}</p>
                  
                    <div className="space-y-3 mt-2 mb-4 flex-grow">
                    {uncompletedSubtasks.length > 0 ? (
                        <ul className="space-y-2">
                        {uncompletedSubtasks.map(subtask => (
                            <li key={subtask.id} className="flex items-center gap-2.5 text-sm text-skin-text/80">
                            <Circle size={14} className="text-skin-border flex-shrink-0" />
                            <span className="truncate">{subtask.text}</span>
                            </li>
                        ))}
                        {remainingUncompletedCount > 0 && (
                            <li style={{ paddingLeft: '24px' }} className="text-xs text-skin-text/50">+ {remainingUncompletedCount} more</li>
                        )}
                        </ul>
                    ) : totalCount > 0 ? (
                        <div className="text-center text-sm text-emerald-500 py-3 flex items-center justify-center gap-2">
                            <CheckCircle2 size={16}/>
                            <span>All tasks complete!</span>
                        </div>
                    ) : (
                        <div className="text-center text-sm text-skin-text/50 py-3">
                            No subtasks yet.
                        </div>
                    )}
                    </div>
                </div>
                  
                {subtasks.length > 0 && (
                  <div className="mt-auto p-6 pt-4 border-t border-skin-border/80">
                    <div className="flex justify-between items-center text-sm text-skin-text/60 mb-2">
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
         {projects.length === 0 && !showDraft && <EmptyState onClickNew={handleStartNewProject} />}
      </AnimatePresence>
    )}
  </div>
</motion.div>
);
}