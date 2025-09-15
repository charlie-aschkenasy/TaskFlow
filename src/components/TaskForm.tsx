import React, { useState } from 'react';
import { Plus, X, Calendar, Tag, Paperclip, Bell, Repeat, Clock, User } from 'lucide-react';
import { Task } from '../types';
import { useProjects } from '../hooks/useProjects';
import { useTaskLists } from '../hooks/useTaskLists';
import { RichTextEditor } from './RichTextEditor';
import { TagInput } from './TagInput';
import { AttachmentManager } from './AttachmentManager';
import { ReminderManager } from './ReminderManager';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'subtasks'>, listId?: string) => void;
  onCancel: () => void;
  defaultTimeFrame?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isOpen: boolean;
  onToggle: () => void;
}

export function TaskForm({ 
  onSubmit, 
  onCancel, 
  defaultTimeFrame = 'daily',
  isOpen,
  onToggle
}: TaskFormProps) {
  const { projects, otherProjectId } = useProjects();
  const { taskLists } = useTaskLists();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [timeFrame, setTimeFrame] = useState(defaultTimeFrame);
  const [project, setProject] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('weekly');
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [recurringDays, setRecurringDays] = useState<number[]>([]);
  const [recurringEndDate, setRecurringEndDate] = useState('');

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTimeFrame(defaultTimeFrame);
    setProject('');
    setPriority('medium');
    setDueDate('');
    setTags([]);
    setAttachments([]);
    setReminders([]);
    setIsRecurring(false);
    setRecurringFrequency('weekly');
    setRecurringInterval(1);
    setRecurringDays([]);
    setRecurringEndDate('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const projectToSave = project || otherProjectId;

    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      completed: false,
      type: 'task' as const,
      timeFrame,
      project: projectToSave,
      listId: '', // Will be set by parent component
      priority,
      dueDate: dueDate || undefined,
      parentId: undefined,
      tags,
      attachments,
      reminders,
      recurring: isRecurring ? {
        enabled: true,
        frequency: recurringFrequency,
        interval: recurringInterval,
        daysOfWeek: recurringDays.length > 0 ? recurringDays : undefined,
        endDate: recurringEndDate || undefined,
      } : undefined,
    };

    onSubmit(taskData);
    resetForm();
    onToggle();
  };

  const handleCancel = () => {
    resetForm();
    onCancel();
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const toggleRecurringDay = (dayIndex: number) => {
    setRecurringDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
      >
        <Plus size={18} />
        Add new task
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Add New Task</h3>
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
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            autoFocus
          />
        </div>


        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <RichTextEditor
            value={description}
            onChange={setDescription}
            placeholder="Add a description..."
          />
        </div>

        {/* Time Frame and Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time Frame
            </label>
            <select
              value={timeFrame}
              onChange={(e) => setTimeFrame(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Project and Due Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={project}
              onChange={(e) => setProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Project (Optional)</option>
              {projects.map(proj => (
                <option key={proj.id} value={proj.id}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <TagInput
            selectedTags={tags}
            onTagsChange={setTags}
            placeholder="Add tags..."
          />
        </div>

        {/* Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Attachments
          </label>
          <AttachmentManager
            attachments={attachments}
            onAttachmentsChange={setAttachments}
          />
        </div>

        {/* Reminders */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reminders
          </label>
          <ReminderManager
            reminders={reminders}
            onRemindersChange={setReminders}
            dueDate={dueDate}
          />
        </div>

        {/* Recurring Task */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="recurring"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
              Make this a recurring task
            </label>
          </div>

          {isRecurring && (
            <div className="pl-6 space-y-3 border-l-2 border-blue-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={recurringFrequency}
                    onChange={(e) => setRecurringFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Every
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="365"
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">
                      {recurringFrequency === 'daily' ? 'day(s)' :
                       recurringFrequency === 'weekly' ? 'week(s)' :
                       recurringFrequency === 'monthly' ? 'month(s)' :
                       recurringFrequency === 'yearly' ? 'year(s)' : 'period(s)'}
                    </span>
                  </div>
                </div>
              </div>

              {(recurringFrequency === 'weekly' || recurringFrequency === 'custom') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Days of the week
                  </label>
                  <div className="flex gap-2">
                    {dayNames.map((day, index) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleRecurringDay(index)}
                        className={`px-3 py-1 text-sm rounded transition-colors ${
                          recurringDays.includes(index)
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (optional)
                </label>
                <input
                  type="date"
                  value={recurringEndDate}
                  onChange={(e) => setRecurringEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
          >
            Create Task
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