import React, { useState } from 'react';
import { Plus, X, BookOpen } from 'lucide-react';
import { Task } from '../types';
import { useProjects } from '../hooks/useProjects';
import { useTaskLists } from '../hooks/useTaskLists';

interface AssignmentFormProps {
  onSubmit: (assignment: Omit<Task, 'id' | 'createdAt' | 'subtasks'>, listId?: string) => void;
  onCancel: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function AssignmentForm({ 
  onSubmit, 
  onCancel, 
  isOpen,
  onToggle
}: AssignmentFormProps) {
  const { projects } = useProjects();
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
    const defaultProject = projects.find(p => p.name === 'Personal') || projects[0];
    const selectedProject = project || defaultProject?.id || '';

    const assignmentData = {
      title: title.trim(),
      description: undefined,
      completed: false,
      type: 'assignment' as const,
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

    onSubmit(assignmentData);
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
      >
        <Plus size={18} />
        Add new assignment
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen size={20} className="text-orange-500" />
          <h3 className="text-lg font-semibold text-gray-900">Add New Assignment</h3>
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
            Assignment Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter assignment title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
            Due Date *
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 transition-colors"
          >
            Create Assignment
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