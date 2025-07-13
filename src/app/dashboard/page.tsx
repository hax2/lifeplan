'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { Project } from '@/lib/types';
import { Plus, Archive, CheckCircle2, X, Sparkles, Circle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { useProjectStore } from '@/lib/store';

const ProjectCardSkeleton = () => (
    <div className="rounded-xl shadow-sm border border-slate-200/80 bg-skin-card p-6 border-skin-border">
        <div className="animate-pulse flex flex-col h-full">
            <div className="h-5 bg-slate-200 rounded w-3/4 mb-2 bg-skin-card"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-4 bg-skin-card"></div>
            <div className="space-y-2 flex-grow">
                <div className="h-4 bg-slate-200 rounded bg-skin-card"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6 bg-skin-card"></div>
            </div>
            <div className="mt-4">
                <div className="h-2 bg-slate-200 rounded-full bg-skin-card"></div>
            </div>
        </div>
    </div>
);


export default function ActivePage() {
  const projects = useProjectStore(state => state.projects);
  const setProjects = useProjectStore(state => state.setProjects);
  const [isLoading, setIsLoading] = useState(true);
  const [newProjectDraft, setNewProjectDraft] = useState<Project | null>(null);
  const [aiLoadingProjectId, setAiLoadingProjectId] = useState<string | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);
  const hasFocused     = useRef(false);          // 🚀 NEW
  const router = useRouter();

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
  }, [projects.length, fetchProjects]);

  useEffect(() => {
    if (newProjectDraft && !hasFocused.current) {
      titleInputRef.current?.focus();
      hasFocused.current = true;                 // one-time
    }
  }, [newProjectDraft]);

  const handleSaveNewProject = async () => {
    if (!newProjectDraft || !newProjectDraft.title.trim()) {
      toast.error('Project title cannot be empty.');
      return;
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newProjectDraft.title,
          description: newProjectDraft.description,
        }),
      });

      if (!res.ok) throw new Error('Failed to create project');

      toast.success('Project created!');
      setNewProjectDraft(null);
      // We get the newly created project from the API response
      const newProject = await res.json();
        
        // Ensure subtasks is an array, even if the API doesn't return it
        const projectWithSubtasks = { ...newProject, subtasks: newProject.subtasks || [] };
        
        // And add it directly to our state for a smooth update
        setProjects([projectWithSubtasks, ...projects]); 
    } catch {
      toast.error('Failed to create project.');
    }
  };

  const handleCancelNewProject = () => {
    setNewProjectDraft(null);
  };

  const markDone = async (id: string) => {
    const currentProjects = useProjectStore.getState().projects;
    setProjects(currentProjects.filter(p => p.id !== id));

    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDone: true }),
    });
    toast.success('Project marked as done!');
  };

  const archiveProject = async (id: string) => {
    const currentProjects = useProjectStore.getState().projects;
    setProjects(currentProjects.filter(p => p.id !== id));
    
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    toast.success('Project archived.');
  };

  const handleSubtaskGeneration = async (project: Project) => {
    setAiLoadingProjectId(project.id);
    toast.loading('Generating subtasks...', { id: 'ai-toast' });

    try {
        const res = await fetch(`/api/projects/${project.id}/suggest-subtasks`, {
            method: 'POST',
        });

        if (!res.ok) throw new Error('Failed to generate subtasks.');

        const { count } = await res.json();
        toast.success(`${count} subtasks added!`, { id: 'ai-toast' });

        // pull just this project and patch the store
        const pRes = await fetch(`/api/projects/${project.id}`);
        if (pRes.ok) {
          const updated = await pRes.json();
          useProjectStore.getState().updateProject(updated);
        } 
    } catch {
        toast.error('An error occurred.', { id: 'ai-toast' });
    } finally {
        setAiLoadingProjectId(null);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Focus Projects</h2>
        </div>
        <button
          onClick={() => {
            setNewProjectDraft({
              id: 'new-draft',
              title: '',
              description: '',
              isArchived: false,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              subtasks: [],
            });
          }}
          className="flex items-center gap-2 bg-sky-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-600 transition-colors shadow-sm"
        >
          <Plus size={20} />
          <span>New Project</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
            <>
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
            </>
        ) : (
          <AnimatePresence>
            {newProjectDraft && (
              <motion.div
                layout
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="'rounded-xl shadow-xl border border-sky-300/70 bg-sky-50/60 col-span-1 md:col-span-2 xl:col-span-3 dark:bg-zinc-800 dark:border-zinc-700'"
                transition={{ duration: 0.4, ease: "easeInOut" }}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={newProjectDraft.title}
                      onChange={(e) => setNewProjectDraft({ ...newProjectDraft, title: e.target.value })}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          descriptionInputRef.current?.focus();
                        }
                        if (e.key === 'Escape') handleCancelNewProject();
                      }}
                      className="text-lg font-bold text-skin-text flex-grow bg-transparent border-b-2 border-slate-300 focus:outline-none focus:border-sky-500 transition-colors"
                      placeholder="Start with an action verb, e.g., 'Launch new website'"
                    />
                    <button onClick={handleCancelNewProject} className="p-1 text-slate-400 hover:text-slate-700 transition-colors text-skin-text hover:text-skin-text" title="Cancel">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <textarea
                    ref={descriptionInputRef}
                    value={newProjectDraft.description ?? ''}
                    onChange={(e) => setNewProjectDraft({ ...newProjectDraft, description: e.target.value })}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSaveNewProject();
                      }
                    }}
                    rows={2}
                    className="w-full text-slate-500 text-sm bg-transparent border-b-2 border-slate-300 focus:outline-none focus:border-sky-500 resize-none mt-2 transition-colors text-skin-text"
                    placeholder="Add a description (optional)..."
                  ></textarea>
                  <div className="mt-4 flex justify-end space-x-2">
                    <button onClick={handleCancelNewProject} className="px-3 py-1 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 bg-skin-card text-skin-text border-skin-border hover:bg-skin-card">Cancel</button>
                    <button onClick={handleSaveNewProject} className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700">Create</button>
                  </div>
                </div>
              </motion.div>
            )}
            {projects.map((p) => {
              const doneCount = (p.subtasks || []).filter((s) => s.isCompleted).length;
              const totalCount = (p.subtasks || []).length;
              const isCompleted = totalCount > 0 && doneCount === totalCount;
              const subtasksToShow = [
                ...(p.subtasks || []).filter(s => !s.isCompleted),
                ...(p.subtasks || []).filter(s => s.isCompleted)
              ].slice(0, 3);

              return (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
                  key={p.id}
                  onClick={() => router.push(`/dashboard/project/${p.id}`)}
                  whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)' }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className={cn(
                    'cursor-pointer rounded-xl shadow-md border border-skin-border bg-skin-card flex flex-col',
                    isCompleted && 'bg-emerald-50/70 border-emerald-200',
                    isCompleted && 'dark:bg-emerald-900/50 dark:border-emerald-700'
                  )}
                >
                  <div className="p-6 flex-grow">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-bold mb-1 text-skin-text flex-grow">{p.title}</h3>
                      <div className='flex-shrink-0 flex items-center'>
                         <button 
                            onClick={(e) => { e.stopPropagation(); handleSubtaskGeneration(p); }}
                            disabled={aiLoadingProjectId === p.id}
                            className="p-1 text-slate-400 hover:text-sky-500 transition-colors disabled:text-slate-300 text-skin-text hover:text-skin-accent disabled:text-skin-text"
                            title="Auto-generate Subtasks"
                        >
                            <Sparkles className={cn("h-5 w-5", aiLoadingProjectId === p.id && "animate-spin")} />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); markDone(p.id); }} className="p-1 text-slate-400 hover:text-emerald-500 transition-colors text-skin-text hover:text-emerald-500" title="Mark as Done">
                            <CheckCircle2 className="h-5 w-5" />
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); archiveProject(p.id); }} className="p-1 text-slate-400 hover:text-red-500 transition-colors text-skin-text hover:text-red-500" title="Archive Project">
                            <Archive className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-500 text-sm mb-4 h-10 overflow-hidden text-skin-text">{p.description || 'No description.'}</p>
                    
                    {subtasksToShow.length > 0 && (
                        <div className="mt-4 space-y-2">
                            <ul className="space-y-1">
                                {subtasksToShow.map(subtask => (
                                    <li key={subtask.id} className="flex items-center gap-2 text-sm text-slate-600 text-skin-text">
                                        {subtask.isCompleted 
                                            ? <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0 dark:text-emerald-400" />
                                            : <Circle size={14} className="text-slate-400 text-skin-text" />
                                        }
                                        <span className={cn('truncate', subtask.isCompleted && 'line-through text-slate-400 text-skin-text')}>{subtask.text}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                  </div>
                    
                  {p.subtasks.length > 0 && (
                    <div className="mt-auto p-6 pt-4 border-t border-skin-border">
                      <div className="flex justify-between items-center text-sm text-slate-500 mb-2 text-skin-text">
                        <span>Progress</span>
                        <span>{doneCount} / {totalCount}</span>
                      </div>
                      <ProgressBar value={doneCount} max={totalCount} />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}