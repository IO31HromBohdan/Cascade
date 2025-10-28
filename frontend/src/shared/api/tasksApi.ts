import type { Task, TaskPriority, TaskStatus } from '@/shared/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`);
  if (!res.ok) {
    throw new Error('Не вдалося завантажити задачі');
  }
  return res.json();
}

export interface CreateTaskPayload {
  title: string;
  description?: string;
  scheduledDate: string;
  dueDate?: string;
  priority: TaskPriority;
  status?: TaskStatus;
  tagIds: string[];
}

export type UpdateTaskPayload = Partial<CreateTaskPayload>;

export async function createTaskApi(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Не вдалося створити задачу');
  }

  return res.json();
}

export async function updateTaskApi(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error('Не вдалося оновити задачу');
  }

  return res.json();
}

export async function deleteTaskApi(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    throw new Error('Не вдалося видалити задачу');
  }
}
