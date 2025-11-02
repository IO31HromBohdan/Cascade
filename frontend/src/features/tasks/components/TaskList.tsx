import type { Task, Tag } from '@/shared/types';
import { TaskItem } from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  allTags: Tag[];
  onToggleStatus: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export function TaskList({ tasks, allTags, onToggleStatus, onEdit, onDelete }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/70 px-4 py-6 text-center text-sm text-slate-400">
        Немає задач для відображення за вибраними фільтрами.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          allTags={allTags}
          onToggleStatus={() => onToggleStatus(task)}
          onEdit={() => onEdit(task)}
          onDelete={() => onDelete(task.id)}
        />
      ))}
    </ul>
  );
}
