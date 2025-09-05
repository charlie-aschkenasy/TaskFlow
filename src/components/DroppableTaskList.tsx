import React from 'react';
import { Droppable } from 'react-beautiful-dnd';
import { Task } from '../types';
import { DraggableTaskItem } from './DraggableTaskItem';

interface DroppableTaskListProps {
  tasks: Task[];
  droppableId: string;
  title: string;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  emptyMessage?: string;
}

export function DroppableTaskList({
  tasks,
  droppableId,
  title,
  onToggle,
  onDelete,
  onUpdate,
  onAddSubtask,
  emptyMessage = "No tasks in this section",
}: DroppableTaskListProps) {
  // Tasks should already be sorted by parent component
  // Don't re-sort here to preserve user's chosen sort order

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        {title}
        <span className="text-sm font-normal text-gray-500">({tasks.length})</span>
      </h3>
      
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`min-h-[100px] rounded-lg border-2 border-dashed transition-all duration-200 ${
              snapshot.isDraggingOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            {tasks.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-gray-500 text-sm">
                {snapshot.isDraggingOver ? 'Drop task here' : emptyMessage}
              </div>
            ) : (
              <div className="p-3 space-y-3">
                {tasks.map((task, index) => (
                  <DraggableTaskItem
                    key={task.id}
                    task={task}
                    index={index}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    onAddSubtask={onAddSubtask}
                  />
                ))}
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}