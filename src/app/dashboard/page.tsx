import useSWR from 'swr';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import React from 'react';
import { AnimatePresence, motion } from '@/components/dashboard/Motion';
import { Project } from '@/lib/types';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const ProjectCardSkeleton = () => (
  <Card className="min-h-[220px] animate-pulse">
    <div className="h-6 w-3/4 bg-c-border rounded mb-2" />
    <div className="h-4 w-1/2 bg-c-border rounded mb-4" />
    <div className="space-y-2 flex-grow">
      <div className="h-4 w-full bg-c-border rounded" />
      <div className="h-4 w-5/6 bg-c-border rounded" />
    </div>
    <div className="mt-4 h-2 w-full bg-c-border rounded-full" />
  </Card>
);

const EmptyState = ({ onClickNew }: { onClickNew: () => void }) => (
  <Card className="text-center py-16">
    <Plus className="mx-auto h-12 w-12 text-c-accent mb-4" />
    <h3 className="text-xl font-medium mb-2">No Active Projects</h3>
    <p className="text-secondary mb-6">Get started by creating a new project.</p>
    <Button onClick={onClickNew} variant="primary" size="lg" icon={<Plus size={20} />}>Create New Project</Button>
  </Card>
);

export default function DashboardPage() {
  const { data: projects = [], isLoading } = useSWR('/api/projects?done=false', fetcher);

  // Placeholder handlers for mark done/archive
  const handleMarkDone = () => {};
  const handleArchive = () => {};
  const handleNewProject = () => {};

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">Active Projects</h2>
        <Button onClick={handleNewProject} variant="primary" size="md" icon={<Plus size={20} />}>New Project</Button>
      </div>
      <motion.div layout className="grid gap-6 xl:grid-cols-3 sm:grid-cols-2 auto-rows-[1fr]">
        <AnimatePresence>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <motion.div key={i} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProjectCardSkeleton />
              </motion.div>
            ))
          ) : projects.length === 0 ? (
            <motion.div layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <EmptyState onClickNew={handleNewProject} />
            </motion.div>
          ) : (
            (projects as Project[]).map((project) => (
              <motion.div key={project.id} layout initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97 }}>
                <ProjectCard
                  project={project}
                  onMarkDone={handleMarkDone}
                  onArchive={handleArchive}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </motion.div>
      {/* TODO: New Project Dialog/modal goes here */}
    </div>
  );
} 