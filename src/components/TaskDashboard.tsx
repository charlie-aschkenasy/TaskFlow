import React from 'react';
import { useState } from 'react';
import { Calendar, Clock, Target, TrendingUp } from 'lucide-react';
import { Task } from '../types';
import { getTaskCountsByTimeframe, sortTasks } from '../utils/taskUtils';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';

interface DashboardProps {
interface TaskDashboardProps {
  tasks: Task[];
  activeListName?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
}

export function TaskDashboard({ 
  tasks, 
  activeListName,
  onToggleTask, 
  onDeleteTask, 
  onUpdateTask, 
  onAddSubtask,
  onAddTask
}: TaskDashboardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filter to only show tasks (not events or assignments)
  const taskOnlyItems = tasks.filter(task => task.type === 'task');
  const counts = getTaskCountsByTimeframe(taskOnlyItems);
  
  // Helper function to get all tasks including subtasks
  const getAllTasksIncludingSubtasks = (taskList: Task[]): Task[] => {
    const allTasks: Task[] = [];
    const flatten = (tasks: Task[]) => {
      tasks.forEach(task => {
        allTasks.push(task);
        flatten(task.subtasks);
      });
    };
    flatten(taskList);
    return allTasks;
  };

  const allTasksWithSubtasks = getAllTasksIncludingSubtasks(taskOnlyItems);
  const completedTasks = allTasksWithSubtasks.filter(task => task.completed);
  const pendingTasks = allTasksWithSubtasks.filter(task => !task.completed);
  const overdueTask = allTasksWithSubtasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  });

  const timeframeData = [
    {
      title: 'Daily Tasks',
      count: counts.daily,
      icon: Clock,
      color: 'bg-blue-500',
      tasks: sortTasks(taskOnlyItems.filter(task => task.timeFrame === 'daily'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
    {
      title: 'Weekly Tasks', 
      count: counts.weekly,
      icon: Calendar,
      color: 'bg-green-500',
      tasks: sortTasks(taskOnlyItems.filter(task => task.timeFrame === 'weekly'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
    {
      title: 'Monthly Tasks',
      count: counts.monthly,
      icon: Target,
      color: 'bg-purple-500',
      tasks: sortTasks(taskOnlyItems.filter(task => task.timeFrame === 'monthly'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
    {
      title: 'Yearly Tasks',
      count: counts.yearly,
      icon: TrendingUp,
      color: 'bg-orange-500',
      tasks: sortTasks(taskOnlyItems.filter(task => task.timeFrame === 'yearly'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {activeListName ? `${activeListName} Task Dashboard` : 'Task Dashboard'}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName ? `Overview of your ${activeListName.toLowerCase()} tasks only` : 'Overview of all your tasks only'}
        </p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{allTasksWithSubtasks.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Target className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-semibold text-green-600">{completedTasks.length}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Clock className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-semibold text-yellow-600">{pendingTasks.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Calendar className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-red-600">{overdueTask.length}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <TrendingUp className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Timeframe Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {timeframeData.map((timeframe) => (
          <div key={timeframe.title} className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${timeframe.color}`}>
                  <timeframe.icon className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{timeframe.title}</h3>
                  <p className="text-sm text-gray-500">
                    {timeframe.count} task{timeframe.count !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 max-h-80 overflow-y-auto">
              {timeframe.tasks.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No {timeframe.title.toLowerCase()} yet
                </p>
              ) : (
                <div className="space-y-3">
                  {timeframe.tasks.map(task => (
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
        ))}
      </div>
    </div>
  );
}