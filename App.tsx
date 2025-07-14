
import React, { useState, useCallback } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Task, DailyProgress, View } from './types';
import Header from './components/Header';
import DailyView from './components/DailyView';
import StatsView from './components/StatsView';
import DataManagement from './components/DataManagement';
import AddTaskForm from './components/AddTaskForm';

const getFormattedDate = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const App: React.FC = () => {
  const [view, setView] = useState<View>('daily');
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
  const [progress, setProgress] = useLocalStorage<DailyProgress>('progress', {});

  const handleAddTask = useCallback((taskName: string) => {
    if (taskName.trim() === '') return;
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name: taskName.trim(),
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  }, [setTasks]);

  const handleUpdateProgress = useCallback((taskId: string, newCount: number) => {
    const today = getFormattedDate(new Date());
    setProgress(prevProgress => {
      const newProgress = { ...prevProgress };
      if (!newProgress[today]) {
        newProgress[today] = {};
      }
      newProgress[today][taskId] = newCount;
      return newProgress;
    });
  }, [setProgress]);

  const handleImport = useCallback((data: { tasks: Task[], progress: DailyProgress }) => {
    if (window.confirm('Are you sure you want to import this backup? This will overwrite all current tasks and progress.')) {
      setTasks(data.tasks);
      setProgress(data.progress);
      alert('Data imported successfully!');
      setView('daily'); // Switch to daily view to see changes
    }
  }, [setTasks, setProgress, setView]);

  return (
    <div className="min-h-screen bg-light dark:bg-dark text-dark dark:text-light font-sans">
      <div className="container mx-auto p-4 md:p-8 max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary">Task Tracker</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">Commit to your 45-minute goals, one block at a time.</p>
        </header>
        
        <Header currentView={view} setView={setView} />

        <div className="mt-8 lg:grid lg:grid-cols-3 lg:gap-8">
          <main className="lg:col-span-2">
            {view === 'daily' ? (
              <DailyView 
                tasks={tasks}
                progress={progress}
                onUpdateProgress={handleUpdateProgress}
              />
            ) : (
              <StatsView tasks={tasks} progress={progress} />
            )}
          </main>
          
          <aside className="mt-8 space-y-8 lg:mt-0 lg:col-span-1">
            {view === 'daily' && <AddTaskForm onAddTask={handleAddTask} />}
            <DataManagement
              tasks={tasks}
              progress={progress}
              onImport={handleImport}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default App;
