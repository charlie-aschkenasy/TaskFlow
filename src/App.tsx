import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Tag, 
  FolderOpen, 
  AlertTriangle, 
  Settings,
  Menu,
  X,
  CalendarDays
} from 'lucide-react';
import { useTasks } from './hooks/useTasks';
import { useTaskLists } from './hooks/useTaskLists';
import { useProjects } from './hooks/useProjects';
import { useTags } from './hooks/useTags';
import { useAuth } from './hooks/useAuth';
import { Dashboard } from './components/Dashboard';
import { TaskList } from './components/TaskList';
import { TagView } from './components/TagView';
import { ProjectView } from './components/ProjectView';
import { PriorityView } from './components/PriorityView';
import { CalendarView } from './components/CalendarView';
import { EventsAssignmentsView } from './components/EventsAssignmentsView';
import { SettingsPage } from './pages/SettingsPage';
import { Auth } from './components/Auth';
import { FloatingScratchpadButton } from './components/FloatingScratchpadButton';

type ViewMode = 'dashboard' | 'tasks' | 'tags' | 'projects' | 'priority' | 'calendar' | 'events-assignments' | 'settings';

function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, loading } = useAuth();
  
  const {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    addSubtask,
    loading: tasksLoading,
    error: tasksError
  } = useTasks();

  const {
    taskLists,
    activeListId,
    setActiveListId,
    addTaskList,
    updateTaskList,
    deleteTaskList,
    loading: listsLoading
  } = useTaskLists();

  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    addProject,
    updateProject,
    deleteProject,
    loading: projectsLoading
  } = useProjects();

  const {
    tags,
    addTag,
    updateTag,
    deleteTag,
    loading: tagsLoading
  } = useTags();

  // Close sidebar when view changes (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentView]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading TaskFlow...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const activeList = taskLists.find(list => list.id === activeListId);
  const activeProject = projects.find(project => project.id === activeProjectId);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: CheckSquare },
    { id: 'tasks', label: 'All Tasks', icon: CheckSquare },
    { id: 'tags', label: 'Tags View', icon: Tag },
    { id: 'projects', label: 'Projects View', icon: FolderOpen },
    { id: 'events-assignments', label: 'Events & Assignments', icon: CalendarDays },
    { id: 'priority', label: 'Priority View', icon: AlertTriangle },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderCurrentView = () => {
    const commonProps = {
      tasks,
      onToggleTask: toggleTask,
      onDeleteTask: deleteTask,
      onUpdateTask: updateTask,
      onAddSubtask: addSubtask,
      onAddTask: addTask,
      activeListName: activeList?.name,
      activeProjectName: activeProject?.name,
    };

    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            {...commonProps}
            taskLists={taskLists}
            activeListId={activeListId}
            onSetActiveListId={setActiveListId}
            onAddTaskList={addTaskList}
            onUpdateTaskList={updateTaskList}
            onDeleteTaskList={deleteTaskList}
            projects={projects}
            activeProjectId={activeProjectId}
            onSetActiveProjectId={setActiveProjectId}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
          />
        );
      case 'tasks':
        return (
          <TaskList
            {...commonProps}
            taskLists={taskLists}
            activeListId={activeListId}
            onSetActiveListId={setActiveListId}
            onAddTaskList={addTaskList}
            onUpdateTaskList={updateTaskList}
            onDeleteTaskList={deleteTaskList}
            projects={projects}
            activeProjectId={activeProjectId}
            onSetActiveProjectId={setActiveProjectId}
          />
        );
      case 'tags':
        return (
          <TagView
            {...commonProps}
            tags={tags}
            onAddTag={addTag}
            onUpdateTag={updateTag}
            onDeleteTag={deleteTag}
          />
        );
      case 'projects':
        return (
          <ProjectView
            {...commonProps}
            projects={projects}
            activeProjectId={activeProjectId}
            onSetActiveProjectId={setActiveProjectId}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
          />
        );
      case 'events-assignments':
        return <EventsAssignmentsView {...commonProps} />;
      case 'priority':
        return <PriorityView {...commonProps} />;
      case 'calendar':
        return <CalendarView {...commonProps} />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <Dashboard {...commonProps} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md"
      >
        {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
          <p className="text-sm text-gray-600 mt-1">Organize your life</p>
        </div>

        <nav className="p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id as ViewMode)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  currentView === item.id
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        <main className="p-6 pt-16 lg:pt-6">
          {tasksError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">Error loading tasks: {tasksError}</p>
            </div>
          )}
          
          {renderCurrentView()}
        </main>
      </div>

      <FloatingScratchpadButton />
    </div>
  );
}

export default App;