import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Task } from '../types';
import { TaskItem } from './TaskItem';

interface DraggableTaskItemProps {
  task: Task;
  index: number;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
}

export function DraggableTaskItem({
  task,
  index,
  onToggle,
  onDelete,
  onUpdate,
  onAddSubtask,
}: DraggableTaskItemProps) {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`transition-all duration-200 ${
            snapshot.isDragging 
              ? 'rotate-2 scale-105 shadow-2xl z-50' 
              : 'hover:shadow-md'
          }`}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging 
              ? `${provided.draggableProps.style?.transform} rotate(2deg)`
              : provided.draggableProps.style?.transform,
          }}
        >
          <TaskItem
            task={task}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
            onAddSubtask={onAddSubtask}
          />
        </div>
      )}
    </Draggable>
  );
}