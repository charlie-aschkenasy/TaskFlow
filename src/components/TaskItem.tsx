import React, { useState } from 'react';
import { Calendar, Clock, Tag, User, ChevronDown, ChevronUp, Edit3, Trash2, Check, X } from 'lucide-react';
import { Task } from '../types';
import { formatDate } from '../utils/taskUtils';
import { useProjects } from '../hooks/useProjects';
import { ProjectBadge } from './ProjectBadge';
import { RichTextEditor } from './RichTextEditor';
import { TagInput } from './TagInput';
import { AttachmentManager } from './AttachmentManager';
import { ReminderManager } from './ReminderManager';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
}

export function TaskItem({
  task,
  onToggle,
  onDelete,
  onUpdate,
  onAddSubtask,
}: TaskItemProps) {
  const { projects } = useProjects();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || '');
  const [editPriority, setEditPriority] = useState(task.priority);
  const [editDueDate, setEditDueDate] = useState(task.dueDate || '');
  const [editTags, setEditTags] = useState(task.tags || []);
  const [editTimeFrame, setEditTimeFrame] = useState(task.timeFrame);

  const project = projects.find(p => p.id === task.project);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  const handleSaveEdit = () => {
    onUpdate(task.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      priority: editPriority,
      dueDate: editDueDate || undefined,
      tags: editTags,
      timeFrame: editTimeFrame,
    });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || '');
    setEditPriority(task.priority);
    setEditDueDate(task.dueDate || '');
    setEditTags(task.tags || []);
    setEditTimeFrame(task.timeFrame);
    setIsEditing(false);
  };

  const handleAddSubtask = () => {
    const subtaskTitle = prompt('Enter subtask title:');
    if (subtaskTitle?.trim()) {
      onAddSubtask(task.id, {
        title: subtaskTitle.trim(),
        description: '',
        completed: false,
        timeFrame: task.timeFrame,
        project: task.project,
        priority: 'medium',
        tags: [],
        attachments: [],
        reminders: [],
      });
    }
  };

  return (
    <div className={`bg-white rounded-lg border p-4 transition-all duration-200 ${
      task.completed ? 'opacity-75 bg-gray-50' : 'hover:shadow-md'
    } relative overflow-hidden`}>
      {/* Priority vertical bar */}
      {task.priority && (
        <div 
          className={`absolute left-0 top-0 bottom-0 w-1 ${
            task.priority === 'high' ? 'bg-red-500' :
            task.priority === 'medium' ? '' :
            task.priority === 'low' ? 'bg-blue-500' :
            'bg-gray-300'
          }`}
          style={task.priority === 'medium' ? { backgroundColor: '#ffff00' } : {}}
        />
      )}
      
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 hover:border-green-400'
          }`}
        >
          {task.completed && <Check size={12} />}
        </button>

        <div className="flex-1 min-w-0">
          {/* Task title and priority */}
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-medium transition-all ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
              {task.title}
            </h3>
            {project && (
              <ProjectBadge project={project} size="sm" />
            )}
            {task.recurring?.enabled && (
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">Recurring</span>
            )}
          </div>

          {/* Task description */}
          {task.description && task.description.trim() && task.description.trim() !== '<p><br></p>' && task.description.trim() !== '<p></p>' && (
            <div className={`mb-2 ${task.completed ? 'opacity-60' : ''}`}>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
              >
                See additional notes
              </button>
              
              {isExpanded && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border">
                  <RichTextEditor
                    value={task.description}
                    onChange={() => {}}
                    readOnly={true}
                  />
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {task.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Task metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
            {task.dueDate && (
              <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : ''}`}>
                <Calendar size={14} />
                <span>{formatDate(new Date(task.dueDate))}</span>
              </div>
            )}

            <div className="flex items-center gap-1">
              <Clock size={14} />
              <span>{new Date(task.createdAt).toLocaleDateString()}</span>
            </div>

            {task.attachments && task.attachments.length > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <span>📎</span>
                <span>{task.attachments.length}</span>
              </div>
            )}

            {task.reminders && task.reminders.length > 0 && (
              <div className="flex items-center gap-1 text-gray-500">
                <span>🔔</span>
                <span>{task.reminders.filter(r => r.enabled && !r.triggered).length}</span>
              </div>
            )}
          </div>

          {/* Subtasks */}
          {hasSubtasks && (
            <div className="mt-3">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-800"
              >
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                <span>{task.subtasks!.length} subtask{task.subtasks!.length !== 1 ? 's' : ''}</span>
              </button>

              {isExpanded && (
                <div className="mt-2 ml-4 space-y-2">
                  {task.subtasks!.map(subtask => (
                    <TaskItem
                      key={subtask.id}
                      task={subtask}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onUpdate={onUpdate}
                      onAddSubtask={onAddSubtask}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          {hasSubtasks && (
            <button
              onClick={handleAddSubtask}
              className="p-1 text-gray-400 hover:text-green-500 transition-colors"
              title="Add subtask"
            >
              <span className="text-sm">+</span>
            </button>
          )}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
            title="Edit task"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this task?')) {
                onDelete(task.id);
              }
            }}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <RichTextEditor
                value={editDescription}
                onChange={setEditDescription}
                placeholder="Add a description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Frame
                </label>
                <select
                  value={editTimeFrame}
                  onChange={(e) => setEditTimeFrame(e.target.value as any)}
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
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <TagInput
                selectedTags={editTags}
                onTagsChange={setEditTags}
                placeholder="Add tags..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              <AttachmentManager
                attachments={task.attachments || []}
                onAttachmentsChange={(attachments) => onUpdate(task.id, { attachments })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminders
              </label>
              <ReminderManager
                reminders={task.reminders || []}
                onRemindersChange={(reminders) => onUpdate(task.id, { reminders })}
                dueDate={editDueDate}
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}