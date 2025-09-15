import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon } from 'lucide-react';
import { Task } from '../types';
import { sortTasks } from '../utils/taskUtils';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';

interface CalendarViewProps {
  tasks: Task[];
  activeListName?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
}

export function CalendarView({
  tasks,
  activeListName,
                        : 'border-gray-200 hover:border-gray-300'
}: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
                    <div className={`text-sm font-medium mb-1 ${
                      isTodayDate ? 'text-blue-600' : 'text-gray-900'
                    }
  // Get all tasks including subtasks for calendar display
  const getAllTasksIncludingSubtasks = (taskList: Task[]): Task[] => {
    const allTasks: Task[] = [];
    const flatten = (tasks: Task[]) => {
      tasks.forEach(task => {
        allTasks.push(task);
        flatten(task.subtasks);
      });
      type: task.type || 'task',
      type: task.type || 'task',
    };
    flatten(taskList);
    return allTasks;
  };

  const allTasksWithSubtasks = getAllTasksIncludingSubtasks(tasks);
  const tasksWithDueDates = allTasksWithSubtasks.filter(task => {
    console.log('Task:', task.title, 'Due Date:', task.dueDate, 'Type:', typeof task.dueDate);
    return task.dueDate && task.dueDate.trim() !== '';
  });

  console.log('All tasks:', allTasksWithSubtasks.length);
  console.log('Tasks with due dates:', tasksWithDueDates.length);
  console.log('Sample task with due date:', tasksWithDueDates[0]);

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

  const getTasksForDate = (dateStr: string) => {
    const dateTasks = tasksWithDueDates.filter(task => {
      const taskDueDate = task.dueDate;
      if (!taskDueDate) return false;
      
      // Handle both full ISO dates and date-only strings
      const taskDateStr = taskDueDate.includes('T') 
        ? taskDueDate.split('T')[0] 
        : taskDueDate;
      
      return taskDateStr === dateStr;
    });
    return sortTasks(dateTasks, { primary: 'createdAt', primaryAscending: false, secondaryAscending: true });
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

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {activeListName ? `${activeListName} Calendar` : 'Calendar View'}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName 
            ? `Visual overview of your ${activeListName.toLowerCase()} tasks with due dates`
            : 'Visual overview of all your tasks with due dates'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Quick Add Task */}
          <div className="bg-white rounded-lg shadow-sm border p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Task</h3>
            <TaskForm
              onSubmit={onAddTask}
              onCancel={() => setIsFormOpen(false)}
              defaultTimeFrame="daily"
              isOpen={isFormOpen}
              onToggle={() => setIsFormOpen(!isFormOpen)}
            />
          </div>

          {/* Selected Date Tasks */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-blue-500" />
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
                {selectedDateTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                      <CalendarIcon size={24} className="text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm">No tasks due on this date</p>
                    <button
                      onClick={() => setIsFormOpen(true)}
                      className="mt-2 text-blue-500 hover:text-blue-600 text-sm font-medium"
                    >
                      Add a task
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        {selectedDateTasks.length} task{selectedDateTasks.length !== 1 ? 's' : ''}
                      </span>
                      <div className="flex gap-2 text-xs">
                        <span className="text-green-600">
                          {selectedDateTasks.filter(t => t.completed).length} completed
                        </span>
                        <span className="text-yellow-600">
                          {selectedDateTasks.filter(t => !t.completed).length} pending
                        </span>
                      </div>
                    </div>
                    
                    {selectedDateTasks.map(task => (
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
                <span>Completed Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-100 rounded"></div>
                <span>Overdue Tasks</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gray-100 rounded"></div>
                <span>Pending Tasks</span>
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
                  className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
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
                  const dayTasks = getTasksForDate(dateStr);
                  const isSelected = selectedDate === dateStr;
                  const isTodayDate = isToday(dateStr);
                  const isOverdueDate = isOverdue(dateStr);

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`p-2 h-24 border rounded-lg text-left transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : isTodayDate
                          ? 'border-blue-300 bg-blue-25'
                        : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                    <div className={`text-sm font-medium mb-1 ${
                      isTodayDate ? 'text-blue-600' : 'text-gray-900'
                    }
                    <div className={`text-sm font-medium mb-1 ${
                      isTodayDate ? 'text-blue-600' : 'text-gray-900'
                    }`}>
                        {date.getDate()}
                      </div>
                      
                      {dayTasks.length > 0 && (
                        <div className="space-y-1">
                          {dayTasks.slice(0, 2).map(task => (
                            <div
                              key={task.id}
                              className={`text-xs px-1 py-0.5 rounded truncate ${
                                task.completed
                                  ? 'bg-green-100 text-green-700'
                                  : isOverdueDate
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                              title={task.title}
                            >
                              {task.title}
                            </div>
                          ))}
                          {dayTasks.length > 2 && (
                            <div className="text-xs text-gray-500">
                              +{dayTasks.length - 2} more
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  );
                }
                )
                }
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
  )
}