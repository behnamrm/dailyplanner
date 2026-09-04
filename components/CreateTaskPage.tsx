import React, { useEffect, useState } from 'react';
import type { Category, ProjectTask, Subtask } from '../types';
import { generateId } from '../utils';
import { CATEGORY_COLOR_OPTIONS } from '../constants';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface CreateTaskPageProps {
  categories: Category[];
  editingTask: ProjectTask | null;
  onAddCategory: (name: string, color: string) => Category;
  onSave: (task: ProjectTask) => void;
  onCancelEdit: () => void;
}

const emptyDraft = (): Omit<ProjectTask, 'status'> => ({
  id: generateId(),
  title: '',
  deadline: null,
  categoryId: null,
  subtasks: [],
  completed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const CreateTaskPage: React.FC<CreateTaskPageProps> = ({
  categories,
  editingTask,
  onAddCategory,
  onSave,
  onCancelEdit,
}) => {
  const [draft, setDraft] = useState<Omit<ProjectTask, 'status'>>(emptyDraft());
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLOR_OPTIONS[0]);
  const [titleError, setTitleError] = useState(false);

  useEffect(() => {
    if (editingTask) {
      const { status, ...rest } = editingTask;
      setDraft(rest);
    } else {
      setDraft(emptyDraft());
    }
    setTitleError(false);
  }, [editingTask]);

  const resetForm = () => {
    setDraft(emptyDraft());
    setNewSubtaskTitle('');
    setShowNewCategory(false);
    setTitleError(false);
  };

  const addSubtask = () => {
    const title = newSubtaskTitle.trim();
    if (!title) return;
    const subtask: Subtask = { id: generateId(), title, done: false, pomodorosSpent: 0 };
    setDraft(prev => ({ ...prev, subtasks: [...prev.subtasks, subtask] }));
    setNewSubtaskTitle('');
  };

  const removeSubtask = (id: string) => {
    setDraft(prev => ({ ...prev, subtasks: prev.subtasks.filter(s => s.id !== id) }));
  };

  const updateSubtaskTitle = (id: string, title: string) => {
    setDraft(prev => ({
      ...prev,
      subtasks: prev.subtasks.map(s => (s.id === id ? { ...s, title } : s)),
    }));
  };

  const handleCreateCategory = () => {
    const name = newCategoryName.trim();
    if (!name) return;
    const category = onAddCategory(name, newCategoryColor);
    setDraft(prev => ({ ...prev, categoryId: category.id }));
    setNewCategoryName('');
    setShowNewCategory(false);
  };

  const handleSave = (status: 'draft' | 'published') => {
    if (!draft.title.trim()) {
      setTitleError(true);
      return;
    }
    const task: ProjectTask = {
      ...draft,
      title: draft.title.trim(),
      status,
      updatedAt: new Date().toISOString(),
    };
    onSave(task);
    if (!editingTask) resetForm();
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-surface p-6 rounded-lg shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">{editingTask ? 'Edit Task' : 'Create Task'}</h2>
          {editingTask && (
            <button
              onClick={onCancelEdit}
              className="text-sm text-gray-500 hover:text-gray-800"
            >
              Cancel edit
            </button>
          )}
        </div>

        <div className="space-y-5">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={draft.title}
              onChange={e => {
                setDraft(prev => ({ ...prev, title: e.target.value }));
                if (titleError) setTitleError(false);
              }}
              placeholder="e.g. Launch marketing website"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary ${
                titleError ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {titleError && <p className="text-sm text-red-500 mt-1">Title is required.</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline
              </label>
              <input
                id="deadline"
                type="date"
                value={draft.deadline ?? ''}
                onChange={e => setDraft(prev => ({ ...prev, deadline: e.target.value || null }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                value={draft.categoryId ?? ''}
                onChange={e => setDraft(prev => ({ ...prev, categoryId: e.target.value || null }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-white"
              >
                <option value="">No category</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {!showNewCategory ? (
                <button
                  type="button"
                  onClick={() => setShowNewCategory(true)}
                  className="text-sm text-primary hover:text-primary-dark mt-1"
                >
                  + New category
                </button>
              ) : (
                <div className="mt-2 p-3 border border-gray-200 rounded-md space-y-2">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {CATEGORY_COLOR_OPTIONS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        style={{ backgroundColor: color }}
                        className={`h-6 w-6 rounded-full ${newCategoryColor === color ? 'ring-2 ring-offset-1 ring-gray-500' : ''}`}
                        aria-label={`Choose color ${color}`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      className="text-sm px-3 py-1 bg-primary text-on-primary rounded-md hover:bg-primary-dark"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewCategory(false)}
                      className="text-sm px-3 py-1 text-gray-500 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subtasks / To-do</label>
            <div className="space-y-2">
              {draft.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={subtask.done}
                    onChange={e =>
                      setDraft(prev => ({
                        ...prev,
                        subtasks: prev.subtasks.map(s =>
                          s.id === subtask.id ? { ...s, done: e.target.checked } : s
                        ),
                      }))
                    }
                    className="h-4 w-4 text-primary rounded focus:ring-primary"
                  />
                  <input
                    type="text"
                    value={subtask.title}
                    onChange={e => updateSubtaskTitle(subtask.id, e.target.value)}
                    className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => removeSubtask(subtask.id)}
                    className="text-gray-400 hover:text-red-500 p-1"
                    aria-label="Remove subtask"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={e => setNewSubtaskTitle(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubtask();
                  }
                }}
                placeholder="Add a subtask"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={addSubtask}
                className="p-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                aria-label="Add subtask"
              >
                <PlusIcon />
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => handleSave('draft')}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              Save as Draft
            </button>
            <button
              type="button"
              onClick={() => handleSave('published')}
              className="flex-1 px-4 py-2.5 bg-primary text-on-primary rounded-md font-medium hover:bg-primary-dark transition-colors"
            >
              Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
