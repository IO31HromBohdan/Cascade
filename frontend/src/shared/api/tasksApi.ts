import type { Task, TaskPriority, TaskStatus } from '@/shared/types';
import { buildUrl, handleJsonOrThrow, ensureOkOrThrow } from './client';

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

export async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(buildUrl('/tasks'));
  return handleJsonOrThrow<Task[]>(res, 'Не вдалося завантажити задачі');
}

export async function createTaskApi(payload: CreateTaskPayload): Promise<Task> {
  const res = await fetch(buildUrl('/tasks'), {
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
  const res = await fetch(buildUrl(`/tasks/${id}`), {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  return handleJsonOrThrow<Task>(res, 'Не вдалося оновити задачу');
}

export async function deleteTaskApi(id: string): Promise<void> {
  const res = await fetch(buildUrl(`/tasks/${id}`), {
    method: 'DELETE',
  });

  await ensureOkOrThrow(res, 'Не вдалося видалити задачу');
}
