"use client";

import useSWR, { mutate } from 'swr';
import { useParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Skeleton } from '@/components/ui/Skeleton';
import { Plus, Sparkles } from 'lucide-react';
import React, { useState } from 'react';
// import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'; // Placeholder for dnd-kit

const fetcher = (url: string) => fetch(url).then(res => res.json());

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { data: project, isLoading } = useSWR(id ? `/api/projects/${id}` : null, fetcher);
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  React.useEffect(() => {
    if (project) {
      setTitle(project.title);
      setDescription(project.description || '');
    }
  }, [project]);

  if (isLoading || !project) {
    return <Skeleton className="h-96 w-full" />;
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => setDescription(e.target.value);
  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    // TODO: POST /api/subtasks { text: newSubtask, projectId: id }
    setNewSubtask('');
    mutate(`/api/projects/${id}`);
  };
  const handleToggleSubtask = async () => {
    // TODO: PUT /api/subtasks/[id] { isCompleted }
    mutate(`/api/projects/${id}`);
  };
  const handleSuggestSubtasks = async () => {
    setAiLoading(true);
    // TODO: POST /api/projects/[id]/suggest-subtasks
    await mutate(`/api/projects/${id}`);
    setAiLoading(false);
  };

  const subtasks = project.subtasks || [];
  const doneCount = subtasks.filter((s: unknown) => (s as { isCompleted: boolean }).isCompleted).length;
  const totalCount = subtasks.length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Card className="mb-6 p-8">
        <div className="flex items-center gap-4 mb-4">
          {editing ? (
            <Input value={title} onChange={handleTitleChange} className="text-2xl font-bold" />
          ) : (
            <h1 className="text-2xl font-bold flex-1">{project.title}</h1>
          )}
          <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
            {editing ? 'Save' : 'Edit'}
          </Button>
        </div>
        <div className="mb-4">
          {editing ? (
            <Input value={description} onChange={handleDescriptionChange} placeholder="Description" />
          ) : (
            <p className="text-secondary text-base">{project.description}</p>
          )}
        </div>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-c-text-secondary">Progress</span>
            <span className="text-xs text-c-text-secondary">{doneCount} / {totalCount}</span>
          </div>
          <ProgressBar value={doneCount} max={totalCount} />
        </div>
      </Card>
      <Card className="p-8 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Subtasks</h2>
          <Button
            variant="ghost"
            size="sm"
            icon={<Sparkles size={18} />}
            isLoading={aiLoading}
            onClick={handleSuggestSubtasks}
          >
            Suggest Subtasks
          </Button>
        </div>
        {/* TODO: dnd-kit drag-and-drop for subtasks */}
        <ul className="space-y-2 mb-4">
          {subtasks.length === 0 ? (
            <li className="text-secondary">No subtasks yet.</li>
          ) : (
            (subtasks as unknown[]).map((subtask) => (
              <li key={(subtask as { id: string }).id} className="flex items-center gap-2">
                <Checkbox
                  checked={(subtask as { isCompleted: boolean }).isCompleted}
                  onChange={() => handleToggleSubtask()}
                />
                <span className={(subtask as { isCompleted: boolean }).isCompleted ? 'line-through text-secondary' : ''}>{(subtask as { text: string }).text}</span>
              </li>
            ))
          )}
        </ul>
        <form onSubmit={handleAddSubtask} className="flex gap-2">
          <Input
            value={newSubtask}
            onChange={e => setNewSubtask(e.target.value)}
            placeholder="Add a new subtask..."
          />
          <Button type="submit" variant="primary" icon={<Plus size={18} />}>Add</Button>
        </form>
      </Card>
    </div>
  );
} 