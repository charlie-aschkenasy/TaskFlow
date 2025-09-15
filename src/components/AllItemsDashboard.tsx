import React, { useState } from 'react';
import { Calendar, Clock, Target, TrendingUp, BookOpen, Pencil } from 'lucide-react';
import { Task } from '../types';
import { getTaskCountsByTimeframe, sortTasks } from '../utils/taskUtils';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { ToggleSwitch } from './ToggleSwitch';

interface AllItemsDashboardProps {
  tasks: Task[];
  activeListName?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
}

export function AllItemsDashboard({ 
  tasks, 
  activeListName,
  onToggleTask, 
  onDeleteTask, 
  onUpdateTask, 
  onAddSubtask,
  onAddTask
}: AllItemsDashboardProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showTasks, setShowTasks] = useState(true);
  const [showEvents, setShowEvents] = useState(true);
  const [showAssignments, setShowAssignments] = useState(true);

  // Filter tasks based on type toggles
  const getFilteredTasks = () => {
    return tasks.filter(task => {
      if (task.type === 'task' && !showTasks) return false;
      if (task.type === 'event' && !showEvents) return false;
      if (task.type === 'assignment' && !showAssignments) return false;
      return true;
    });
  };

  const filteredTasks = getFilteredTasks();
  const counts = getTaskCountsByTimeframe(filteredTasks);
  
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

  const allTasksWithSubtasks = getAllTasksIncludingSubtasks(filteredTasks);
  const completedTasks = allTasksWithSubtasks.filter(task => task.completed);
  const pendingTasks = allTasksWithSubtasks.filter(task => !task.completed);
  const overdueTask = allTasksWithSubtasks.filter(task => {
    if (!task.dueDate || task.completed) return false;
    return new Date(task.dueDate) < new Date();
  });

  // Get type-specific counts
  const taskCount = allTasksWithSubtasks.filter(item => item.type === 'task').length;
  const eventCount = allTasksWithSubtasks.filter(item => item.type === 'event').length;
  const assignmentCount = allTasksWithSubtasks.filter(item => item.type === 'assignment').length;

  const timeframeData = [
    {
      title: 'Daily Items',
      count: counts.daily,
      icon: Clock,
      color: 'bg-blue-500',
      tasks: sortTasks(filteredTasks.filter(task => task.timeFrame === 'daily'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
    {
      title: 'Weekly Items', 
      count: counts.weekly,
      icon: Calendar,
      color: 'bg-green-500',
      tasks: sortTasks(filteredTasks.filter(task => task.timeFrame === 'weekly'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
    {
      title: 'Monthly Items',
      count: counts.monthly,
      icon: Target,
      color: 'bg-purple-500',
      tasks: sortTasks(filteredTasks.filter(task => task.timeFrame === 'monthly'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
    {
      title: 'Yearly Items',
      count: counts.yearly,
      icon: TrendingUp,
      color: 'bg-orange-500',
      tasks: sortTasks(filteredTasks.filter(task => task.timeFrame === 'yearly'), { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {activeListName ? `${activeListName} Dashboard` : 'Dashboard'}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName 
            ? `Overview of your ${activeListName.toLowerCase()} tasks, events, and assignments`
            : 'Overview of all your tasks, events, and assignments'
          }
        </p>
      </div>

      {/* Type Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Show/Hide Item Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ToggleSwitch
            checked={showTasks}
            onChange={setShowTasks}
            label={`Tasks (${taskCount})`}
            description="Show/hide regular tasks"
          />
          <ToggleSwitch
            checked={showEvents}
            onChange={setShowEvents}
            label={`Events (${eventCount})`}
            description="Show/hide events"
          />
          <ToggleSwitch
            checked={showAssignments}
            onChange={setShowAssignments}
            label={`Assignments (${assignmentCount})`}
            description="Show/hide assignments"
          />
        </div>
      </div>

      {/* Quick Add Item */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Item</h3>
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
              <p className="text-sm font-medium text-gray-600">Total Items</p>
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

      {/* Type Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Tasks</p>
              <p className="text-2xl font-semibold text-gray-900">{taskCount}</p>
            </div>
            <div className="bg-gray-100 p-3 rounded-lg">
              <Pencil className="text-gray-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Events</p>
              <p className="text-2xl font-semibold text-blue-600">{eventCount}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Assignments</p>
              <p className="text-2xl font-semibold text-purple-600">{assignmentCount}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <BookOpen className="text-purple-600" size={24} />
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
                    {timeframe.count} item{timeframe.count !== 1 ? 's' : ''}
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