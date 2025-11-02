import type { TaskFilters, TaskStatus, Tag } from '@/shared/types';

const statusOptions: { value: TaskStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'planned', label: 'Заплановано' },
  { value: 'in_progress', label: 'У процесі' },
  { value: 'done', label: 'Виконано' },
];

interface TaskFiltersProps {
  filters: TaskFilters;
  onChange: (next: TaskFilters) => void;
  availableTags: Tag[];
}

export function TaskFilters({ filters, onChange, availableTags }: TaskFiltersProps) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-sm backdrop-blur">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-400">Фільтри</h2>
      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
          <span>Дата</span>
          <input
            type="date"
            value={filters.date ?? ''}
            onChange={e =>
              onChange({
                ...filters,
                date: e.target.value || null,
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none ring-sky-500/40 focus:ring-2"
          />
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
          <span>Статус</span>
          <select
            value={filters.status}
            onChange={e =>
              onChange({
                ...filters,
                status: e.target.value as TaskStatus | 'all',
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none ring-sky-500/40 focus:ring-2"
          >
            {statusOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-xs font-medium text-slate-300">
          <span>Тег</span>
          <select
            value={filters.tagId}
            onChange={e =>
              onChange({
                ...filters,
                tagId: e.target.value,
              })
            }
            className="rounded-lg border border-slate-700 bg-slate-900 px-2 py-1 text-sm text-slate-100 outline-none ring-sky-500/40 focus:ring-2"
          >
            <option value="all">Усі</option>
            {availableTags.map(tag => (
              <option key={tag.id} value={tag.key}>
                {tag.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
