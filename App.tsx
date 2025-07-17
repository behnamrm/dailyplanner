import React, { useEffect, useCallback, useRef } from 'react';
import { AddTaskForm } from './components/AddTaskForm';
import { TaskItem } from './components/TaskItem';
import { Statistics } from './components/Statistics';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { Task, HistoryEntry, BackupData } from './types';
import { CHUNKS_PER_TASK } from './constants';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { UploadIcon } from './components/icons/UploadIcon';

const App: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [history, setHistory] = useLocalStorage<HistoryEntry[]>('history', []);
  const [lastVisitDate, setLastVisitDate] = useLocalStorage<string>('lastVisitDate', '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (lastVisitDate && lastVisitDate !== today) {
      // Archive completed tasks from the previous day
      const yesterdayTasksWithProgress = tasks.filter(task => task.checked > 0);
      if (yesterdayTasksWithProgress.length > 0) {
        const newHistoryEntry: HistoryEntry = {
          date: lastVisitDate,
          completedTasks: yesterdayTasksWithProgress.filter(t => t.checked === CHUNKS_PER_TASK).length,
          completedChunks: yesterdayTasksWithProgress.reduce((sum, t) => sum + t.checked, 0),
        };
        setHistory(prevHistory => [...prevHistory, newHistoryEntry]);
      }
      
      // Reset progress for the new day, but keep the tasks
      setTasks(prevTasks => 
        prevTasks.map(task => ({ ...task, checked: 0 }))
      );
    }
    setLastVisitDate(today);
  }, [lastVisitDate, tasks, setHistory, setTasks, setLastVisitDate]);

  const addTask = (title: string) => {
    if (title.trim() === '' || tasks.some(task => task.title === title)) return;
    const newTask: Task = {
      id: Date.now(),
      title,
      checked: 0,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const updateTaskChecked = useCallback((id: number, checked: number) => {
    setTasks(prevTasks =>
      prevTasks.map(task => (task.id === id ? { ...task, checked } : task))
    );
  }, [setTasks]);

  const deleteTask = (id: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  const handleExport = () => {
    const backupData: BackupData = {
      tasks,
      history,
    };
    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    const date = new Date().toISOString().split('T')[0];
    link.download = `habit-tracker-backup-${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result;
        if (typeof text !== 'string') {
          throw new Error('File content is not readable');
        }
        const data: BackupData = JSON.parse(text);

        if (Array.isArray(data.tasks) && Array.isArray(data.history)) {
          setTasks(data.tasks);
          setHistory(data.history);
          alert('Data imported successfully!');
        } else {
          throw new Error('Invalid backup file format.');
        }
      } catch (error) {
        console.error('Failed to import data:', error);
        alert(`Failed to import data: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        if(event.target) {
          event.target.value = '';
        }
      }
    };
    reader.readAsText(file);
  };


  return (
    <div className="min-h-screen bg-gray-50 text-on-surface">
      <header className="bg-primary shadow-md">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-on-primary tracking-tight">
                        Habit Tracker
                    </h1>
                    <p className="text-indigo-200 text-sm sm:text-base">Consistency is the key, just keep track!</p>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileImport}
                        accept=".json"
                        className="hidden"
                        aria-hidden="true"
                    />
                    <button
                        onClick={handleImportClick}
                        className="p-2 bg-primary-light text-on-primary rounded-lg hover:bg-indigo-400 transition-colors flex items-center gap-2"
                        title="Import Data"
                        aria-label="Import Data"
                    >
                        <UploadIcon />
                        <span className="hidden md:inline text-sm font-medium">Import</span>
                    </button>
                    <button
                        onClick={handleExport}
                        className="p-2 bg-primary-light text-on-primary rounded-lg hover:bg-indigo-400 transition-colors flex items-center gap-2"
                        title="Export Data"
                        aria-label="Export Data"
                    >
                        <DownloadIcon />
                        <span className="hidden md:inline text-sm font-medium">Export</span>
                    </button>
                </div>
            </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-surface p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Today's Focus</h2>
            <AddTaskForm onAddTask={addTask} />
            <div className="mt-6 space-y-4">
              {tasks.length > 0 ? (
                tasks.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onUpdate={updateTaskChecked}
                    onDelete={deleteTask}
                  />
                ))
              ) : (
                <div className="text-center text-gray-500 py-10 border-2 border-dashed rounded-lg">
                  <p>No tasks yet.</p>
                  <p className="text-sm">Add a task to get started!</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <Statistics history={history} todayTasks={tasks} />
        </div>
      </main>
    </div>
  );
};

export default App;