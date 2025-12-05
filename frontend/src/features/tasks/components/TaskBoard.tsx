import { useState } from 'react';
import { useTasksState } from '@/features/tasks/hooks/useTasksState';
import type { Task } from '@/shared/types';
import { TaskFilters } from './TaskFilters';
import { TaskForm } from './TaskForm';
import { TaskList } from './TaskList';

type FormState = { mode: 'closed' } | { mode: 'create' } | { mode: 'edit'; task: Task };

const todayIso = new Date().toISOString().slice(0, 10);

export function TaskBoard() {
  const {
    filteredTasks,
    tags,
    filters,
    setFilters,
    createTask,
    updateTask,
    deleteTask,
    toggleStatus,
    loading,
    error,
  } = useTasksState();

  const [formState, setFormState] = useState<FormState>({ mode: 'closed' });

  const handleCreate = () => {
    setFormState({ mode: 'create' });
  };

  const handleEdit = (task: Task) => {
    setFormState({ mode: 'edit', task });
  };

  const handleFormSubmit = async (payload: {
    title: string;
    description?: string;
    scheduledDate: string;
    dueDate?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    priority: any;
    tagIds: string[];
  }) => {
    if (formState.mode === 'create') {
      await createTask(payload);
    } else if (formState.mode === 'edit') {
      await updateTask(formState.task.id, payload);
    }

    setFormState({ mode: 'closed' });
  };

  const handleCancel = () => {
    setFormState({ mode: 'closed' });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-6 md:py-10">
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-50 md:text-3xl">
              Cascade — планувальник задач
            </h1>
            <p className="mt-1 max-w-xl text-sm text-slate-400">
              Інтерактивний прототип для лабораторних робіт: створення, редагування, фільтрація та
              зміна статусу задач на статичних даних.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCreate}
            data-testid="add-task"
            className="inline-flex items-center rounded-xl bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400"
          >
            + Нова задача
          </button>
        </header>

        <TaskFilters filters={filters} onChange={setFilters} availableTags={tags} />

        {formState.mode !== 'closed' && (
          <TaskForm
            mode={formState.mode}
            initialTask={formState.mode === 'edit' ? formState.task : undefined}
            availableTags={tags}
            defaultDate={filters.date ?? todayIso}
            onSubmit={handleFormSubmit}
            onCancel={handleCancel}
          />
        )}

        <section className="mt-2 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Задачі на вибраний період</span>
            <span>
              Всього: <span className="font-semibold text-slate-100">{filteredTasks.length}</span>
            </span>
          </div>

          {loading && <p className="text-xs text-slate-400">Завантаження задач...</p>}
          {error && <p className="text-xs text-rose-400">Помилка: {error}</p>}

          <TaskList
            tasks={filteredTasks}
            allTags={tags}
            onToggleStatus={toggleStatus}
            onEdit={handleEdit}
            onDelete={deleteTask}
          />
        </section>
      </main>
    </div>
  );
}
