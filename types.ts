
export interface Task {
  id: string;
  name: string;
}

export interface DailyProgress {
  [date: string]: { // YYYY-MM-DD
    [taskId: string]: number; // 0-5 completions
  };
}

export type View = 'daily' | 'stats';

export type StatRange = '1M' | '3M' | '6M' | '1Y';
