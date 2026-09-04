export type TaskStatus = 'draft' | 'published';

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  pomodorosSpent: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface ProjectTask {
  id: string;
  title: string;
  deadline: string | null;
  categoryId: string | null;
  subtasks: Subtask[];
  status: TaskStatus;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PomodoroSession {
  id: string;
  taskId: string;
  subtaskId: string;
  startedAt: string;
  durationMinutes: number;
}

export interface PomodoroSettings {
  focusMinutes: number;
  shortBreakMinutes: number;
  longBreakMinutes: number;
  sessionsBeforeLongBreak: number;
}

export type SortOption = 'deadline-asc' | 'deadline-desc' | 'title-asc' | 'progress-desc' | 'created-desc';
export type StatusFilter = 'all' | 'draft' | 'published';

export interface BackupData {
  version: number;
  exportedAt: string;
  tasks: ProjectTask[];
  categories: Category[];
  pomodoroSessions: PomodoroSession[];
  settings: PomodoroSettings;
}
