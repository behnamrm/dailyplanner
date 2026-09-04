import type { ProjectTask } from './types';

export const generateId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const formatClock = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

export const isOverdue = (task: ProjectTask): boolean => {
  if (!task.deadline || task.completed) return false;
  const deadline = new Date(task.deadline);
  deadline.setHours(23, 59, 59, 999);
  return deadline.getTime() < Date.now();
};

export const taskProgress = (task: ProjectTask): number => {
  if (task.subtasks.length === 0) return task.completed ? 100 : 0;
  const done = task.subtasks.filter(s => s.done).length;
  return Math.round((done / task.subtasks.length) * 100);
};

export const formatDeadline = (deadline: string | null): string => {
  if (!deadline) return 'No deadline';
  return new Date(deadline).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};
