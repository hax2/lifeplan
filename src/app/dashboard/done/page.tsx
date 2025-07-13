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
        <h1 className="text-3xl font-bold text-slate-900">Done Projects</h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 bg-slate-200 text-slate-700 font-semibold px-4 py-2 rounded-lg hover:bg-slate-300 transition-colors shadow-sm"
        >
          Back to Active Projects
        </button>
      </div>
      <ul className="space-y-4">
        {done.map(p => (
          <li
            key={p.id}
            className="p-4 bg-white rounded shadow cursor-pointer hover:bg-gray-50 flex justify-between items-center"
          >
            <span onClick={() => router.push(`/dashboard/project/${p.id}`)} className="flex-grow">{p.title}</span>
            <button
              onClick={(e) => { e.stopPropagation(); handleRestore(p.id); }}
              className="p-2 rounded-full bg-slate-100 hover:bg-emerald-100 text-slate-500 hover:text-emerald-700 transition-colors"
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
