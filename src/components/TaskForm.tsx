import React, { useState } from 'react';
import { Plus, X, FolderPlus, Tag } from 'lucide-react';
import { Task, Attachment } from '../types';
import { useProjects } from '../hooks/useProjects';
import { useTaskLists } from '../hooks/useTaskLists';
import { useTags } from '../hooks/useTags';
import { ProjectBadge } from './ProjectBadge';
import { RichTextEditor } from './RichTextEditor';
import { TagInput } from './TagInput';
import { AttachmentManager } from './AttachmentManager';
import { ReminderManager } from './ReminderManager';

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'subtasks'>) => void;
  onCancel?: () => void;
  defaultTimeFrame?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  isOpen: boolean;
  onToggle: () => void;
}

export function TaskForm({ onSubmit, onCancel, defaultTimeFrame = 'daily', isOpen, onToggle }: TaskFormProps) {
  const { projects, addProject } = useProjects();
  const { taskLists, activeListId, addTaskList, getPersonalListId } = useTaskLists();
  const { availableTags } = useTags();
  const [showAdditionalFields, setShowAdditionalFields] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [timeFrame, setTimeFrame] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(defaultTimeFrame);
  const [selectedListId, setSelectedListId] = useState(activeListId === 'all' ? getPersonalListId() : activeListId);
  const [project, setProject] = useState(projects[0]?.id || '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('weekly');
  const [recurringInterval, setRecurringInterval] = useState(1);
  const [recurringDaysOfWeek, setRecurringDaysOfWeek] = useState<number[]>([]);
  const [recurringEndDate, setRecurringEndDate] = useState('');
  const [showNewListForm, setShowNewListForm] = useState(false);
  const [showNewProjectForm, setShowNewProjectForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#3B82F6');
  const [newListIcon, setNewListIcon] = useState('📝');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3B82F6');
  const [taskType, setTaskType] = useState<'task' | 'event' | 'assignment'>('task');

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const predefinedIcons = [
    '📝', '💼', '🎓', '🏠', '💪', '🎨', '🛒', '🎯'
  ];

  const daysOfWeekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const handleDayOfWeekToggle = (dayIndex: number) => {
    setRecurringDaysOfWeek(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const recurringConfig = isRecurring ? {
      enabled: true,
      frequency: recurringFrequency,
      interval: recurringInterval,
      daysOfWeek: recurringFrequency === 'weekly' || recurringFrequency === 'custom' ? recurringDaysOfWeek : undefined,
      endDate: recurringEndDate || undefined,
      lastGenerated: new Date().toISOString(),
    } : undefined;

    onSubmit({
      title: title.trim(),
      description: description.trim() || undefined,
      type: taskType,
      completed: false,
      timeFrame,
      project,
      listId: selectedListId, // This should be the selected list ID
      priority,
      dueDate: dueDate || undefined,
      tags,
      attachments,
      reminders,
      recurring: recurringConfig,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setTags([]);
    setAttachments([]);
    setReminders([]);
    setTaskType('task');
    setTimeFrame(defaultTimeFrame);
    // Keep the selected list for next task creation
    setProject(projects[0]?.id || '');
    setPriority('medium');
    setDueDate('');
    setIsRecurring(false);
    setRecurringFrequency('weekly');
    setRecurringInterval(1);
    setRecurringDaysOfWeek([]);
    setRecurringEndDate('');
    setShowAdditionalFields(false);
    
    if (onCancel) onCancel();
  };

  const handleCreateNewList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    const newListId = addTaskList(newListName.trim(), newListColor, newListIcon);
    setSelectedListId(newListId);
    setShowNewListForm(false);
    setNewListName('');
    setNewListColor('#3B82F6');
    setNewListIcon('📝');
  };
  const handleCreateNewProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    
    const newProjectId = addProject(newProjectName.trim(), newProjectColor);
    setProject(newProjectId);
    setShowNewProjectForm(false);
    setNewProjectName('');
    setNewProjectColor('#3B82F6');
  };

  const handleCancel = () => {
    setTitle('');
    setDescription('');
    setTimeFrame(defaultTimeFrame);
    // Reset to current active list or personal if viewing all
    const resetListId = activeListId === 'all' ? getPersonalListId() : activeListId;
    setSelectedListId(resetListId);
    setProject(projects[0]?.id || '');
    setPriority('medium');
    setDueDate('');
    setIsRecurring(false);
    setRecurringFrequency('weekly');
    setRecurringInterval(1);
    setRecurringDaysOfWeek([]);
    setRecurringEndDate('');
    setAttachments([]);
    setReminders([]);
    setShowNewListForm(false);
    setShowNewProjectForm(false);
    setNewListName('');
    setNewProjectName('');
    setShowAdditionalFields(false);
    setTaskType('task');
    setTaskType('task');
    
    if (onCancel) onCancel();
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors"
      >
        <Plus size={20} />
        Add new task
      </button>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Add New Task
        </h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            {taskType === 'task' ? 'Task' : taskType === 'event' ? 'Event' : 'Assignment'} Title *
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${taskType} title...`}
            required
            autoFocus
          />
        </div>

        <div>
          <label htmlFor="taskType" className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            id="taskType"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value as 'task' | 'event' | 'assignment')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="task">📝 Task</option>
            <option value="event">📅 Event</option>
            <option value="assignment">📚 Assignment</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <RichTextEditor
            value={description}
            onChange={(value) => setDescription(value)}
            placeholder="Add a description with formatting, lists, or links..."
          />
        </div>

        {/* List Selection */}
        <div>
          <label htmlFor="list" className="block text-sm font-medium text-gray-700 mb-1">
            List
          </label>
          <div className="flex gap-2">
            <select
              id="list"
              value={selectedListId}
              onChange={(e) => setSelectedListId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {taskLists.map(list => (
                <option key={list.id} value={list.id}>
                  {list.icon} {list.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setShowNewListForm(!showNewListForm)}
              className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              title="Create new list"
            >
              <FolderPlus size={16} />
            </button>
          </div>
        </div>

        {/* New List Form */}
        {showNewListForm && (
          <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Create New List</h4>
            <form onSubmit={handleCreateNewList} className="space-y-3">
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="List name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="grid grid-cols-8 gap-2">
                {predefinedIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewListIcon(icon)}
                    className={`p-2 text-lg rounded border transition-colors ${
                      newListIcon === icon
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-8 gap-2">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewListColor(color)}
                    className={`w-6 h-6 rounded border-2 transition-all ${
                      newListColor === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewListForm(false)}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
            Due Date
          </label>
          <input
            type="date"
            id="dueDate"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        {/* Additional Information Toggle */}
        {!showAdditionalFields && (
          <div className="border-t pt-4">
            <button
              type="button"
              onClick={() => setShowAdditionalFields(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Additional Information
            </button>
          </div>
        )}

        {/* Additional Fields */}
        {showAdditionalFields && (
          <div className="border-t pt-4 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-medium text-gray-700">Additional Information</h4>
              <button
                type="button"
                onClick={() => setShowAdditionalFields(false)}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Hide
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Attachments
                </label>
                <AttachmentManager
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reminders
                </label>
                <ReminderManager
                  reminders={reminders}
                  onRemindersChange={setReminders}
                  dueDate={dueDate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <TagInput
                  selectedTags={tags}
                  onTagsChange={setTags}
                  placeholder="Add tags (urgent, study, exam, etc.)"
                />
              </div>

              {/* Project Selection */}
              <div>
                <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
                  Project
                </label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <select
                      id="project"
                      value={project}
                      onChange={(e) => setProject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                    >
                      {projects.map(proj => (
                        <option key={proj.id} value={proj.id}>
                          {proj.name}
                        </option>
                      ))}
                    </select>
                    {project && (
                      <div className="absolute right-3 top-2.5">
                        <ProjectBadge project={projects.find(p => p.id === project)} size="sm" />
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowNewProjectForm(!showNewProjectForm)}
                    className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                    title="Create new project"
                  >
                    <Tag size={16} />
                  </button>
                </div>
              </div>

              {/* New Project Form */}
              {showNewProjectForm && (
                <div className="md:col-span-2 p-4 bg-gray-50 rounded-lg border space-y-3">
                  <h4 className="text-sm font-medium text-gray-700">Create New Project</h4>
                  <form onSubmit={handleCreateNewProject} className="space-y-3">
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Project name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <div className="grid grid-cols-8 gap-2">
                      {predefinedColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewProjectColor(color)}
                          className={`w-6 h-6 rounded border-2 transition-all ${
                            newProjectColor === color
                              ? 'border-gray-800 scale-110'
                              : 'border-gray-300 hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        Create
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowNewProjectForm(false)}
                        className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div>
                <label htmlFor="timeFrame" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Frame
                </label>
                <select
                  id="timeFrame"
                  value={timeFrame}
                  onChange={(e) => setTimeFrame(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            {/* Recurring Task Settings */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  id="isRecurring"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                  Make this a recurring task
                </label>
              </div>

              {isRecurring && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Repeat every
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={recurringInterval}
                          onChange={(e) => setRecurringInterval(parseInt(e.target.value) || 1)}
                          className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={recurringFrequency}
                          onChange={(e) => setRecurringFrequency(e.target.value as any)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="daily">Day(s)</option>
                          <option value="weekly">Week(s)</option>
                          <option value="monthly">Month(s)</option>
                          <option value="yearly">Year(s)</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        End date (optional)
                      </label>
                      <input
                        type="date"
                        value={recurringEndDate}
                        onChange={(e) => setRecurringEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>
                  </div>

                  {(recurringFrequency === 'weekly' || recurringFrequency === 'custom') && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Repeat on days
                      </label>
                      <div className="flex gap-2">
                        {daysOfWeekLabels.map((day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayOfWeekToggle(index)}
                            className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                              recurringDaysOfWeek.includes(index)
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                      {recurringDaysOfWeek.length === 0 && (
                        <p className="text-sm text-red-600 mt-1">
                          Please select at least one day
                        </p>
                      )}
                    </div>
                  )}

                  <div className="text-sm text-gray-600 bg-white p-3 rounded border">
                    <strong>Preview:</strong> {getRecurrencePreview()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={showAdditionalFields && isRecurring && (recurringFrequency === 'weekly' || recurringFrequency === 'custom') && recurringDaysOfWeek.length === 0}
            className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Create {taskType === 'task' ? 'Task' : taskType === 'event' ? 'Event' : 'Assignment'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

  function getRecurrencePreview(): string {
    if (!isRecurring) return '';
    
    let preview = `Repeats every ${recurringInterval > 1 ? recurringInterval + ' ' : ''}`;
    
    switch (recurringFrequency) {
      case 'daily':
        preview += recurringInterval === 1 ? 'day' : 'days';
        break;
      case 'weekly':
        preview += recurringInterval === 1 ? 'week' : 'weeks';
        if (recurringDaysOfWeek.length > 0) {
          const dayNames = recurringDaysOfWeek.map(d => daysOfWeekLabels[d]).join(', ');
          preview += ` on ${dayNames}`;
        }
        break;
      case 'monthly':
        preview += recurringInterval === 1 ? 'month' : 'months';
        break;
      case 'yearly':
        preview += recurringInterval === 1 ? 'year' : 'years';
        break;
      case 'custom':
        preview += 'custom schedule';
        if (recurringDaysOfWeek.length > 0) {
          const dayNames = recurringDaysOfWeek.map(d => daysOfWeekLabels[d]).join(', ');
          preview += ` on ${dayNames}`;
        }
        break;
    }
    
    if (recurringEndDate) {
      preview += ` until ${new Date(recurringEndDate).toLocaleDateString()}`;
    }
    
    return preview;
  }
}