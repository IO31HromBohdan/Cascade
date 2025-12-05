import { type FormEvent, useState } from 'react';
import type { Task, TaskPriority, Tag } from '@/shared/types';

interface TaskFormProps {
  mode: 'create' | 'edit';
  initialTask?: Task;
  availableTags: Tag[];
  defaultDate: string;
  onSubmit: (payload: {
    title: string;
    description?: string;
    scheduledDate: string;
    dueDate?: string;
    priority: TaskPriority;
    tagIds: string[];
  }) => void;
  onCancel: () => void;
}

export function TaskForm({
  mode,
  initialTask,
  availableTags,
  defaultDate,
  onSubmit,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(initialTask?.title ?? '');
  const [description, setDescription] = useState(initialTask?.description ?? '');
  const [scheduledDate, setScheduledDate] = useState(initialTask?.scheduledDate ?? defaultDate);
  const [dueDate, setDueDate] = useState(initialTask?.dueDate ?? '');
  const [priority, setPriority] = useState<TaskPriority>(initialTask?.priority ?? 'medium');

  const [selectedTagKeys, setSelectedTagKeys] = useState<string[]>(initialTask?.tagIds ?? []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      scheduledDate,
      dueDate: dueDate || undefined,
      priority,
      tagIds: selectedTagKeys,
    });
  };

  const handleToggleTag = (tagKey: string) => {
    setSelectedTagKeys(prev =>
      prev.includes(tagKey) ? prev.filter(key => key !== tagKey) : [...prev, tagKey],
    );
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-slate-800 bg-slate-900/80 p-4 shadow-md backdrop-blur"
    >
      <h3 className="text-sm font-semibold text-slate-100">
        {mode === 'create' ? 'Нова задача' : 'Редагувати задачу'}
      </h3>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">Назва</label>
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          data-testid="task-title"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:ring-2"
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-300">Опис</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          data-testid="task-description"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:ring-2"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Дата в розкладі</label>
          <input
            type="date"
            value={scheduledDate}
            onChange={e => setScheduledDate(e.target.value)}
            required
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:ring-2"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Дедлайн (опційно)</label>
          <input
            type="date"
            value={dueDate}
            onChange={e => setDueDate(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:ring-2"
          />
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-300">Пріоритет</label>
          <select
            value={priority}
            onChange={e => setPriority(e.target.value as TaskPriority)}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:ring-2"
          >
            <option value="low">Низький</option>
            <option value="medium">Середній</option>
            <option value="high">Високий</option>
          </select>
        </div>

        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-300">Теги</div>

          {availableTags.length === 0 ? (
            <p className="text-xs text-slate-500">
              Теги ще не створені. Ви можете створювати задачі й без тегів.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const selected = selectedTagKeys.includes(tag.key);
                return (
                  <button
                    key={tag.id}
                    type="button"
                    onClick={() => handleToggleTag(tag.key)}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition
              ${
                selected
                  ? 'border border-sky-500 bg-sky-500/10 text-sky-300'
                  : 'border border-slate-700 bg-slate-950 text-slate-200 hover:border-slate-500'
              }`}
                  >
                    {tag.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="submit"
          data-testid="task-save"
          className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-sky-400"
        >
          {mode === 'create' ? 'Створити' : 'Зберегти'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-200 hover:border-slate-500"
        >
          Скасувати
        </button>
      </div>
    </form>
  );
}
