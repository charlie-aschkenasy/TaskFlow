import React from 'react';
import { CalendarView } from './components/CalendarView';

function App() {
  // Mock data and handlers for now - these would come from your actual app state
  const mockTasks = [];
  const mockHandlers = {
    onToggleTask: (id: string) => console.log('Toggle task:', id),
    onDeleteTask: (id: string) => console.log('Delete task:', id),
    onUpdateTask: (id: string, updates: any) => console.log('Update task:', id, updates),
    onAddSubtask: (parentId: string, subtask: any) => console.log('Add subtask:', parentId, subtask),
    onAddTask: (task: any, listId?: string) => console.log('Add task:', task, listId),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <CalendarView
        tasks={mockTasks}
        activeListName="My Tasks"
        {...mockHandlers}
      />
    </div>
  );
}

export default App;