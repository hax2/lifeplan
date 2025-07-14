import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CheckCircle2, Archive, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Project } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  onMarkDone?: (id: string) => void;
  onArchive?: (id: string) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onMarkDone, onArchive }) => {
  const subtasks = project.subtasks || [];
  const doneCount = subtasks.filter((s) => s.isCompleted).length;
  const totalCount = subtasks.length;
  const uncompletedSubtasks = subtasks.filter((s) => !s.isCompleted).slice(0, 3);
  const remainingUncompletedCount = Math.max(0, subtasks.filter((s) => !s.isCompleted).length - uncompletedSubtasks.length);

  return (
    <Link href={`/dashboard/project/${project.id}`} className="block group">
      <Card className={cn(
        'relative flex flex-col min-h-[220px] transition-all duration-300 hover:shadow-lg',
        totalCount > 0 && doneCount === totalCount && 'bg-emerald-50/70 border-emerald-200 dark:bg-emerald-900/50 dark:border-emerald-700'
      )}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold pr-4 flex-1 truncate">{project.title}</h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              onClick={e => { e.preventDefault(); e.stopPropagation(); onMarkDone?.(project.id); }}
              variant="ghost"
              size="sm"
              icon={<CheckCircle2 size={18} />}
              title="Mark as Done"
            />
            <Button
              onClick={e => { e.preventDefault(); e.stopPropagation(); onArchive?.(project.id); }}
              variant="ghost"
              size="sm"
              icon={<Archive size={18} />}
              title="Archive Project"
            />
          </div>
        </div>
        <p className="text-secondary text-sm mb-4 h-10 overflow-hidden">{project.description || ''}</p>
        <div className="space-y-2 flex-grow">
          {uncompletedSubtasks.length > 0 ? (
            <ul className="space-y-1">
              {uncompletedSubtasks.map(subtask => (
                <li key={subtask.id} className="flex items-center gap-2 text-sm text-c-text-secondary">
                  <Circle size={14} className="text-c-border flex-shrink-0" />
                  <span className="truncate">{subtask.text}</span>
                </li>
              ))}
              {remainingUncompletedCount > 0 && (
                <li className="text-xs text-c-text-secondary pl-6">+ {remainingUncompletedCount} more</li>
              )}
            </ul>
          ) : totalCount > 0 ? (
            <div className="text-center text-sm text-emerald-500 py-2 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} />
              <span>All tasks complete!</span>
            </div>
          ) : (
            <div className="text-center text-sm text-c-text-secondary py-2 italic">
              Add subtasks to get started.
            </div>
          )}
        </div>
        {subtasks.length > 0 && (
          <div className="mt-auto pt-4">
            <div className="flex justify-between items-center text-xs text-c-text-secondary mb-1 font-medium">
              <span>Progress</span>
              <span>{doneCount} / {totalCount}</span>
            </div>
            <ProgressBar value={doneCount} max={totalCount} />
          </div>
        )}
      </Card>
    </Link>
  );
}; 