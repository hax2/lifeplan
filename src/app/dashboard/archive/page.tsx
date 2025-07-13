'use client';

import { useEffect, useState } from 'react';
import { Project } from '@/lib/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { RotateCcw, Trash2 } from 'lucide-react';

export default function ArchivePage() {
  const [archived, setArchived] = useState<Project[]>([]);
  const router = useRouter();

  const fetchArchived = () => {
    fetch('/api/archive')
      .then(res => (res.ok ? res.json() : Promise.reject(res)))
      .then((data: Project[]) => setArchived(data))
      .catch(() => toast.error('Failed to load archived projects'));
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleRestore = async (id: string) => {
    const res = await fetch('/api/archive/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
    });
    if (res.ok) {
        toast.success("Project restored!");
        fetchArchived();
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
        fetchArchived();
    } else {
        toast.error("Failed to delete project.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Archived Projects</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors shadow-sm"
        >
          Back to Active Projects
        </button>
      </div>
      {archived.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed">
            <h3 className="text-xl font-medium text-slate-800">The Archive is Empty</h3>
            <p className="text-slate-500 mt-2">Projects you archive will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {archived.map(p => (
            <div key={p.id} className="relative bg-white p-6 rounded-xl shadow-sm border border-slate-200/80 group">
              <h3 className="text-lg font-bold text-slate-600">{p.title}</h3>
              <p className="text-slate-500 text-sm mt-1 h-10 overflow-hidden">{p.description || 'No description.'}</p>
              <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); handleRestore(p.id); }} title="Restore" className="p-2 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 transition-colors">
                      <RotateCcw size={16} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(p.id); }} title="Delete Permanently" className="p-2 rounded-full bg-slate-100 hover:bg-red-100 text-slate-500 hover:text-red-700 transition-colors">
                      <Trash2 size={16} />
                  </button>
              </div>
               <div
                onClick={() => router.push(`/dashboard/project/${p.id}`)}
                className="absolute inset-0 cursor-pointer"
                title="View Project Details"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
