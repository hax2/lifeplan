export type Subtask = {
  id: string;
  text: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Project = {
  id: string;
  title: string;
  description: string | null;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
  subtasks: Subtask[];
};

export type DailyTask = {
    id: string; // Template ID
    title:string;
    createdAt: string;
    isCompleted: boolean; // Dynamic status for today
}

export type WeeklyTask = {
  id: string;
  title: string;
  createdAt: string;
  lastCompletedAt: string | null;
};

export type WeeklyTaskCompletion = {
  id: string;
  weeklyTaskId: string;
  completedAt: string;
};