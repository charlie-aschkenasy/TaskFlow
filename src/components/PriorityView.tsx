import React, { useState } from 'react';
import { AlertTriangle, Minus, ArrowDown } from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { sortTasks, getAllTasksIncludingSubtasks } from '../utils/taskUtils';

interface PriorityViewProps {
  tasks: Task[];
  activeListName?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
}

export function PriorityView({
  tasks,
  activeListName,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddSubtask,
  onAddTask,
}: PriorityViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<'high' | 'medium' | 'low'>('high');

  // Get all tasks including subtasks for comprehensive priority analysis
  const allTasksWithSubtasks = getAllTasksIncludingSubtasks(tasks);

  const priorityData = [
    {
      title: 'High Priority',
      priority: 'high' as const,
      icon: AlertTriangle,
      color: 'bg-red-500',
      tasks: sortTasks(allTasksWithSubtasks.filter(task => task.priority === 'high'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
    {
      title: 'Medium Priority',
      priority: 'medium' as const,
      icon: Minus,
      color: 'bg-yellow-500',
      tasks: sortTasks(allTasksWithSubtasks.filter(task => task.priority === 'medium'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
    {
      title: 'Low Priority',
      priority: 'low' as const,
      icon: ArrowDown,
      color: 'bg-blue-500',
      tasks: sortTasks(allTasksWithSubtasks.filter(task => task.priority === 'low'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
  ];

  // Calculate statistics
  const totalTasks = allTasksWithSubtasks.length;
  const completedTasks = allTasksWithSubtasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  const handleAddTaskWithPriority = (taskData: any) => {
    onAddTask({
      ...taskData,
      priority: selectedPriority,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {activeListName ? `${activeListName} - Priority View` : 'Priority View'}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName 
            ? `Organize your ${activeListName.toLowerCase()} tasks by priority`
            : 'Organize all your tasks by priority level'
          }
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-900">
              {totalTasks}
            </span>
            <span className="text-gray-500">Total Tasks</span>
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
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Quick Add Task</h3>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Priority:</span>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value as 'high' | 'medium' | 'low')}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        <TaskForm
          onSubmit={handleAddTaskWithPriority}
          onCancel={() => setIsFormOpen(false)}
          isOpen={isFormOpen}
          onToggle={() => setIsFormOpen(!isFormOpen)}
        />
      </div>

      {/* Priority Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {priorityData.map((priority) => {
          const completedCount = priority.tasks.filter(task => task.completed).length;
          const pendingCount = priority.tasks.length - completedCount;

          return (
            <div key={priority.priority} className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${priority.color}`}>
                    <priority.icon className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{priority.title}</h3>
                    <p className="text-sm text-gray-500">
                      {priority.tasks.length} task{priority.tasks.length !== 1 ? 's' : ''}
                      {completedCount > 0 && (
                        <span className="ml-2">
                          • {completedCount} completed, {pendingCount} pending
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {Math.round((completedCount / priority.tasks.length) * 100) || 0}% complete
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${priority.color}`}
                        style={{ 
                          width: `${(completedCount / priority.tasks.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 max-h-96 overflow-y-auto">
                {priority.tasks.length === 0 ? (
                  <div className="text-center py-8">
                    <priority.icon size={32} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-center text-gray-500 text-sm">
                      No {priority.title.toLowerCase()} tasks
                    </p>
                    <button
                      onClick={() => {
                        setSelectedPriority(priority.priority);
                        setIsFormOpen(true);
                      }}
                      className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      Add a task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {priority.tasks.map(task => (
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
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {totalTasks === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertTriangle size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No tasks yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first task to see it organized by priority
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Task
          </button>
        </div>
      )}
    </div>
  );
}