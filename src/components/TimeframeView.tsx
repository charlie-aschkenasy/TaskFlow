import React, { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Task } from '../types';
import { DroppableTaskList } from './DroppableTaskList';
import { TaskForm } from './TaskForm';
import { sortTasks } from '../utils/taskUtils';

interface TimeframeViewProps {
  timeframe: 'daily' | 'weekly' | 'monthly' | 'yearly';
  tasks: Task[];
  activeListName?: string;
  activeListId?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
  onReorderTasks: (draggableId: string, sourceIndex: number, destinationIndex: number, droppableId: string) => void;
}

export function TimeframeView({
  timeframe,
  tasks,
  activeListName,
  activeListId,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddSubtask,
  onAddTask,
  onReorderTasks,
}: TimeframeViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Filter tasks by timeframe and sort them (completed tasks will be at bottom)
  const timeframeTasks = sortTasks(
    tasks.filter(task => task.timeFrame === timeframe),
    { primary: 'dueDate', primaryAscending: true, secondaryAscending: true }
  );

  const timeframeLabels = {
    daily: 'Daily Tasks',
    weekly: 'Weekly Tasks', 
    monthly: 'Monthly Tasks',
    yearly: 'Yearly Tasks',
  };

  const timeframeDescriptions = {
    daily: 'Tasks to complete today',
    weekly: 'Tasks to complete this week',
    monthly: 'Tasks to complete this month',
    yearly: 'Tasks to complete this year',
  };

  const completedTasks = timeframeTasks.filter(task => task.completed);
  const pendingTasks = timeframeTasks.filter(task => !task.completed);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Handle moving between different sections (pending/completed)
    if (source.droppableId !== destination.droppableId) {
      const isMovingToCompleted = destination.droppableId === 'completed';
      onUpdateTask(draggableId, { completed: isMovingToCompleted });
      return;
    }

    // Handle reordering within the same section
    onReorderTasks(draggableId, source.index, destination.index, source.droppableId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {activeListName ? `${activeListName} - ${timeframeLabels[timeframe]}` : timeframeLabels[timeframe]}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName 
            ? `${activeListName} ${timeframeDescriptions[timeframe].toLowerCase()}`
            : timeframeDescriptions[timeframe]
          }
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-900">
              {timeframeTasks.length}
            </span>
            <span className="text-gray-500">Total</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-green-600">
              {completedTasks.length}
            </span>
            <span className="text-gray-500">Completed</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-yellow-600">
              {pendingTasks.length}
            </span>
            <span className="text-gray-500">Pending</span>
          </div>
        </div>
      </div>

      {/* Add Task Form */}
      <TaskForm
        onSubmit={onAddTask}
        onCancel={() => setIsFormOpen(false)}
        defaultTimeFrame={timeframe}
        isOpen={isFormOpen}
        onToggle={() => setIsFormOpen(!isFormOpen)}
      />

      {/* Tasks List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {timeframeTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-400">📝</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {timeframe} tasks yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first {timeframe} task to get started
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Task
            </button>
          </div>
        ) : (
          <>
            {/* All Tasks (pending first, completed at bottom) */}
            <DroppableTaskList
              tasks={timeframeTasks}
              droppableId="timeframe-tasks"
              title={timeframeLabels[timeframe]}
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onUpdate={onUpdateTask}
              onAddSubtask={onAddSubtask}
              emptyMessage={`No ${timeframe} tasks`}
            />
          </>
        )}
      </DragDropContext>
    </div>
  );
}