import React, { useState } from 'react';
import { Plus, X, Calendar } from 'lucide-react';
import { Task } from '../types';
import { useProjects } from '../hooks/useProjects';
import { useTaskLists } from '../hooks/useTaskLists';

interface EventFormProps {
  onSubmit: (event: Omit<Task, 'id' | 'createdAt' | 'subtasks'>, listId?: string) => void;
  onCancel: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function EventForm({ 
  onSubmit, 
  onCancel, 
  isOpen,
  onToggle
}: EventFormProps) {
  const { projects, otherProjectId } = useProjects();
  const { getPersonalListId } = useTaskLists();
  
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [dueDate, setDueDate] = useState('');

  const resetForm = () => {
    setTitle('');
    setProject('');
    setDueDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    // Get the personal list ID or first available project
    const personalListId = getPersonalListId();
    const selectedProject = project || otherProjectId;

    const eventData = {
      title: title.trim(),
      description: undefined,
      completed: false,
      type: 'event' as const,
      timeFrame: 'daily' as const,
      project: selectedProject,
      listId: personalListId,
      priority: 'medium' as const,
      dueDate: dueDate,
      parentId: undefined,
      tags: [],
      attachments: [],
      reminders: [],
      recurring: undefined,
    };

    onSubmit(eventData);
    resetForm();
    onToggle();
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
      >
        <Plus size={18} />
        Add new event
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={20} className="text-purple-500" />
          <h3 className="text-lg font-semibold text-gray-900">Add New Event</h3>
        </div>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter event title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
            autoFocus
          />
        </div>

        {/* Project */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project
          </label>
          <select
            value={project}
            onChange={(e) => setProject(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">Select Project (Optional)</option>
            {projects.map(proj => (
              <option key={proj.id} value={proj.id}>
                {proj.name}
              </option>
            ))}
          </select>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Event Date *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-md hover:bg-purple-600 transition-colors"
          >
            Create Event
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}