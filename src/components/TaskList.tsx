import React, { useState } from 'react';
import { useEffect } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Task, FilterState, SortConfig } from '../types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { FilterSort } from './FilterSort';
import { DroppableTaskList } from './DroppableTaskList';
import { filterTasks, sortTasks } from '../utils/taskUtils';

interface TaskListProps {
  tasks: Task[];
  activeListName?: string;
  activeListId?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
  onReorderTasks: (draggableId: string, sourceIndex: number, destinationIndex: number, droppableId: string) => void;
  onMoveTaskToList: (taskId: string, newListId: string, newTimeFrame?: string) => void;
  allTasksForFilters: Task[];
}

export function TaskList({
  tasks,
  activeListName,
  activeListId,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddSubtask,
  onAddTask,
  onReorderTasks,
  onMoveTaskToList,
  allTasksForFilters,
}: TaskListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    timeFrame: 'all',
    project: 'all',
    completed: 'all',
    priority: 'all',
    searchQuery: '',
    tags: [],
    type: ['task', 'event', 'assignment'], // Show all types by default
  });
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    primary: 'dueDate',
    primaryAscending: true,
    secondary: undefined,
    secondaryAscending: true,
  });

  const filteredTasks = filterTasks(tasks, filters);
  // Apply sorting with completed tasks automatically at bottom
  const sortedTasks = sortTasks(filteredTasks, sortConfig);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // If dropped in the same position, do nothing
    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    // Handle moving between different sections (pending/completed)
    if (source.droppableId !== destination.droppableId) {
      const task = sortedTasks.find(t => t.id === draggableId);
      if (!task) return;

      // Update task completion status based on destination
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
          {activeListName ? `${activeListName} Tasks` : 'All Tasks'}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName ? `Manage your ${activeListName.toLowerCase()} tasks` : 'Manage all your tasks in one place'}
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-900">
              {sortedTasks.length}
            </span>
            <span className="text-gray-500">
              {filters.searchQuery || Object.values(filters).some(v => v !== 'all' && v !== '') 
                ? 'Filtered' : 'Total'}
            </span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-green-600">
              {sortedTasks.filter(task => task.completed).length}
            </span>
            <span className="text-gray-500">Completed</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-yellow-600">
              {sortedTasks.filter(task => !task.completed).length}
            </span>
            <span className="text-gray-500">Pending</span>
          </div>
        </div>
      </div>

      {/* Filter and Sort */}
      <FilterSort
        filters={filters}
        onFiltersChange={setFilters}
        sortConfig={sortConfig}
        onSortChange={setSortConfig}
        isCollapsed={isFilterCollapsed}
        onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
        allTasks={allTasksForFilters}
      />

      {/* Add Task Form */}
      <TaskForm
        onSubmit={onAddTask}
        onCancel={() => setIsFormOpen(false)}
        isOpen={isFormOpen}
        onToggle={() => setIsFormOpen(!isFormOpen)}
      />

      {/* Tasks List */}
      <DragDropContext onDragEnd={handleDragEnd}>
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl text-gray-400">🔍</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {Object.values(filters).some(v => v !== 'all' && v !== '') || filters.searchQuery
                ? 'No tasks match your filters'
                : 'No tasks yet'}
            </h3>
            <p className="text-gray-500 mb-4">
              {Object.values(filters).some(v => v !== 'all' && v !== '') || filters.searchQuery
                ? 'Try adjusting your filters to see more tasks'
                : 'Create your first task to get started'}
            </p>
            {!Object.values(filters).some(v => v !== 'all' && v !== '') && !filters.searchQuery && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Add Task
              </button>
            )}
          </div>
        ) : (
          <>
            {/* All Tasks (pending first, completed at bottom) */}
            <DroppableTaskList
              tasks={sortedTasks}
              droppableId="all-tasks"
              title="All Tasks"
              onToggle={onToggleTask}
              onDelete={onDeleteTask}
              onUpdate={onUpdateTask}
              onAddSubtask={onAddSubtask}
              emptyMessage="No tasks"
            />
          </>
        )}
      </DragDropContext>
    </div>
  );
}