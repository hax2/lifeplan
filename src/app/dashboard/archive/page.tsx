import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Archive, Trash2, RotateCcw } from 'lucide-react';
import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnimatePresence, motion } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const TABS = [
  { key: 'projects', label: 'Projects' },
  { key: 'daily', label: 'Daily Tasks' },
  { key: 'weekly', label: 'Weekly Tasks' },
];

export default function ArchivePage() {
  const [tab, setTab] = useState('projects');
  const [confirmDelete, setConfirmDelete] = useState<{ type: string; id: string } | null>(null);

  const { data: archivedProjects = [], isLoading: loadingProjects } = useSWR('/api/archive', fetcher);
  const { data: archivedDaily = [], isLoading: loadingDaily } = useSWR('/api/daily-tasks/archive', fetcher);
  const { data: archivedWeekly = [], isLoading: loadingWeekly } = useSWR('/api/weekly-tasks?isArchived=true', fetcher);

  // Placeholder handlers
  const handleRestore = () => {};
  const handleDelete = () => setConfirmDelete({ type: '', id: '' });
  const handleConfirmDelete = () => {
    if (confirmDelete) {
      // TODO: API call to delete
      setConfirmDelete(null);
    }
  };

  const renderList = (items: unknown[], type: string, loading: boolean) => (
    <Card className="mt-4">
      {loading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="py-4"><Skeleton className="h-6 w-full rounded" /></div>
        ))
      ) : items.length === 0 ? (
        <div className="text-center py-8 text-secondary">No archived {type}.</div>
      ) : (
        <ul className="divide-y divide-c-border">
          <AnimatePresence>
            {items.map((item) => {
              const castItem = item as { id: string; title?: string; text?: string; description?: string };
              return (
                <motion.li
                  key={castItem.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between py-4"
                >
                  <div>
                    <div className="font-medium">{castItem.title || castItem.text}</div>
                    {castItem.description && <div className="text-secondary text-sm">{castItem.description}</div>}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<RotateCcw size={16} />}
                      onClick={() => handleRestore()}
                      aria-label={`Restore ${castItem.title || castItem.text}`}
                    >
                      Restore
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<Trash2 size={16} />}
                      onClick={() => handleDelete()}
                      aria-label={`Delete ${castItem.title || castItem.text}`}
                    >
                      Delete
                    </Button>
                  </div>
                </motion.li>
              );
            })}
          </AnimatePresence>
        </ul>
      )}
    </Card>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Archive size={28} /> Archive
      </h1>
      <div className="flex gap-2 mb-4">
        {TABS.map(t => (
          <Button
            key={t.key}
            variant={tab === t.key ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </Button>
        ))}
      </div>
      {tab === 'projects' && renderList(archivedProjects, 'projects', loadingProjects)}
      {tab === 'daily' && renderList(archivedDaily, 'daily tasks', loadingDaily)}
      {tab === 'weekly' && renderList(archivedWeekly, 'weekly tasks', loadingWeekly)}

      <Dialog
        open={!!confirmDelete}
        onOpenChange={open => !open && setConfirmDelete(null)}
        title="Delete Permanently?"
        description="This action cannot be undone. Are you sure you want to permanently delete this item?"
      >
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
} 