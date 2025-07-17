import React from 'react';
import type { Task } from '../types';
import { CHUNKS_PER_TASK } from '../constants';
import { TrashIcon } from './icons/TrashIcon';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, checked: number) => void;
  onDelete: (id: number) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const handleCheckChange = (index: number) => {
    const isCurrentlyChecked = index < task.checked;
    // If clicking a checked box, the new count is the index of that box (clearing it and subsequent ones).
    // If clicking an unchecked box, the new count is its index + 1 (filling up to and including it).
    // This enforces a sequential "progress bar" behavior.
    const newCheckedCount = isCurrentlyChecked ? index : index + 1;
    onUpdate(task.id, newCheckedCount);
  };

  const isCompleted = task.checked === CHUNKS_PER_TASK;
  const checkedStateForRender = Array(CHUNKS_PER_TASK).fill(false).map((_, i) => i < task.checked);

  return (
    <div className={`p-4 rounded-lg transition-all duration-300 flex items-center gap-4 ${isCompleted ? 'bg-green-100' : 'bg-white shadow-sm'}`}>
      <div className="flex-grow">
        <p className={`font-medium text-lg ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
          {task.title}
        </p>
        <div className="flex items-center gap-2 mt-2">
          {checkedStateForRender.map((isChecked, index) => (
            <input
              key={index}
              type="checkbox"
              checked={isChecked}
              onChange={() => handleCheckChange(index)}
              className="h-6 w-6 rounded-md border-gray-300 text-primary focus:ring-primary transition-transform duration-200 ease-in-out transform hover:scale-110"
              aria-label={`Task chunk ${index + 1}`}
            />
          ))}
        </div>
      </div>
      <button 
        onClick={() => onDelete(task.id)}
        className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-100"
        aria-label={`Delete task ${task.title}`}
      >
        <TrashIcon />
      </button>
    </div>
  );
};