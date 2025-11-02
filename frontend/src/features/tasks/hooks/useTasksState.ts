import { useEffect, useMemo, useState } from 'react';
import type { Task, Tag, TaskFilters, TaskStatus } from '@/shared/types';
import {
  fetchTasks,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
  type CreateTaskPayload,
} from '@/shared/api/tasksApi';
import { fetchTags } from '@/shared/api/tagsApi';

const todayIso = new Date().toISOString().slice(0, 10);

const defaultFilters: TaskFilters = {
  date: todayIso,
  status: 'all',
  tagId: 'all',
};

export function useTasksState() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [tasksData, tagsData] = await Promise.all([fetchTasks(), fetchTags()]);

      setTasks(tasksData);
      setTags(tagsData);
    } catch (e) {
      console.error(e);
      setError('Не вдалося завантажити задачі');
    } finally {
      setLoading(false);
    }
  };

  const filteredTasks = useMemo(() => {
    let data = tasks;

    if (filters.date) {
      data = data.filter(task => task.scheduledDate === filters.date);
    }

    if (filters.tagId !== 'all') {
      data = data.filter(task => task.tagIds.includes(filters.tagId));
    }

    if (filters.tagId !== 'all') {
      data = data.filter(task => task.tagIds.includes(filters.tagId));
    }

    return data;
  }, [tasks, filters]);

  const createTask = async (payload: Omit<CreateTaskPayload, 'status'>) => {
    try {
      setError(null);
      const created = await createTaskApi({
        ...payload,
        status: 'planned',
      });
      setTasks(prev => [created, ...prev]);
    } catch (e) {
      console.error(e);
      setError('Не вдалося створити задачу');
    }
  };

  const updateTask = async (id: string, patch: Partial<CreateTaskPayload>) => {
    try {
      setError(null);
      const updated = await updateTaskApi(id, patch);
      setTasks(prev => prev.map(t => (t.id === id ? updated : t)));
    } catch (e) {
      console.error(e);
      setError('Не вдалося оновити задачу');
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setError(null);
      await deleteTaskApi(id);
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (e) {
      console.error(e);
      setError('Не вдалося видалити задачу');
    }
  };

  const toggleStatus = async (task: Task) => {
    const order: TaskStatus[] = ['planned', 'in_progress', 'done'];
    const idx = order.indexOf(task.status);
    const nextStatus = idx === -1 ? 'planned' : order[(idx + 1) % order.length];

    await updateTask(task.id, { status: nextStatus });
  };

  return {
    tasks,
    filteredTasks,
    tags,
    filters,
    setFilters,
    loading,
    error,
    reload: loadInitialData,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
  };
}
