import type { Category, PomodoroSettings } from './types';

export const STORAGE_KEYS = {
  tasks: 'dp_tasks',
  categories: 'dp_categories',
  pomodoroSessions: 'dp_pomodoro_sessions',
  settings: 'dp_settings',
};

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: 'Work', color: '#4f46e5' },
  { id: 'personal', name: 'Personal', color: '#10b981' },
  { id: 'study', name: 'Study', color: '#f59e0b' },
  { id: 'health', name: 'Health', color: '#ef4444' },
];

export const CATEGORY_COLOR_OPTIONS = [
  '#4f46e5', '#10b981', '#f59e0b', '#ef4444',
  '#0ea5e9', '#8b5cf6', '#ec4899', '#64748b',
];

export const DEFAULT_POMODORO_SETTINGS: PomodoroSettings = {
  focusMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  sessionsBeforeLongBreak: 4,
};
