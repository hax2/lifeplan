'use client';
import { Project, DailyTask, WeeklyTask } from '@/lib/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { RotateCcw, Trash2 } from 'lucide-react';
import { useProjectStore } from '@/lib/store';
import { useWeeklyTasks } from '@/components/dashboard/WeeklyTasksWidget';

import useSWR from 'swr';

export default function ArchivePage() {
  const router = useRouter();

  const { data: archivedProjects = [], isLoading: isLoadingProjects, mutate: mutateProjects } = useSWR<Project[]>('/api/archive',
    url => fetch(url).then(r => r.json()).then(data => Array.isArray(data) ? data : []),
    { refreshInterval: 0 }         // no polling
  );

  const { data: archivedDailyTasks = [], isLoading: isLoadingDailyTasks, mutate: mutateDailyTasks } = useSWR<DailyTask[]>('/api/daily-tasks/archive',
    url => fetch(url).then(r => r.json()).then(data => Array.isArray(data) ? data : []),
    { refreshInterval: 0 }
  );

  const { data: archivedWeeklyTasks = [], isLoading: isLoadingWeeklyTasks, mutate: mutateWeeklyTasks } = useSWR<WeeklyTask[]>('/api/weekly-tasks?isArchived=true',
    url => fetch(url).then(r => r.json()).then(data => Array.isArray(data) ? data : []),
    { refreshInterval: 0 }
  );

  // Add SWR mutate for weekly tasks
  const { mutate: mutateWeeklySidebar } = useWeeklyTasks();

  const handleRestore = async (id: string, type: 'project' | 'daily' | 'weekly') => {
    let url = '';
    let mutateFn: (data?: unknown, shouldRevalidate?: boolean) => Promise<unknown>;
    let currentData: Project[] | DailyTask[] | WeeklyTask[] = [];

    switch (type) {
      case 'project':
        url = '/api/archive/restore';
        // @ts-expect-error - SWR mutate functions are compatible
        mutateFn = mutateProjects;
        currentData = archivedProjects;
        break;
      case 'daily':
        url = '/api/daily-tasks/restore';
        // @ts-expect-error - SWR mutate functions are compatible
        mutateFn = mutateDailyTasks;
        currentData = archivedDailyTasks;
        break;
      case 'weekly':
        url = '/api/weekly-tasks/restore';
        // @ts-expect-error - SWR mutate functions are compatible
        mutateFn = mutateWeeklyTasks;
        currentData = archivedWeeklyTasks;
        break;
      default:
        return;
    }

    const originalData = currentData;
    mutateFn(currentData.filter(item => item.id !== id), false); // Optimistic update

    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (res.ok) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} restored!`);
        if (type === 'project') {
          const restoredProject = await res.json();
          useProjectStore.getState().addProject(restoredProject);
        }
        if (type === 'weekly') {
          mutateWeeklySidebar(); // Refresh sidebar weekly tasks
        }
      } else {
        throw new Error('Failed to restore');
      }
    } catch {
      toast.error(`Failed to restore ${type}.`);
      mutateFn(originalData); // Revert optimistic update on failure
    }
  };

  const handleDelete = async (id: string, type: 'project' | 'daily' | 'weekly') => {
    if (!window.confirm("Are you sure? This will permanently delete this item.")) return;

    let url = '';
    let mutateFn: (data?: unknown, shouldRevalidate?: boolean) => Promise<unknown>;
    let currentData: Project[] | DailyTask[] | WeeklyTask[] = [];

    switch (type) {
      case 'project':
        url = '/api/archive/delete';
        // @ts-expect-error - SWR mutate functions are compatible
        mutateFn = mutateProjects;
        currentData = archivedProjects;
        break;
      case 'daily':
        url = '/api/daily-tasks/delete';
        // @ts-expect-error - SWR mutate functions are compatible
        mutateFn = mutateDailyTasks;
        currentData = archivedDailyTasks;
        break;
      case 'weekly':
        url = '/api/weekly-tasks/delete';
        // @ts-expect-error - SWR mutate functions are compatible
        mutateFn = mutateWeeklyTasks;
        currentData = archivedWeeklyTasks;
        break;
      default:
        return;
    }

    const originalData = currentData;
    mutateFn(currentData.filter(item => item.id !== id), false); // Optimistic update

    try {
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} permanently deleted.`);
      } else {
        throw new Error('Failed to delete');
      }
    } catch {
      toast.error(`Failed to delete ${type}.`);
      mutateFn(originalData); // Revert optimistic update on failure
    }
  };

  const isLoading = isLoadingProjects || isLoadingDailyTasks || isLoadingWeeklyTasks;

  if (isLoading) {
    return (
      <div className="text-center py-16 bg-skin-card rounded-xl border border-dashed border-skin-border">
        <h3 className="text-xl font-medium text-skin-text">Loading Archived Items...</h3>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-skin-text">Archive</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors shadow-sm bg-skin-card text-skin-text hover:bg-skin-card"
        >
          Back to Dashboard
        </button>
      </div>

      {/* Archived Projects */}
      <h2 className="text-2xl font-bold text-skin-text mb-4">Projects</h2>
      {archivedProjects.length === 0 ? (
        <div className="text-center py-8 mb-8 bg-skin-card rounded-xl border border-dashed border-skin-border">
            <h3 className="text-xl font-medium text-skin-text">No Archived Projects</h3>
            <p className="text-slate-500 mt-2 dark:text-slate-400">Projects you archive will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {archivedProjects.map(p => (
            <div key={p.id} onClick={() => router.push(`/dashboard/project/${p.id}`)} className="relative bg-skin-card p-6 rounded-xl shadow-sm border border-skin-border group cursor-pointer">
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">{p.title}</h3>
              <p className="text-slate-500 text-sm mt-1 h-10 overflow-hidden dark:text-slate-400">{p.description || 'No description.'}</p>
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleRestore(p.id, 'project'); }} title="Restore" className="p-2 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 transition-colors dark:bg-slate-700 dark:hover:bg-emerald-900 dark:text-slate-400 dark:hover:text-emerald-300">
                      <RotateCcw size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id, 'project'); }} title="Delete Permanently" className="p-2 rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 transition-colors dark:bg-slate-700 dark:hover:bg-red-900 dark:text-slate-400 dark:hover:text-red-300">
                      <Trash2 size={16} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archived Daily Tasks */}
      <h2 className="text-2xl font-bold text-skin-text mb-4">Daily Tasks</h2>
      {archivedDailyTasks.length === 0 ? (
        <div className="text-center py-8 mb-8 bg-skin-card rounded-xl border border-dashed border-skin-border">
            <h3 className="text-xl font-medium text-skin-text">No Archived Daily Tasks</h3>
            <p className="text-slate-500 mt-2 dark:text-slate-400">Daily tasks you archive will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {archivedDailyTasks.map(t => (
            <div key={t.id} className="relative bg-skin-card p-6 rounded-xl shadow-sm border border-skin-border group">
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">{t.title}</h3>
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleRestore(t.id, 'daily'); }} title="Restore" className="p-2 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 transition-colors dark:bg-slate-700 dark:hover:bg-emerald-900 dark:text-slate-400 dark:hover:text-emerald-300">
                      <RotateCcw size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id, 'daily'); }} title="Delete Permanently" className="p-2 rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 transition-colors dark:bg-slate-700 dark:hover:bg-red-900 dark:text-slate-400 dark:hover:text-red-300">
                      <Trash2 size={16} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Archived Weekly Tasks */}
      <h2 className="text-2xl font-bold text-skin-text mb-4">Weekly Tasks</h2>
      {archivedWeeklyTasks.length === 0 ? (
        <div className="text-center py-8 bg-skin-card rounded-xl border border-dashed border-skin-border">
            <h3 className="text-xl font-medium text-skin-text">No Archived Weekly Tasks</h3>
            <p className="text-slate-500 mt-2 dark:text-slate-400">Weekly tasks you archive will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {archivedWeeklyTasks.map(t => (
            <div key={t.id} className="relative bg-skin-card p-6 rounded-xl shadow-sm border border-skin-border group">
              <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">{t.title}</h3>
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleRestore(t.id, 'weekly'); }} title="Restore" className="p-2 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 transition-colors dark:bg-slate-700 dark:hover:bg-emerald-900 dark:text-slate-400 dark:hover:text-emerald-300">
                      <RotateCcw size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(t.id, 'weekly'); }} title="Delete Permanently" className="p-2 rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 transition-colors dark:bg-slate-700 dark:hover:bg-red-900 dark:text-slate-400 dark:hover:text-red-300">
                      <Trash2 size={16} />
                  </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
