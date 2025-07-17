export interface Task {
  id: number;
  title: string;
  checked: number;
}

export interface HistoryEntry {
  date: string;
  completedTasks: number;
  completedChunks: number;
}

export type StatsPeriod = 'day' | 'month' | '3-months' | '6-months' | 'year';

export interface BackupData {
  tasks: Task[];
  history: HistoryEntry[];
}
