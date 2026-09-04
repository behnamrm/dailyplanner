import React, { useMemo, useState } from 'react';
import type { PomodoroSettings, ProjectTask } from '../types';
import { usePomodoroTimer, type TimerMode } from '../hooks/usePomodoroTimer';
import { formatClock } from '../utils';
import { PlayIcon } from './icons/PlayIcon';
import { PauseIcon } from './icons/PauseIcon';
import { ResetIcon } from './icons/ResetIcon';

interface FocusPageProps {
  tasks: ProjectTask[];
  settings: PomodoroSettings;
  onFocusSessionComplete: (taskId: string, subtaskId: string) => void;
}

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Focus',
  'short-break': 'Short Break',
  'long-break': 'Long Break',
};

export const FocusPage: React.FC<FocusPageProps> = ({ tasks, settings, onFocusSessionComplete }) => {
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [selectedSubtaskId, setSelectedSubtaskId] = useState<string>('');

  const focusableTasks = useMemo(
    () => tasks.filter(t => t.status === 'published' && t.subtasks.some(s => !s.done)),
    [tasks]
  );

  const selectedTask = focusableTasks.find(t => t.id === selectedTaskId);
  const availableSubtasks = selectedTask ? selectedTask.subtasks.filter(s => !s.done) : [];
  const selectedSubtask = availableSubtasks.find(s => s.id === selectedSubtaskId);

  const handleFocusComplete = () => {
    if (selectedTaskId && selectedSubtaskId) {
      onFocusSessionComplete(selectedTaskId, selectedSubtaskId);
    }
  };

  const timer = usePomodoroTimer({ settings, onFocusComplete: handleFocusComplete });

  const canStart = timer.mode !== 'focus' || (selectedTaskId !== '' && selectedSubtaskId !== '');
  const progressRatio = 1 - timer.secondsLeft / timer.totalSeconds;

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-surface p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-1">Focus Mode</h2>
        <p className="text-sm text-gray-500 mb-6">Pick a subtask, then start the Pomodoro timer.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
            <select
              value={selectedTaskId}
              onChange={e => {
                setSelectedTaskId(e.target.value);
                setSelectedSubtaskId('');
              }}
              disabled={timer.isRunning}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            >
              <option value="">Select a task</option>
              {focusableTasks.map(t => (
                <option key={t.id} value={t.id}>{t.title}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtask</label>
            <select
              value={selectedSubtaskId}
              onChange={e => setSelectedSubtaskId(e.target.value)}
              disabled={!selectedTask || timer.isRunning}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
            >
              <option value="">Select a subtask</option>
              {availableSubtasks.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
          </div>
        </div>

        {focusableTasks.length === 0 && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mb-6">
            No published tasks with open subtasks yet. Publish a task with subtasks to start focusing.
          </p>
        )}

        <div className="flex justify-center gap-2 mb-4">
          {(['focus', 'short-break', 'long-break'] as TimerMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => timer.switchMode(mode)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                timer.mode === mode
                  ? 'bg-primary text-on-primary'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {MODE_LABELS[mode]}
            </button>
          ))}
        </div>

        <div className="flex flex-col items-center py-6">
          <div className="relative h-56 w-56">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#4f46e5"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progressRatio)}
                className="transition-all duration-300"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold tabular-nums">{formatClock(timer.secondsLeft)}</span>
              <span className="text-sm text-gray-500 mt-1">{MODE_LABELS[timer.mode]}</span>
              {selectedSubtask && (
                <span className="text-xs text-gray-400 mt-2 px-4 text-center truncate max-w-[10rem]">
                  {selectedSubtask.title}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 mt-6">
            <button
              onClick={timer.reset}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              aria-label="Reset timer"
            >
              <ResetIcon />
            </button>
            <button
              onClick={timer.isRunning ? timer.pause : timer.start}
              disabled={!canStart}
              className="p-4 rounded-full bg-primary text-on-primary hover:bg-primary-dark disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label={timer.isRunning ? 'Pause timer' : 'Start timer'}
            >
              {timer.isRunning ? <PauseIcon /> : <PlayIcon />}
            </button>
            <button
              onClick={timer.skip}
              className="p-3 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
              aria-label="Skip to next phase"
            >
              Skip
            </button>
          </div>

          <p className="text-sm text-gray-500 mt-6">
            Completed focus sessions today: <span className="font-medium text-gray-700">{timer.completedFocusSessions}</span>
          </p>
        </div>
      </div>
    </div>
  );
};
