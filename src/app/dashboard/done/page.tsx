// src/app/dashboard/done/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { Project } from '@/lib/types';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { RotateCcw } from 'lucide-react';

export default function DonePage() {
  const [done, setDone] = useState<Project[]>([]);
  const router = useRouter();

  const fetchDoneProjects = () => {
    fetch('/api/projects?done=true')
      .then(r => (r.ok ? r.json() : Promise.reject()))
      .then(setDone)
      .catch(() => toast.error('Failed to load done projects'));
  };

  useEffect(() => {
    fetchDoneProjects();
  }, []);

  const handleRestore = async (id: string) => {
    const res = await fetch(`/api/projects/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isDone: false, isArchived: false }),
    });
    if (res.ok) {
      toast.success("Project restored to active!");
      fetchDoneProjects();
    } else {
      toast.error("Failed to restore project.");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Done Projects</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors shadow-sm bg-skin-card text-skin-text hover:bg-skin-card"
        >
          Back to Active Projects
        </button>
      </div>
      <ul className="space-y-4">
        {done.map(p => (
          <li
            key={p.id}
            className="p-4 bg-skin-card rounded shadow cursor-pointer hover:bg-skin-card flex justify-between items-center text-skin-text"
          >
            <span onClick={() => router.push(`/dashboard/project/${p.id}`)} className="flex-grow">{p.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleRestore(p.id); }}
              className="p-2 rounded-full bg-skin-card hover:bg-emerald-100 text-skin-text hover:text-emerald-700"
              title="Restore to Active"
            >
              <RotateCcw size={16} />
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
