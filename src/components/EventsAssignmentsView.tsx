import React, { useState } from 'react';
import { Calendar, BookOpen, Plus } from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { sortTasks, getAllTasksIncludingSubtasks } from '../utils/taskUtils';

interface EventsAssignmentsViewProps {
  tasks: Task[];
  activeListName?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
}

export function EventsAssignmentsView({
  tasks,
  activeListName,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddSubtask,
  onAddTask,
}: EventsAssignmentsViewProps) {
  const [isEventFormOpen, setIsEventFormOpen] = useState(false);
  const [isAssignmentFormOpen, setIsAssignmentFormOpen] = useState(false);

  // Get all tasks including subtasks for comprehensive analysis
  const allTasksWithSubtasks = getAllTasksIncludingSubtasks(tasks);

  // Filter tasks by type
  const events = sortTasks(
    allTasksWithSubtasks.filter(task => task.type === 'event'),
    { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }
  );

  const assignments = sortTasks(
    allTasksWithSubtasks.filter(task => task.type === 'assignment'),
    { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }
  );

  // Calculate statistics
  const totalEvents = events.length;
  const completedEvents = events.filter(task => task.completed).length;
  const pendingEvents = totalEvents - completedEvents;

  const totalAssignments = assignments.length;
  const completedAssignments = assignments.filter(task => task.completed).length;
  const pendingAssignments = totalAssignments - completedAssignments;

  const handleAddEvent = (taskData: any) => {
    onAddTask({
      ...taskData,
      type: 'event',
    });
    setIsEventFormOpen(false);
  };

  const handleAddAssignment = (taskData: any) => {
    onAddTask({
      ...taskData,
      type: 'assignment',
    });
    setIsAssignmentFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {activeListName ? `${activeListName} - Events & Assignments` : 'Events & Assignments'}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName 
            ? `Manage your ${activeListName.toLowerCase()} events and assignments`
            : 'Manage all your events and assignments in one place'
          }
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="block text-2xl font-semibold text-blue-600">
              {totalEvents}
            </span>
            <span className="text-gray-500">Events</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-purple-600">
              {totalAssignments}
            </span>
            <span className="text-gray-500">Assignments</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-green-600">
              {completedEvents + completedAssignments}
            </span>
            <span className="text-gray-500">Completed</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-yellow-600">
              {pendingEvents + pendingAssignments}
            </span>
            <span className="text-gray-500">Pending</span>
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="flex gap-4 justify-center">
        <button
          onClick={() => setIsEventFormOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          <Calendar size={20} />
          Add New Event
        </button>
        <button
          onClick={() => setIsAssignmentFormOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors font-medium"
        >
          <BookOpen size={20} />
          Add New Assignment
        </button>
      </div>

      {/* Event Form */}
      {isEventFormOpen && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Event</h3>
          <TaskForm
            onSubmit={handleAddEvent}
            onCancel={() => setIsEventFormOpen(false)}
            isOpen={true}
            onToggle={() => setIsEventFormOpen(false)}
            itemType="event"
          />
        </div>
      )}

      {/* Assignment Form */}
      {isAssignmentFormOpen && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Assignment</h3>
          <TaskForm
            onSubmit={handleAddAssignment}
            onCancel={() => setIsAssignmentFormOpen(false)}
            isOpen={true}
            onToggle={() => setIsAssignmentFormOpen(false)}
            itemType="assignment"
          />
        </div>
      )}

      {/* Events and Assignments Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Events Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500">
                <Calendar className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Events</h3>
                <p className="text-sm text-gray-500">
                  {totalEvents} event{totalEvents !== 1 ? 's' : ''}
                  {completedEvents > 0 && (
                    <span className="ml-2">
                      • {completedEvents} completed, {pendingEvents} pending
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {Math.round((completedEvents / totalEvents) * 100) || 0}% complete
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                    style={{ 
                      width: `${(completedEvents / totalEvents) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {events.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-center text-gray-500 text-sm">
                  No events yet
                </p>
                <button
                  onClick={() => setIsEventFormOpen(true)}
                  className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                >
                  Add your first event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map(task => (
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

        {/* Assignments Section */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500">
                <BookOpen className="text-white" size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Assignments</h3>
                <p className="text-sm text-gray-500">
                  {totalAssignments} assignment{totalAssignments !== 1 ? 's' : ''}
                  {completedAssignments > 0 && (
                    <span className="ml-2">
                      • {completedAssignments} completed, {pendingAssignments} pending
                    </span>
                  )}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">
                  {Math.round((completedAssignments / totalAssignments) * 100) || 0}% complete
                </div>
                <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                  <div 
                    className="h-2 rounded-full transition-all duration-300 bg-purple-500"
                    style={{ 
                      width: `${(completedAssignments / totalAssignments) * 100}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {assignments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-center text-gray-500 text-sm">
                  No assignments yet
                </p>
                <button
                  onClick={() => setIsAssignmentFormOpen(true)}
                  className="mt-2 text-purple-500 hover:text-purple-600 text-sm font-medium"
                >
                  Add your first assignment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {assignments.map(task => (
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
      </div>

      {/* Empty State */}
      {events.length === 0 && assignments.length === 0 && (
        <div className="text-center py-12">
          <div className="flex justify-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Calendar size={24} className="text-blue-500" />
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <BookOpen size={24} className="text-purple-500" />
            </div>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No events or assignments yet
          </h3>
          <p className="text-gray-500 mb-4">
            Create your first event or assignment to get started
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => setIsEventFormOpen(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Event
            </button>
            <button
              onClick={() => setIsAssignmentFormOpen(true)}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Add Assignment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}