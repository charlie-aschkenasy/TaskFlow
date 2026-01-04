import React, { useState } from 'react';
import { 
  Calendar, 
  LayoutDashboard, 
  List, 
  LogOut, 
  Menu, 
  X,
  User,
  ChevronDown,
  Settings,
  Tag,
  FolderOpen,
  BookOpen,
  FileText
} from 'lucide-react';
import { AlertTriangle } from 'lucide-react';
import { ViewMode } from './types';
import { useTasks } from './hooks/useTasks';
import { useTaskLists } from './hooks/useTaskLists';
import { useAuth } from './hooks/useAuth';
import { Dashboard } from './components/Dashboard';
import { TimeframeView } from './components/TimeframeView';
import { CalendarView } from './components/CalendarView';
import { TaskList } from './components/TaskList';
import { TagView } from './components/TagView';
import { ProjectView } from './components/ProjectView';
import { PriorityView } from './components/PriorityView';
import { EventView } from './components/EventView';
import { AssignmentView } from './components/AssignmentView';
import { NotesView } from './components/NotesView';
import { GlobalScratchpad } from './components/GlobalScratchpad';
import { FloatingScratchpadButton } from './components/FloatingScratchpadButton';
import { CompactListSelector } from './components/CompactListSelector';
import { Auth } from './components/Auth';
import { SettingsPage } from './pages/SettingsPage';
import { ToggleSwitch } from './components/ToggleSwitch';

