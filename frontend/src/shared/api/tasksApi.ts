import type { Task, TaskPriority, TaskStatus } from '@/shared/types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

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

async function handleJsonOrThrow<T>(res: Response, fallbackMessage: string): Promise<T> {
  if (res.ok) {
    return res.json();
  }

  try {
    const body = await res.json();
    if (typeof body.message === 'string') {
      throw new Error(body.message);
    }
  } catch {
    /* empty */
  }

  throw new Error(fallbackMessage);
}

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(`${API_URL}/tasks`);
  return handleJsonOrThrow<Task[]>(res, 'Не вдалося завантажити задачі');
}

export async function createTaskApi(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonOrThrow<Task>(res, 'Не вдалося створити задачу');
}

export async function updateTaskApi(
  id: string,
  payload: Partial<CreateTaskPayload>,
): Promise<Task> {
  const res = await fetch(`${API_URL}/tasks/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleJsonOrThrow<Task>(res, 'Не вдалося оновити задачу');
}

export async function deleteTaskApi(id: string): Promise<void> {
  const res = await fetch(`${API_URL}/tasks/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    await handleJsonOrThrow<unknown>(res, 'Не вдалося видалити задачу');
  }
}
