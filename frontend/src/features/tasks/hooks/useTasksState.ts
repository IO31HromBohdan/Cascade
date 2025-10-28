import { useEffect, useMemo, useState } from 'react';
import type { Task, TaskFilters, TaskPriority, TaskStatus, Tag } from '@/shared/types';
import { createTaskApi, deleteTaskApi, fetchTasks, updateTaskApi } from '@/shared/api/tasksApi';

const todayIso = new Date().toISOString().slice(0, 10);

const initialTags: Tag[] = [
  { id: 'study', name: 'Університет', color: '#2563eb' },
  { id: 'work', name: 'Робота', color: '#16a34a' },
  { id: 'personal', name: 'Особисте', color: '#f97316' },
];

const defaultFilters: TaskFilters = {
  date: todayIso,
  status: 'all',
  tagId: 'all',
};

export interface UseTasksStateResult {
  tasks: Task[];
  filteredTasks: Task[];
  tags: Tag[];
  filters: TaskFilters;
  loading: boolean;
  error: string | null;
  setFilters: (next: TaskFilters) => void;
  refresh: () => Promise<void>;
  createTask: (payload: {
    title: string;
    description?: string;
    scheduledDate: string;
    dueDate?: string;
    priority: TaskPriority;
    tagIds: string[];
  }) => Promise<void>;
  updateTask: (
    id: string,
    patch: Partial<
      Pick<
        Task,
        'title' | 'description' | 'scheduledDate' | 'dueDate' | 'priority' | 'tagIds' | 'status'
      >
    >,
  ) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleStatus: (id: string) => Promise<void>;
}

function getNextStatus(status: TaskStatus): TaskStatus {
  if (status === 'planned') return 'in_progress';
  if (status === 'in_progress') return 'done';
  return 'planned';
}

export function useTasksState(): UseTasksStateResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [tags] = useState<Tag[]>(initialTags);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTasks();
      setTasks(data);
    } catch (e) {
      console.error(e);
      setError('Не вдалося завантажити задачі');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadTasks();
  }, []);

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      if (filters.date && task.scheduledDate !== filters.date) {
        return false;
      }
      if (filters.status !== 'all' && task.status !== filters.status) {
        return false;
      }
      if (filters.tagId !== 'all' && !task.tagIds.includes(filters.tagId)) {
        return false;
      }
      return true;
    });
  }, [tasks, filters]);

  const createTask: UseTasksStateResult['createTask'] = async payload => {
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

  const updateTask: UseTasksStateResult['updateTask'] = async (id, patch) => {
    try {
      setError(null);
      const updated = await updateTaskApi(id, patch);
      setTasks(prev => prev.map(task => (task.id === id ? updated : task)));
    } catch (e) {
      console.error(e);
      setError('Не вдалося оновити задачу');
    }
  };

  const deleteTask: UseTasksStateResult['deleteTask'] = async id => {
    try {
      setError(null);
      await deleteTaskApi(id);
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (e) {
      console.error(e);
      setError('Не вдалося видалити задачу');
    }
  };

  const toggleStatus: UseTasksStateResult['toggleStatus'] = async id => {
    const current = tasks.find(t => t.id === id);
    if (!current) return;

    const nextStatus = getNextStatus(current.status);

    await updateTask(id, { status: nextStatus });
  };

  return {
    tasks,
    filteredTasks,
    tags,
    filters,
    loading,
    error,
    setFilters,
    refresh: loadTasks,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
  };
}