export default function App() {
  const { user, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [viewDropdownOpen, setViewDropdownOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  
  const { 
    taskLists, 
    activeListId, 
    setActiveListId, 
    addTaskList, 
    updateTaskList, 
    deleteTaskList, 
    getTaskListById,
    moveTasksToList
  } = useTaskLists();
  
  const {
    addTask,
    addSubtask,
    updateTask,
    deleteTask,
    toggleTask,
    getAllTasks,
    reorderTasks,
    moveTaskToList,
  } = useTasks(activeListId);

  const tasks = getAllTasks();
  
  // Filter tasks based on completed toggle
  const visibleTasks = showCompletedTasks 
    ? tasks 
    : tasks.filter(task => !task.completed);
  
  const activeTaskList = getTaskListById(activeListId);
  const activeListName = activeTaskList?.name;

  if (!user) {
    return <Auth />;
  }

  // Show settings page
  if (showSettings) {
    return <SettingsPage onBack={() => setShowSettings(false)} />;
  }
  const handleSignOut = async () => {
    await signOut();
  };

  const handleDeleteList = (listId: string) => {
    // Move all tasks from the deleted list to Personal list
    const personalList = taskLists.find(list => list.name === 'Personal');
    if (personalList) {
      moveTasksToList(listId, personalList.id);
    }
    deleteTaskList(listId);
  };

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'events', name: 'Events', icon: Calendar },
    { id: 'assignments', name: 'Assignments', icon: BookOpen },
    { id: 'notes', name: 'Notes', icon: FileText },
    { id: 'all', name: 'All Tasks', icon: List },
    { id: 'calendar', name: 'Calendar', icon: Calendar },
    { id: 'daily', name: 'Daily', icon: Calendar },
    { id: 'projects', name: 'Projects View', icon: FolderOpen },
    { id: 'tags', name: 'Tags View', icon: Tag },
  ];

  const currentViewItem = navigation.find(item => item.id === currentView);

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            tasks={visibleTasks}
            activeListName={activeListName}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddSubtask={addSubtask}
            onAddTask={addTask}
          />
        );
      case 'daily':
      case 'weekly':
      case 'monthly':
      case 'yearly':
        return (
          <TimeframeView
            timeframe={currentView}
            tasks={visibleTasks}
            activeListName={activeListName}
            activeListId={activeListId}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddSubtask={addSubtask}
            onAddTask={addTask}
            onReorderTasks={reorderTasks}
          />
        );
      case 'calendar':
        return (
          <CalendarView
            tasks={visibleTasks}
            activeListName={activeListName}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddSubtask={addSubtask}
            onAddTask={addTask}
          />
        );
      case 'tags':
        return (
          <TagView
            tasks={visibleTasks}
            activeListName={activeListName}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddSubtask={addSubtask}
            onAddTask={addTask}
          />
        );
      case 'projects':
        return (
          <ProjectView
            tasks={visibleTasks}
            activeListName={activeListName}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddSubtask={addSubtask}
            onAddTask={addTask}
          />
        );
      case 'priority':
        return (
          <PriorityView
            tasks={visibleTasks}
            activeListName={activeListName}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddSubtask={addSubtask}
            onAddTask={addTask}
          />
        );
      case 'events':
        return (
          <EventView
            tasks={visibleTasks}
            activeListName={activeListName}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddSubtask={addSubtask}
            onAddTask={addTask}
          />
        );
      case 'assignments':
        return (
          <AssignmentView
            tasks={visibleTasks}
            activeListName={activeListName}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddSubtask={addSubtask}
            onAddTask={addTask}
          />
        );
      case 'notes':
        return <NotesView />;
      case 'all':
      default:
        return (
          <TaskList
            tasks={visibleTasks.filter(task => task.type === 'task')}
            activeListName={activeListName}
            activeListId={activeListId}
            onToggleTask={toggleTask}
            onDeleteTask={deleteTask}
            onUpdateTask={updateTask}
            onAddSubtask={addSubtask}
            onAddTask={addTask}
            onReorderTasks={reorderTasks}
            onMoveTaskToList={moveTaskToList}
            allTasksForFilters={visibleTasks.filter(task => task.type === 'task')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <h1 className="font-semibold text-gray-900">TaskFlow</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {tasks.length} total tasks
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                <User size={16} className="text-gray-600" />
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-400 hover:text-blue-500 transition-colors"
                title="Settings"
              >
                <Settings size={16} />
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-red-500 transition-colors"
                title="Sign out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-1">
        {/* Main Content */}
        <div className="flex-1">
          <main className="p-6">
            {/* View and List Selector Dropdowns */}
            <div className="flex flex-col gap-4 mb-6">
              {/* View Selector Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setViewDropdownOpen(!viewDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                >
                  {currentViewItem && <currentViewItem.icon size={18} />}
                  <span className="font-medium">{currentViewItem?.name}</span>
                  <ChevronDown size={16} className={`transition-transform ${viewDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {viewDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    {navigation.map((item) => {
                      const Icon = item.icon;
                      const isActive = currentView === item.id;
                      
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setCurrentView(item.id as ViewMode);
                            setViewDropdownOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors text-left
                            ${isActive 
                              ? 'bg-blue-50 text-blue-700' 
                              : 'text-gray-700 hover:bg-gray-50'
                            }
                            ${item === navigation[0] ? 'rounded-t-lg' : ''}
                            ${item === navigation[navigation.length - 1] ? 'rounded-b-lg' : ''}
                          `}
                        >
                          <Icon size={18} />
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* List Selector Dropdown */}
              <div className="w-64">
                <CompactListSelector
                  taskLists={taskLists}
                  activeListId={activeListId}
                  onSelectList={setActiveListId}
                  onAddList={addTaskList}
                  onUpdateList={updateTaskList}
                  onDeleteList={handleDeleteList}
                />
              </div>
              
              {/* Global Completed Tasks Toggle */}
              <div className="w-64">
                <ToggleSwitch
                  checked={showCompletedTasks}
                  onChange={setShowCompletedTasks}
                  label="Show completed tasks"
                  description="Toggle visibility of completed tasks across all views"
                />
              </div>
            </div>

            {/* Click outside to close view dropdown */}
            {viewDropdownOpen && (
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setViewDropdownOpen(false)}
              />
            )}

            {renderContent()}
          </main>
        </div>
        
        {/* Floating Scratchpad Button */}
        <FloatingScratchpadButton onClick={() => setShowScratchpad(true)} />
        
        {/* Global Scratchpad Modal */}
        <GlobalScratchpad 
          isOpen={showScratchpad} 
          onClose={() => setShowScratchpad(false)} 
        />
      </div>
    </div>
  );
}