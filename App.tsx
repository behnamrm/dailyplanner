import React, { useState } from 'react';
import { NavBar } from './components/layout/NavBar';
import { CreateTaskPage } from './components/CreateTaskPage';
import { FocusPage } from './components/FocusPage';
import { MyTasksPage } from './components/MyTasksPage';
import { SettingsPage } from './components/SettingsPage';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { BackupData, Category, PomodoroSession, PomodoroSettings, ProjectTask } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_POMODORO_SETTINGS, STORAGE_KEYS } from './constants';
import { generateId } from './utils';

export type View = 'create' | 'focus' | 'tasks' | 'settings';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('tasks');
  const [tasks, setTasks] = useLocalStorage<ProjectTask[]>(STORAGE_KEYS.tasks, []);
  const [categories, setCategories] = useLocalStorage<Category[]>(STORAGE_KEYS.categories, DEFAULT_CATEGORIES);
  const [pomodoroSessions, setPomodoroSessions] = useLocalStorage<PomodoroSession[]>(STORAGE_KEYS.pomodoroSessions, []);
  const [settings, setSettings] = useLocalStorage<PomodoroSettings>(STORAGE_KEYS.settings, DEFAULT_POMODORO_SETTINGS);
  const [editingTask, setEditingTask] = useState<ProjectTask | null>(null);

  const navigate = (view: View) => {
    if (view !== 'create') setEditingTask(null);
    setActiveView(view);
  };

  const addCategory = (name: string, color: string): Category => {
    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;
    const category: Category = { id: generateId(), name, color };
    setCategories(prev => [...prev, category]);
    return category;
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    setTasks(prev => prev.map(t => (t.categoryId === id ? { ...t, categoryId: null } : t)));
  };

  const saveTask = (task: ProjectTask) => {
    setTasks(prev => {
      const exists = prev.some(t => t.id === task.id);
      return exists ? prev.map(t => (t.id === task.id ? task : t)) : [...prev, task];
    });
    setEditingTask(null);
    setActiveView('tasks');
  };

  const editTask = (task: ProjectTask) => {
    setEditingTask(task);
    setActiveView('create');
  };

  const deleteTask = (id: string) => {
    if (confirm('Delete this task and all its subtasks?')) {
      setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  const toggleTaskStatus = (id: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === id ? { ...t, status: t.status === 'published' ? 'draft' : 'published', updatedAt: new Date().toISOString() } : t
      )
    );
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(s => (s.id === subtaskId ? { ...s, done: !s.done } : s)),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const toggleCompleted = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t))
    );
  };

  const handleFocusSessionComplete = (taskId: string, subtaskId: string) => {
    const session: PomodoroSession = {
      id: generateId(),
      taskId,
      subtaskId,
      startedAt: new Date().toISOString(),
      durationMinutes: settings.focusMinutes,
    };
    setPomodoroSessions(prev => [...prev, session]);
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map(s =>
                s.id === subtaskId ? { ...s, pomodorosSpent: s.pomodorosSpent + 1 } : s
              ),
              updatedAt: new Date().toISOString(),
            }
          : t
      )
    );
  };

  const buildBackup = (): BackupData => ({
    version: 1,
    exportedAt: new Date().toISOString(),
    tasks,
    categories,
    pomodoroSessions,
    settings,
  });

  const importBackup = (data: BackupData) => {
    setTasks(data.tasks ?? []);
    setCategories(data.categories?.length ? data.categories : DEFAULT_CATEGORIES);
    setPomodoroSessions(data.pomodoroSessions ?? []);
    setSettings(data.settings ?? DEFAULT_POMODORO_SETTINGS);
  };

  const clearAllData = () => {
    setTasks([]);
    setCategories(DEFAULT_CATEGORIES);
    setPomodoroSessions([]);
    setSettings(DEFAULT_POMODORO_SETTINGS);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <header className="bg-primary shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-on-primary tracking-tight">Daily Planner</h1>
          <p className="text-indigo-200 text-sm sm:text-base">Plan your projects, focus on what matters.</p>
        </div>
      </header>

      <NavBar activeView={activeView} onNavigate={navigate} />

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'create' && (
          <CreateTaskPage
            categories={categories}
            editingTask={editingTask}
            onAddCategory={addCategory}
            onSave={saveTask}
            onCancelEdit={() => {
              setEditingTask(null);
              setActiveView('tasks');
            }}
          />
        )}

        {activeView === 'focus' && (
          <FocusPage tasks={tasks} settings={settings} onFocusSessionComplete={handleFocusSessionComplete} />
        )}

        {activeView === 'tasks' && (
          <MyTasksPage
            tasks={tasks}
            categories={categories}
            onEditTask={editTask}
            onDeleteTask={deleteTask}
            onToggleStatus={toggleTaskStatus}
            onToggleSubtask={toggleSubtask}
            onToggleCompleted={toggleCompleted}
          />
        )}

        {activeView === 'settings' && (
          <SettingsPage
            categories={categories}
            settings={settings}
            onUpdateSettings={setSettings}
            onAddCategory={addCategory}
            onDeleteCategory={deleteCategory}
            buildBackup={buildBackup}
            onImportBackup={importBackup}
            onClearAllData={clearAllData}
          />
        )}
      </main>
    </div>
  );
};

export default App;
