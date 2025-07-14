import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import { Plus, Archive } from 'lucide-react';
import { formatDateRelativeToNow } from '@/lib/utils';
import { Skeleton } from '@/components/ui/Skeleton';
import { AnimatePresence, motion } from '@/components/dashboard/Motion';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const WeeklyTasksWidget = () => {
  const { data: tasks = [], isLoading } = useSWR('/api/weekly-tasks?isArchived=false', fetcher);

  // Placeholder handlers
  const handleAdd = () => {};
  const handleToggle = () => {};
  const handleArchive = () => {};

  return (
    <Card>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-bold">Weekly Tasks</h3>
        <Button size="sm" variant="primary" icon={<Plus size={16} />} onClick={handleAdd}>
          Add
        </Button>
      </div>
      <ul className="mt-2 space-y-2">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <li key={i}><Skeleton className="h-6 w-full rounded" /></li>
          ))
        ) : tasks.length === 0 ? (
          <li className="text-secondary">No weekly tasks.</li>
        ) : (
          <AnimatePresence>
            {(tasks as unknown[]).map((task) => (
              <motion.li
                key={(task as { id: string }).id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex items-center gap-2"
              >
                <Checkbox checked={(task as { isCompleted: boolean }).isCompleted} onChange={() => handleToggle()} />
                <span className={(task as { isCompleted: boolean }).isCompleted ? 'line-through text-secondary' : ''}>{(task as { title: string }).title}</span>
                <span className="ml-auto text-xs text-secondary">{(task as { lastCompletedAt?: string }).lastCompletedAt ? formatDateRelativeToNow((task as { lastCompletedAt: string }).lastCompletedAt) : ''}</span>
                <Button size="sm" variant="ghost" icon={<Archive size={16} />} onClick={() => handleArchive()} />
              </motion.li>
            ))}
          </AnimatePresence>
        )}
      </ul>
    </Card>
  );
}; 