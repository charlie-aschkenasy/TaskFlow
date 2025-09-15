import React, { useState } from 'react';
import { Tag, Plus } from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { useTags } from '../hooks/useTags';
import { sortTasks, getAllTasksIncludingSubtasks } from '../utils/taskUtils';

interface TagViewProps {
  tasks: Task[];
  activeListName?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
}

export function TagView({
  tasks,
  activeListName,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddSubtask,
  onAddTask,
}: TagViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { getTagColor } = useTags();

  // Get all tasks including subtasks for comprehensive tag analysis
  const allTasksWithSubtasks = getAllTasksIncludingSubtasks(tasks);

  // Get all unique tags from tasks
  const allTags = Array.from(
    new Set(
      allTasksWithSubtasks
        .filter(task => task.tags && task.tags.length > 0)
        .flatMap(task => task.tags)
    )
  ).sort();

  // Group tasks by tags
  const getTasksForTag = (tag: string) => {
    const tagTasks = allTasksWithSubtasks.filter(task => 
      task.tags && task.tags.includes(tag)
    );
    return sortTasks(tagTasks, { primary: 'dueDate', primaryAscending: true, secondaryAscending: true });
  };

  // Get tasks with no tags
  const getTasksWithoutTags = () => {
    const noTagTasks = allTasksWithSubtasks.filter(task => 
      !task.tags || task.tags.length === 0
    );
    return sortTasks(noTagTasks, { primary: 'dueDate', primaryAscending: true, secondaryAscending: true });
  };

  const tasksWithoutTags = getTasksWithoutTags();

  // Calculate statistics
  const totalTasks = allTasksWithSubtasks.length;
  const completedTasks = allTasksWithSubtasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;
  const taggedTasks = allTasksWithSubtasks.filter(task => task.tags && task.tags.length > 0).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {activeListName ? `${activeListName} - Tags View` : 'Tags View'}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName 
            ? `Organize your ${activeListName.toLowerCase()} items by tags`
            : 'Organize all your items by tags'
          }
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-900">
              {totalTasks}
            </span>
            <span className="text-gray-500">Total Items</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-blue-600">
              {allTags.length}
            </span>
            <span className="text-gray-500">Tags</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-green-600">
              {completedTasks}
            </span>
            <span className="text-gray-500">Completed</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-yellow-600">
              {pendingTasks}
            </span>
            <span className="text-gray-500">Pending</span>
          </div>
        </div>
      </div>

      {/* Quick Add Task */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Task</h3>
        <TaskForm
          onSubmit={onAddTask}
          onCancel={() => setIsFormOpen(false)}
          isOpen={isFormOpen}
          onToggle={() => setIsFormOpen(!isFormOpen)}
        />
      </div>

      {/* Tag Sections */}
      <div className="space-y-6">
        {/* Tag Sections */}
        {allTags.map(tag => {
          const tagTasks = getTasksForTag(tag);
          const tagColor = getTagColor(tag);
          const completedCount = tagTasks.filter(task => task.completed).length;
          const pendingCount = tagTasks.length - completedCount;

          return (
            <div key={tag} className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: tagColor }}
                  >
                    <Tag className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">#{tag}</h3>
                    <p className="text-sm text-gray-500">
                      {tagTasks.length} task{tagTasks.length !== 1 ? 's' : ''}
                      {completedCount > 0 && (
                        <span className="ml-2">
                          • {completedCount} completed, {pendingCount} pending
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {Math.round((completedCount / tagTasks.length) * 100) || 0}% complete
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: tagColor,
                          width: `${(completedCount / tagTasks.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 max-h-80 overflow-y-auto">
                {tagTasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No tasks with this tag
                  </p>
                ) : (
                  <div className="space-y-3">
                    {tagTasks.slice(0, 10).map(task => (
                      <div key={`${tag}-${task.id}`} className="relative">
                        <TaskItem
                          task={task}
                          onToggle={onToggleTask}
                          onDelete={onDeleteTask}
                          onUpdate={onUpdateTask}
                          onAddSubtask={onAddSubtask}
                        />
                        {/* Show indicator if task has multiple tags */}
                        {task.tags && task.tags.length > 1 && (
                          <div className="absolute top-2 right-2">
                            <span 
                              className="inline-flex items-center px-1.5 py-0.5 text-xs bg-gray-100 text-gray-600 rounded-full"
                              title={`Also tagged: ${task.tags.filter(t => t !== tag).join(', ')}`}
                            >
                              +{task.tags.length - 1}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    {tagTasks.length > 10 && (
                      <p className="text-center text-gray-500 text-sm py-2">
                        And {tagTasks.length - 10} more...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Tasks with No Tags */}
        {tasksWithoutTags.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500">
                  <Tag className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">No Tags</h3>
                  <p className="text-sm text-gray-500">
                    {tasksWithoutTags.length} task{tasksWithoutTags.length !== 1 ? 's' : ''} without tags
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {tasksWithoutTags.map(task => (
                  <TaskItem
                    key={task.id}
                    task={task}
                    onToggle={onToggleTask}
                    onDelete={onDeleteTask}
                    onUpdate={onUpdateTask}
                    onAddSubtask={onAddSubtask}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {allTags.length === 0 && tasksWithoutTags.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Tag size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tasks yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first task with tags to see them organized here
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Task
            </button>
          </div>
        )}

        {/* No Tags State */}
        {allTags.length === 0 && tasksWithoutTags.length > 0 && (
          <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
            <Tag size={32} className="mx-auto text-yellow-500 mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No tags found
            </h3>
            <p className="text-gray-600 mb-4">
              You have {tasksWithoutTags.length} task{tasksWithoutTags.length !== 1 ? 's' : ''} without tags. 
              Add tags to your tasks to see them organized by category.
            </p>
            <p className="text-sm text-gray-500">
              Edit existing tasks or create new ones with tags to use this view effectively.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}