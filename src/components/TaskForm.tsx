import React, { useState } from 'react';
import { BookOpen, Plus } from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { sortTasks, getAllTasksIncludingSubtasks } from '../utils/taskUtils';

interface AssignmentViewProps {
  tasks: Task[];
  activeListName?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
}

export function AssignmentView({
  tasks,
  activeListName,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddSubtask,
  onAddTask,
}: AssignmentViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Get all tasks including subtasks and filter for assignments only
  const allTasksWithSubtasks = getAllTasksIncludingSubtasks(tasks);
  const assignments = allTasksWithSubtasks.filter(task => task.type === 'assignment');
  
  // Sort assignments by due date, then by creation date
  const sortedAssignments = sortTasks(assignments, { 
    primary: 'dueDate', 
    primaryAscending: true, 
    secondary: 'createdAt',
    secondaryAscending: false 
  });

  // Separate assignments by status
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const overdueAssignments = sortedAssignments.filter(assignment => {
    if (!assignment.dueDate || assignment.completed) return false;
    const dueDate = new Date(assignment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  });

  const upcomingAssignments = sortedAssignments.filter(assignment => {
    if (assignment.completed) return false;
    if (!assignment.dueDate) return true; // Assignments without dates go to upcoming
    const dueDate = new Date(assignment.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today;
  });

  const completedAssignments = sortedAssignments.filter(assignment => assignment.completed);

  // Calculate statistics
  const totalAssignments = assignments.length;
  const pendingAssignments = totalAssignments - completedAssignments.length;

  const handleAddAssignment = (assignmentData: any) => {
    onAddTask({
      ...assignmentData,
      type: 'assignment', // Force type to be 'assignment'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {activeListName ? `${activeListName} - Assignments` : 'Assignments'}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName 
            ? `Manage your ${activeListName.toLowerCase()} assignments and coursework`
            : 'Manage all your assignments and coursework in one place'
          }
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-900">
              {totalAssignments}
            </span>
            <span className="text-gray-500">Total Assignments</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-red-600">
              {overdueAssignments.length}
            </span>
            <span className="text-gray-500">Overdue</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-orange-600">
              {upcomingAssignments.length}
            </span>
            <span className="text-gray-500">Upcoming</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-green-600">
              {completedAssignments.length}
            </span>
            <span className="text-gray-500">Completed</span>
          </div>
        </div>
      </div>

      {/* Quick Add Assignment */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
            className={`flex-1 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed ${
              taskType === 'event'
                ? 'bg-purple-500 hover:bg-purple-600 focus:ring-purple-500'
                : taskType === 'assignment'
                ? 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500'
                : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
            }`}
        <TaskForm
          onSubmit={handleAddAssignment}
          onCancel={() => setIsFormOpen(false)}
          isOpen={isFormOpen}
          onToggle={() => setIsFormOpen(!isFormOpen)}
        />
      </div>

      {/* Assignment Sections */}
      <div className="space-y-6">
        {/* Overdue Assignments */}
        {overdueAssignments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-500">
                  <BookOpen className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Overdue Assignments</h3>
                  <p className="text-sm text-gray-500">
                    {overdueAssignments.length} assignment{overdueAssignments.length !== 1 ? 's' : ''} past due
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {overdueAssignments.map(assignment => (
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
            </div>
          </div>
        )}

        {/* Upcoming Assignments */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500">
                <BookOpen className="text-white" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Upcoming Assignments</h3>
                <p className="text-sm text-gray-500">
                  {upcomingAssignments.length} assignment{upcomingAssignments.length !== 1 ? 's' : ''} to complete
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-4 max-h-96 overflow-y-auto">
            {upcomingAssignments.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen size={32} className="mx-auto text-gray-400 mb-3" />
                <p className="text-center text-gray-500 text-sm">
                  No upcoming assignments
                </p>
                <button
                  onClick={() => setIsFormOpen(true)}
                  className="mt-2 text-orange-500 hover:text-orange-600 text-sm font-medium"
                >
                  Add your first assignment
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingAssignments.map(assignment => (
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

        {/* Completed Assignments */}
        {completedAssignments.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-green-500">
                  <BookOpen className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Completed Assignments</h3>
                  <p className="text-sm text-gray-500">
                    {completedAssignments.length} assignment{completedAssignments.length !== 1 ? 's' : ''} completed
                  </p>
                </div>
              </div>
            </div>
            
            <div className="p-4 max-h-80 overflow-y-auto">
              <div className="space-y-3">
                {completedAssignments.map(assignment => (
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
            </div>
          </div>
        )}

        {/* Empty State */}
        {totalAssignments === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
              <BookOpen size={32} className="text-orange-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No assignments yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first assignment to get started with coursework management
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-orange-500 text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition-colors"
            >
              Add Assignment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}