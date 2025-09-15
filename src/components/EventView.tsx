import React, { useState } from 'react';
import { Calendar, Plus } from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { sortTasks, getAllTasksIncludingSubtasks } from '../utils/taskUtils';

interface EventViewProps {
  tasks: Task[];
  activeListName?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
}

export function EventView({
  tasks,
  activeListName,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddSubtask,
  onAddTask,
}: EventViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Get all tasks including subtasks and filter for events only
  const allTasksWithSubtasks = getAllTasksIncludingSubtasks(tasks);
  const events = allTasksWithSubtasks.filter(task => task.type === 'event');
  
  // Sort events by due date, then by creation date
  const sortedEvents = sortTasks(events, { 
    primary: 'dueDate', 
    primaryAscending: true, 
    secondary: 'createdAt',
    secondaryAscending: false 
  });

  // Separate upcoming and past events
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingEvents = sortedEvents.filter(event => {
    if (!event.dueDate) return true; // Events without dates go to upcoming
    const eventDate = new Date(event.dueDate);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate >= today;
  });

  const pastEvents = sortedEvents.filter(event => {
    if (!event.dueDate) return false;
    const eventDate = new Date(event.dueDate);
    eventDate.setHours(0, 0, 0, 0);
    return eventDate < today;
  });

  // Calculate statistics
  const totalEvents = events.length;
  const completedEvents = events.filter(event => event.completed).length;
  const pendingEvents = totalEvents - completedEvents;

  const handleAddEvent = (eventData: any) => {
    onAddTask({
      ...eventData,
      type: 'event', // Force type to be 'event'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {activeListName ? `${activeListName} - Events` : 'Events'}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName 
            ? `Manage your ${activeListName.toLowerCase()} events and appointments`
            : 'Manage all your events and appointments in one place'
          }
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-900">
              {totalEvents}
            </span>
            <span className="text-gray-500">Total Events</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-purple-600">
              {upcomingEvents.length}
            </span>
            <span className="text-gray-500">Upcoming</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-green-600">
              {completedEvents}
            </span>
            <span className="text-gray-500">Completed</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-600">
              {pastEvents.length}
            </span>
            <span className="text-gray-500">Past</span>
          </div>
        </div>
      </div>

      {/* Quick Add Event */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Event</h3>
        <TaskForm
          onSubmit={handleAddEvent}
          onCancel={() => setIsFormOpen(false)}
          isOpen={isFormOpen}
          onToggle={() => setIsFormOpen(!isFormOpen)}
          defaultType="event"
          hideTypeSelector={true}
        />
      </div>

      {/* Events Sections */}
      <div className="space-y-6">
        {/* Upcoming Events */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500">
                <Calendar className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Upcoming Events</h3>
                <p className="text-sm text-gray-500">
                  {upcomingEvents.length} event{upcomingEvents.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-center text-gray-500 text-sm">
                  No upcoming events
                </p>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-2 text-purple-500 hover:text-purple-600 text-sm font-medium"
                >
                  Add your first event
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <TaskItem
                    key={event.id}
                    task={event}
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

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gray-500">
                  <Calendar className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Past Events</h3>
                  <p className="text-sm text-gray-500">
                    {pastEvents.length} event{pastEvents.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {pastEvents.map(event => (
                  <TaskItem
                    key={event.id}
                    task={event}
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
        {totalEvents === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
              <Calendar size={32} className="text-purple-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No events yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first event to get started with event management
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Add Event
            </button>
          </div>
        )}
      </div>
    </div>
  );
}