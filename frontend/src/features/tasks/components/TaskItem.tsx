import type { Task, Tag } from '@/shared/types';

interface TaskItemProps {
  task: Task;
  allTags: Tag[];
  onToggleStatus: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

function getStatusLabel(status: Task['status']): string {
  switch (status) {
    case 'planned':
      return 'Заплановано';
    case 'in_progress':
      return 'У процесі';
    case 'done':
      return 'Виконано';
    default:
      return status;
  }
}

function getStatusBadgeClasses(status: Task['status']): string {
  if (status === 'planned') {
    return 'bg-slate-800 text-slate-200';
  }
  if (status === 'in_progress') {
    return 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40';
  }
  return 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40';
}

export function TaskItem({ task, allTags, onToggleStatus, onEdit, onDelete }: TaskItemProps) {
  const tags = allTags.filter(tag => task.tagIds.includes(tag.key));
  const isOverdue =
    task.dueDate &&
    task.status !== 'done' &&
    new Date(task.dueDate) < new Date(new Date().toISOString().slice(0, 10));

  return (
    <li
      className={`rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4 shadow-sm backdrop-blur transition hover:border-slate-600 ${
        task.status === 'done' ? 'opacity-80' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onToggleStatus}
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition ${getStatusBadgeClasses(
                task.status,
              )}`}
            >
              {getStatusLabel(task.status)}
            </button>
            <span className="text-sm font-semibold text-slate-50">{task.title}</span>
          </div>
          {task.description && <p className="text-xs text-slate-300">{task.description}</p>}
        </div>

        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center rounded-lg border border-slate-700 px-2 py-1 text-xs font-medium text-slate-200 hover:border-slate-500"
          >
            Редагувати
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="inline-flex items-center rounded-lg border border-rose-700/60 px-2 py-1 text-xs font-medium text-rose-300 hover:border-rose-500 hover:text-rose-200"
          >
            Видалити
          </button>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
        <span>Дата: {task.scheduledDate}</span>
        {task.dueDate && (
          <span className={isOverdue ? 'font-semibold text-rose-400' : 'text-slate-400'}>
            Дедлайн: {task.dueDate}
          </span>
        )}
        <span>Пріоритет: {task.priority}</span>
      </div>

      {tags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map(tag => (
            <span
              key={tag.id}
              className="rounded-full bg-slate-800/80 px-2.5 py-0.5 text-[11px] font-medium text-slate-200"
              style={tag.color ? { backgroundColor: `${tag.color}33` } : undefined}
            >
              {tag.name}
            </span>
          ))}
        </div>
      )}
    </li>
  );
}
