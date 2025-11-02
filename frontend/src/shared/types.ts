export type TaskStatus = 'planned' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Tag {
  id: string;
  key: string;
  name: string;
  color?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  scheduledDate: string; // ISO date (YYYY-MM-DD)
  dueDate?: string; // ISO date
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  date: string | null;
  status: TaskStatus | 'all';
  tagId: string | 'all';
}
