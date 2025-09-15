import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Task } from '../types';
import { sortTasks } from '../utils/taskUtils';
import { TaskItem } from './TaskItem';
import { AssignmentForm } from './AssignmentForm';

interface AssignmentCalendarViewProps {
  tasks: Task[];
  activeListName?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
}

export function AssignmentCalendarView({
  tasks,
  activeListName,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddSubtask,
  onAddTask,
}: AssignmentCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Get all tasks including subtasks for calendar display, filtered for assignments only
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

  const allTasksWithSubtasks = getAllTasksIncludingSubtasks(tasks);
  const assignmentsWithDueDates = allTasksWithSubtasks.filter(task => {
    return task.type === 'assignment' && task.dueDate && task.dueDate.trim() !== '';
  });

  // Calendar helper functions
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getAssignmentsForDate = (dateStr: string) => {
    const dateAssignments = assignmentsWithDueDates.filter(assignment => {
      const assignmentDueDate = assignment.dueDate;
      if (!assignmentDueDate) return false;
      
      // Handle both full ISO dates and date-only strings
      const assignmentDateStr = assignmentDueDate.includes('T') 
        ? assignmentDueDate.split('T')[0] 
        : assignmentDueDate;
      
      return assignmentDateStr === dateStr;
    });
    return sortTasks(dateAssignments, { primary: 'createdAt', primaryAscending: false, secondaryAscending: true });
  };

  const isToday = (dateStr: string) => {
    return dateStr === formatDateKey(new Date());
  };

  const isOverdue = (dateStr: string) => {
    return new Date(dateStr) < new Date() && dateStr !== formatDateKey(new Date());
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(formatDateKey(new Date()));
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      days.push(date);
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const selectedDateAssignments = selectedDate ? getAssignmentsForDate(selectedDate) : [];

  const handleAddAssignment = (assignmentData: any) => {
    onAddTask({
      ...assignmentData,
      type: 'assignment', // Force type to be 'assignment'
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Add Assignment */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Assignment</h3>
            <AssignmentForm
              onSubmit={handleAddAssignment}
              onCancel={() => setIsFormOpen(false)}
              isOpen={isFormOpen}
              onToggle={() => setIsFormOpen(!isFormOpen)}
            />
          </div>

          {/* Selected Date Assignments */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-orange-500" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h3>
                </div>
                {isToday(selectedDate) && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    Today
                  </span>
                )}
                {isOverdue(selectedDate) && (
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                    Overdue
                  </span>
                )}
              </div>
              
              <div className="p-4 max-h-96 overflow-y-auto">
                {selectedDateAssignments.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <CalendarIcon size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No assignments due on this date</p>
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="mt-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
                    >
                      Add an assignment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedDateAssignments.length} assignment{selectedDateAssignments.length !== 1 ? 's' : ''}
                      </span>
                      <div className="flex gap-2 text-xs">
                        <span className="text-green-600">
                          {selectedDateAssignments.filter(t => t.completed).length} completed
                        </span>
                        <span className="text-yellow-600">
                          {selectedDateAssignments.filter(t => !t.completed).length} pending
                        </span>
                      </div>
                    </div>
                    
                    {selectedDateAssignments.map(assignment => (
                      <TaskItem
                        key={assignment.id}
                        task={assignment}
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
          )}

          {/* Calendar Legend */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
                <span>Today</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-50 border border-blue-500 rounded"></div>
                <span>Selected Date</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-100 rounded"></div>
                <span>Completed Assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 rounded"></div>
                <span>Overdue Assignments</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span>Pending Assignments</span>
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border">
            {/* Calendar Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h3>
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
                >
                  Today
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={goToNextMonth}
                  className="p-2 hover:bg-gray-100 rounded transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>

            {/* Calendar Grid */}
            <div className="p-4">
              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="p-2 h-24"></div>;
                  }

                  const dateStr = formatDateKey(date);
                  const dayAssignments = getAssignmentsForDate(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isTodayDate = isToday(dateStr);
                  const isOverdueDate = isOverdue(dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`p-2 h-24 border rounded-lg text-left transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50'
                          : isTodayDate
                          ? 'border-blue-300 bg-blue-25'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isTodayDate ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      {dayAssignments.length > 0 && (
                        <div className="space-y-1">
                          {dayAssignments.slice(0, 2).map(assignment => (
                            <div
                              key={assignment.id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${
                                assignment.completed
                                  ? 'bg-green-100 text-green-700'
                                  : isOverdueDate
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                              title={assignment.title}
                            >
                              {assignment.title}
                            </div>
                          ))}
                          {dayAssignments.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayAssignments.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}