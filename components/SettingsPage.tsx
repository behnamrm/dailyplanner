import React, { useRef } from 'react';
import type { BackupData, Category, PomodoroSettings } from '../types';
import { CATEGORY_COLOR_OPTIONS } from '../constants';
import { DownloadIcon } from './icons/DownloadIcon';
import { UploadIcon } from './icons/UploadIcon';
import { TrashIcon } from './icons/TrashIcon';

interface SettingsPageProps {
  categories: Category[];
  settings: PomodoroSettings;
  onUpdateSettings: (settings: PomodoroSettings) => void;
  onAddCategory: (name: string, color: string) => Category;
  onDeleteCategory: (id: string) => void;
  buildBackup: () => BackupData;
  onImportBackup: (data: BackupData) => void;
  onClearAllData: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  categories,
  settings,
  onUpdateSettings,
  onAddCategory,
  onDeleteCategory,
  buildBackup,
  onImportBackup,
  onClearAllData,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const newCategoryNameRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const backup = buildBackup();
    const jsonString = JSON.stringify(backup, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    const date = new Date().toISOString().split('T')[0];
    link.download = `daily-planner-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') throw new Error('File content is not readable');
        const data: BackupData = JSON.parse(text);
        if (Array.isArray(data.tasks) && Array.isArray(data.categories)) {
          onImportBackup(data);
          alert('Data imported successfully!');
        } else {
          throw new Error('Invalid backup file format.');
        }
      } catch (error) {
        alert(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        if (event.target) event.target.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleAddCategory = () => {
    const name = newCategoryNameRef.current?.value.trim();
    if (!name) return;
    const color = CATEGORY_COLOR_OPTIONS[categories.length % CATEGORY_COLOR_OPTIONS.length];
    onAddCategory(name, color);
    if (newCategoryNameRef.current) newCategoryNameRef.current.value = '';
  };

  const handleClearAllData = () => {
    if (confirm('This will permanently delete all tasks, categories and sessions. Continue?')) {
      onClearAllData();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-surface p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-1">Backup</h2>
        <p className="text-sm text-gray-500 mb-4">Export your data to a file, or restore from a previous backup.</p>
        <div className="flex gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
            aria-hidden="true"
          />
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-md hover:bg-primary-dark transition-colors"
          >
            <DownloadIcon />
            Export
          </button>
          <button
            onClick={handleImportClick}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
          >
            <UploadIcon />
            Import
          </button>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-1">Pomodoro Timer</h2>
        <p className="text-sm text-gray-500 mb-4">Customize your focus and break durations.</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Focus (minutes)</label>
            <input
              type="number"
              min={1}
              value={settings.focusMinutes}
              onChange={e => onUpdateSettings({ ...settings, focusMinutes: Number(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short break (minutes)</label>
            <input
              type="number"
              min={1}
              value={settings.shortBreakMinutes}
              onChange={e => onUpdateSettings({ ...settings, shortBreakMinutes: Number(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Long break (minutes)</label>
            <input
              type="number"
              min={1}
              value={settings.longBreakMinutes}
              onChange={e => onUpdateSettings({ ...settings, longBreakMinutes: Number(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sessions before long break</label>
            <input
              type="number"
              min={1}
              value={settings.sessionsBeforeLongBreak}
              onChange={e => onUpdateSettings({ ...settings, sessionsBeforeLongBreak: Number(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-1">Categories</h2>
        <p className="text-sm text-gray-500 mb-4">Manage the categories used to organize your tasks.</p>
        <ul className="space-y-2 mb-4">
          {categories.map(category => (
            <li key={category.id} className="flex items-center justify-between px-3 py-2 border border-gray-200 rounded-md">
              <span className="flex items-center gap-2 text-sm text-gray-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: category.color }} />
                {category.name}
              </span>
              <button
                onClick={() => onDeleteCategory(category.id)}
                className="text-gray-400 hover:text-red-500 p-1"
                aria-label={`Delete ${category.name}`}
              >
                <TrashIcon />
              </button>
            </li>
          ))}
        </ul>
        <div className="flex gap-2">
          <input
            ref={newCategoryNameRef}
            type="text"
            placeholder="New category name"
            onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm font-medium"
          >
            Add
          </button>
        </div>
      </div>

      <div className="bg-surface p-6 rounded-lg shadow-sm border border-red-100">
        <h2 className="text-xl font-semibold mb-1 text-red-600">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">Permanently delete all local data.</p>
        <button
          onClick={handleClearAllData}
          className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors text-sm font-medium"
        >
          Clear all data
        </button>
      </div>
    </div>
  );
};
