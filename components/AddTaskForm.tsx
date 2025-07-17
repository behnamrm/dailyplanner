import React, { useState } from 'react';
import { getTaskSuggestions } from '../services/geminiService';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface AddTaskFormProps {
  onAddTask: (title: string) => void;
}

export const AddTaskForm: React.FC<AddTaskFormProps> = ({ onAddTask }) => {
  const [title, setTitle] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddTask(title.trim());
      setTitle('');
      setSuggestions([]);
    }
  };
  
  const handleGetSuggestions = async () => {
    if (!title.trim()) {
        setError('Please enter a topic to get suggestions.');
        return;
    }
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
        const result = await getTaskSuggestions(title);
        setSuggestions(result);
    } catch (err) {
        setError('Failed to get suggestions. Please try again.');
        console.error(err);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setTitle(suggestion);
    setSuggestions([]);
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if(error) setError(null);
          }}
          placeholder="e.g., Learn advanced TypeScript"
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={handleGetSuggestions}
          disabled={isLoading}
          className="p-3 bg-secondary text-on-secondary rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          aria-label="Get AI Suggestions"
        >
          <SparklesIcon />
          <span className="hidden sm:inline">Suggest</span>
        </button>
        <button
          type="submit"
          className="p-3 bg-primary text-on-primary rounded-lg hover:bg-primary-light transition-colors flex items-center gap-2"
          aria-label="Add Task"
        >
          <PlusIcon />
           <span className="hidden sm:inline">Add</span>
        </button>
      </form>
      {isLoading && <p className="text-sm text-gray-600 mt-2 animate-pulse">Getting suggestions...</p>}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {suggestions.length > 0 && (
        <div className="mt-3 bg-gray-100 p-3 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Suggestions:</h4>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(s)}
                className="text-sm bg-white border border-gray-300 rounded-full px-3 py-1 hover:bg-primary-light hover:text-white transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};