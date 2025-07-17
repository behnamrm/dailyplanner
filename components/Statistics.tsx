import React, { useState, useMemo } from 'react';
import type { Task, HistoryEntry, StatsPeriod } from '../types';
import { StatsChart } from './StatsChart';
import { MINUTES_PER_CHUNK } from '../constants';

interface StatisticsProps {
  history: HistoryEntry[];
  todayTasks: Task[];
}

export const Statistics: React.FC<StatisticsProps> = ({ history, todayTasks }) => {
  const [period, setPeriod] = useState<StatsPeriod>('month');

  const processedData = useMemo(() => {
    const today = new Date();
    const todayEntry: HistoryEntry = {
      date: today.toISOString().split('T')[0],
      completedTasks: 0, // This is calculated from history, not for today.
      completedChunks: todayTasks.reduce((sum, task) => sum + task.checked, 0),
    };
    
    const fullHistory = [...history, todayEntry];

    const getStartDate = (p: StatsPeriod): Date => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      switch (p) {
        case 'day':
          return date;
        case 'month':
          date.setDate(1);
          return date;
        case '3-months':
          date.setMonth(date.getMonth() - 2);
          date.setDate(1);
          return date;
        case '6-months':
          date.setMonth(date.getMonth() - 5);
          date.setDate(1);
          return date;
        case 'year':
          date.setMonth(0);
          date.setDate(1);
          return date;
        default:
          return date;
      }
    };

    const startDate = getStartDate(period);
    
    const filteredHistory = fullHistory.filter(entry => new Date(entry.date) >= startDate);
    
    if (period === 'day') {
        return [{
            name: 'Today',
            Chunks: todayEntry.completedChunks,
            Minutes: todayEntry.completedChunks * MINUTES_PER_CHUNK,
        }];
    }
    
    // Aggregate by month
    const aggregatedData: { [key: string]: { Chunks: number; Minutes: number } } = {};
    
    filteredHistory.forEach(entry => {
        const month = new Date(entry.date).toLocaleString('default', { month: 'short', year: '2-digit' });
        if (!aggregatedData[month]) {
            aggregatedData[month] = { Chunks: 0, Minutes: 0 };
        }
        aggregatedData[month].Chunks += entry.completedChunks;
        aggregatedData[month].Minutes += entry.completedChunks * MINUTES_PER_CHUNK;
    });
    
    return Object.keys(aggregatedData).map(month => ({
        name: month,
        ...aggregatedData[month],
    }));

  }, [period, history, todayTasks]);
  
  const totalChunks = processedData.reduce((sum, item) => sum + (item.Chunks || 0), 0);
  const totalMinutes = totalChunks * MINUTES_PER_CHUNK;

  const periods: { value: StatsPeriod, label: string }[] = [
      {value: 'day', label: 'Today'},
      {value: 'month', label: 'Month'},
      {value: '3-months', label: '3M'},
      {value: '6-months', label: '6M'},
      {value: 'year', label: 'Year'},
  ];

  return (
    <div className="bg-surface p-6 rounded-lg shadow-sm h-full">
      <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
      <div className="mb-4">
        <div className="flex justify-center bg-gray-100 p-1 rounded-lg">
          {periods.map(p => (
            <button
                key={p.value}
                onClick={() => setPeriod(p.value)}
                className={`w-full py-2 text-sm font-medium rounded-md transition-colors ${
                period === p.value
                    ? 'bg-primary text-on-primary shadow'
                    : 'text-gray-600 hover:bg-gray-200'
                }`}
            >
                {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6">
        <div className="h-64">
           <StatsChart data={processedData} />
        </div>
        <div className="mt-6 text-center space-y-2">
            <div>
                <p className="text-sm text-gray-500">Total Chunks Completed</p>
                <p className="text-2xl font-bold text-primary">{totalChunks}</p>
            </div>
            <div>
                <p className="text-sm text-gray-500">Total Minutes Focused</p>
                <p className="text-2xl font-bold text-secondary">{totalMinutes.toLocaleString()}</p>
            </div>
        </div>
      </div>
    </div>
  );
};