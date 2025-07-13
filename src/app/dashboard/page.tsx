'use client';

import { useEffect, useState, useRef } from 'react';
import { Project } from '@/lib/types';
import { Plus, Archive, CheckCircle2, Circle, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';


export default function ActivePage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectDraft, setNewProjectDraft] = useState<Project | null>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects?done=false');
      if (!res.ok) throw new Error();
      const data: Project[] = await res.json();
      setProjects(data);
    } catch {
      toast.error('Failed to load projects');
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (newProjectDraft && titleInputRef.current) {
      titleInputRef.current.focus();
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
        body: JSON.stringify({ title: newProjectDraft.title, description: newProjectDraft.description }),
      });

      if (!res.ok) throw new Error('Failed to create project');

      const newProject: Project = await res.json();
      toast.success('Project created!');
      setNewProjectDraft(null);
      fetchProjects(); // Refresh the project list
      router.push(`/dashboard/project/${newProject.id}`); // Navigate to the new project
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project.');
    }
  };

  const handleCancelNewProject = () => {
    setNewProjectDraft(null);
  };

  const markDone = async (id: string) => {
    await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDone: true }),
    });
    toast.success('Marked done');
    fetchProjects();
  };

  const archive = async (id: string) => {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
    toast.success('Archived');
    fetchProjects();
  };

  const editField = async (
    id: string,
    field: 'title' | 'description',
    value: string
  ) => {
    try {
      await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: value }),
      });
      toast.success('Updated');
      fetchProjects();
    } catch {
      toast.error('Update failed');
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectTitle.trim()) {
      toast.error('Project title cannot be empty.');
      return;
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newProjectTitle, description: newProjectDescription }),
      });

      if (!res.ok) throw new Error('Failed to create project');

      const newProject: Project = await res.json();
      toast.success('Project created!');
      setShowNewProjectForm(false);
      setNewProjectTitle('');
      setNewProjectDescription('');
      fetchProjects(); // Refresh the project list
      router.push(`/dashboard/project/${newProject.id}`); // Navigate to the new project
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project.');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <p className="text-sm text-slate-500">{new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).format(new Date())}</p>
          <h2 className="text-3xl font-bold text-slate-900">Focus Projects</h2>
        </div>
        <button
            onClick={() => {
              setNewProjectDraft({
                id: 'new-draft',
                title: '',
                description: '',
                isArchived: false,
                isDone: false,
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
        {newProjectDraft && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="cursor-pointer rounded-xl shadow-sm border border-sky-300/80 bg-sky-50 hover:shadow-md hover:border-sky-400 transition-all duration-200"
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
                      handleSaveNewProject();
                    }
                  }}
                  className="text-lg font-bold text-slate-900 flex-grow bg-transparent border-b border-slate-300 focus:outline-none focus:border-sky-500"
                  placeholder="New Project Title"
                />
                <button
                  onClick={handleCancelNewProject}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                  title="Cancel"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <textarea
                value={newProjectDraft.description}
                onChange={(e) => setNewProjectDraft({ ...newProjectDraft, description: e.target.value })}
                rows={2}
                className="w-full text-slate-500 text-sm bg-transparent border-b border-slate-300 focus:outline-none focus:border-sky-500 resize-none"
                placeholder="Description (optional)"
              ></textarea>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={handleCancelNewProject}
                  className="px-3 py-1 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewProject}
                  className="px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700"
                >
                  Create
                </button>
              </div>
            </div>
          </motion.div>
        )}
        {projects.map(p => {
          const doneCount = p.subtasks.filter(s => s.isCompleted).length;
          const totalCount = p.subtasks.length;
          const isCompleted = totalCount > 0 && doneCount === totalCount;

          return (
            <motion.div
              key={p.id}
              onClick={() => router.push(`/dashboard/project/${p.id}`)}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className={cn(
                  'cursor-pointer rounded-xl shadow-sm border border-slate-200/80 bg-white hover:shadow-md hover:border-sky-300 transition-all duration-200',
                  isCompleted && 'bg-emerald-50/70 border-emerald-200'
              )}
            >
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-bold mb-1 text-slate-900 flex-grow">{p.title}</h3>
                  <button 
                    onClick={(e) => { e.stopPropagation(); markDone(p.id); }} 
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors" 
                    title="Mark as Done"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); archive(p.id); }} 
                    className="p-1 text-slate-400 hover:text-slate-700 transition-colors" 
                    title="Archive Project"
                  >
                    <Archive className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-slate-500 text-sm mb-4 h-10 overflow-hidden">{p.description || 'No description.'}</p>
                {p.subtasks.length > 0 && (
                  <div className="mt-4 space-y-1">
                    {p.subtasks.slice(0, 3).map(subtask => (
                      <div key={subtask.id} className="flex items-center text-sm text-slate-600">
                        {subtask.isCompleted ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mr-2 flex-shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                        )}
                        <span className={cn(subtask.isCompleted && 'line-through text-slate-400')}>{subtask.text}</span>
                      </div>
                    ))}
                    {p.subtasks.length > 3 && (
                      <p className="text-xs text-slate-500 mt-1">+{p.subtasks.length - 3} more subtasks</p>
                    )}
                  </div>
                )}
                <div className="flex justify-between items-center text-sm text-slate-500 mb-2">
                  <span>Progress</span>
                  <span>{doneCount} / {totalCount}</span>
                </div>
                <ProgressBar value={doneCount} max={totalCount} />
              </div>
            </motion.div>
          );
        })}
      </div>
      )}}
    </div>
  );
}
