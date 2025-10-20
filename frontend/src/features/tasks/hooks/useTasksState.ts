import { useMemo, useState } from 'react';
import type { Task, TaskFilters, TaskPriority, TaskStatus, Tag } from '@/shared/types';

const todayIso = new Date().toISOString().slice(0, 10);

const initialTags: Tag[] = [
  { id: 'study', name: 'Університет', color: '#2563eb' },
  { id: 'work', name: 'Робота', color: '#16a34a' },
  { id: 'personal', name: 'Особисте', color: '#f97316' },
];

const initialTasks: Task[] = [
  {
    id: '1',
    title: 'Підготувати конспект по дисципліні',
    description: 'Закінчити конспект до завтрашньої пари',
    status: 'planned',
    priority: 'high',
    scheduledDate: todayIso,
    dueDate: todayIso,
    tagIds: ['study'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    title: "Зробити рев'ю коду",
    description: 'Перевірити pull request у робочому проєкті',
    status: 'in_progress',
    priority: 'medium',
    scheduledDate: todayIso,
    dueDate: undefined,
    tagIds: ['work'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Прогулянка ввечері',
    description: 'Вийти на 30 хвилин на свіже повітря',
    status: 'planned',
    priority: 'low',
    scheduledDate: todayIso,
    dueDate: undefined,
    tagIds: ['personal'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
  setFilters: (next: TaskFilters) => void;
  createTask: (payload: {
    title: string;
    description?: string;
    scheduledDate: string;
    dueDate?: string;
    priority: TaskPriority;
    tagIds: string[];
  }) => void;
  updateTask: (
    id: string,
    patch: Partial<
      Pick<Task, 'title' | 'description' | 'scheduledDate' | 'dueDate' | 'priority' | 'tagIds'>
    >,
  ) => void;
  deleteTask: (id: string) => void;
  toggleStatus: (id: string) => void;
}

function getNextStatus(status: TaskStatus): TaskStatus {
  if (status === 'planned') return 'in_progress';
  if (status === 'in_progress') return 'done';
  return 'planned';
}

export function useTasksState(): UseTasksStateResult {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [tags] = useState<Tag[]>(initialTags);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);

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

  const createTask: UseTasksStateResult['createTask'] = payload => {
    const nowIso = new Date().toISOString();
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: payload.title,
      description: payload.description,
      status: 'planned',
      priority: payload.priority,
      scheduledDate: payload.scheduledDate,
      dueDate: payload.dueDate,
      tagIds: payload.tagIds,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask: UseTasksStateResult['updateTask'] = (id, patch) => {
    const nowIso = new Date().toISOString();
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              ...patch,
              updatedAt: nowIso,
            }
          : task,
      ),
    );
  };

  const deleteTask: UseTasksStateResult['deleteTask'] = id => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const toggleStatus: UseTasksStateResult['toggleStatus'] = id => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id
          ? {
              ...task,
              status: getNextStatus(task.status),
              updatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
  };

  return {
    tasks,
    filteredTasks,
    tags,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
  };
}
