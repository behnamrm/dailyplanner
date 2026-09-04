import React, { useState } from 'react';
import type { Category, ProjectTask } from '../types';
import { formatDeadline, isOverdue, taskProgress } from '../utils';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface TaskCardProps {
  task: ProjectTask;
  category: Category | undefined;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
  onToggleSubtask: (subtaskId: string) => void;
  onToggleCompleted: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  category,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleSubtask,
  onToggleCompleted,
}) => {
  const [expanded, setExpanded] = useState(false);
  const progress = taskProgress(task);
  const overdue = isOverdue(task);
  const hasSubtasks = task.subtasks.length > 0;

  return (
    <div className="bg-surface border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="font-semibold text-on-surface truncate">{task.title}</h3>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                task.status === 'published'
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {task.status === 'published' ? 'Published' : 'Draft'}
            </span>
            {overdue && (
              <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                Overdue
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap text-sm text-gray-500">
            {category && (
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </span>
            )}
            <span className={overdue ? 'text-red-600 font-medium' : ''}>
              {formatDeadline(task.deadline)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-400 hover:text-primary rounded-md hover:bg-gray-50"
            aria-label="Edit task"
          >
            <PencilIcon />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-gray-50"
            aria-label="Delete task"
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-secondary transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <button
          onClick={onToggleStatus}
          className="text-sm text-primary hover:text-primary-dark font-medium"
        >
          {task.status === 'published' ? 'Move to Draft' : 'Publish'}
        </button>

        {hasSubtasks ? (
          <button
            onClick={() => setExpanded(prev => !prev)}
            className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800"
          >
            {task.subtasks.filter(s => s.done).length}/{task.subtasks.length} subtasks
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`} />
          </button>
        ) : (
          <label className="flex items-center gap-1.5 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={onToggleCompleted}
              className="h-4 w-4 text-primary rounded focus:ring-primary"
            />
            Mark complete
          </label>
        )}
      </div>

      {expanded && hasSubtasks && (
        <ul className="mt-3 pt-3 border-t border-gray-100 space-y-1.5">
          {task.subtasks.map(subtask => (
            <li key={subtask.id} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={subtask.done}
                onChange={() => onToggleSubtask(subtask.id)}
                className="h-4 w-4 text-primary rounded focus:ring-primary"
              />
              <span className={subtask.done ? 'line-through text-gray-400' : 'text-gray-700'}>
                {subtask.title}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
