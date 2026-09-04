import React, { useMemo, useState } from 'react';
import type { Category, ProjectTask, SortOption, StatusFilter } from '../types';
import { isOverdue, taskProgress } from '../utils';
import { TaskCard } from './TaskCard';

interface MyTasksPageProps {
  tasks: ProjectTask[];
  categories: Category[];
  onEditTask: (task: ProjectTask) => void;
  onDeleteTask: (id: string) => void;
  onToggleStatus: (id: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onToggleCompleted: (id: string) => void;
}

export const MyTasksPage: React.FC<MyTasksPageProps> = ({
  tasks,
  categories,
  onEditTask,
  onDeleteTask,
  onToggleStatus,
  onToggleSubtask,
  onToggleCompleted,
}) => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('deadline-asc');

  const categoryById = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);

  const filteredTasks = useMemo(() => {
    let result = tasks.filter(task => {
      if (search.trim() && !task.title.toLowerCase().includes(search.trim().toLowerCase())) {
        return false;
      }
      if (categoryFilter !== 'all' && task.categoryId !== categoryFilter) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      if (overdueOnly && !isOverdue(task)) return false;
      return true;
    });

    result = [...result].sort((a, b) => {
      switch (sortOption) {
        case 'deadline-asc':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline.localeCompare(b.deadline);
        case 'deadline-desc':
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return b.deadline.localeCompare(a.deadline);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'progress-desc':
          return taskProgress(b) - taskProgress(a);
        case 'created-desc':
          return b.createdAt.localeCompare(a.createdAt);
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, search, categoryFilter, statusFilter, overdueOnly, sortOption]);

  return (
    <div>
      <div className="bg-surface p-4 rounded-lg shadow-sm mb-6 flex flex-col lg:flex-row gap-3 lg:items-end">
        <div className="flex-1">
          <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All categories</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as StatusFilter)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Sort by</label>
          <select
            value={sortOption}
            onChange={e => setSortOption(e.target.value as SortOption)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="deadline-asc">Deadline (soonest)</option>
            <option value="deadline-desc">Deadline (latest)</option>
            <option value="title-asc">Title (A-Z)</option>
            <option value="progress-desc">Progress</option>
            <option value="created-desc">Recently created</option>
          </select>
        </div>

        <label className="flex items-center gap-1.5 text-sm text-gray-600 pb-2">
          <input
            type="checkbox"
            checked={overdueOnly}
            onChange={e => setOverdueOnly(e.target.checked)}
            className="h-4 w-4 text-primary rounded focus:ring-primary"
          />
          Overdue only
        </label>
      </div>

      {filteredTasks.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              category={task.categoryId ? categoryById.get(task.categoryId) : undefined}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
              onToggleStatus={() => onToggleStatus(task.id)}
              onToggleSubtask={subtaskId => onToggleSubtask(task.id, subtaskId)}
              onToggleCompleted={() => onToggleCompleted(task.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-16 border-2 border-dashed rounded-lg bg-surface">
          <p>No tasks match your filters.</p>
        </div>
      )}
    </div>
  );
};
