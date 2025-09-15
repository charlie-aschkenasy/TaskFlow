import React, { useState } from 'react';
import { FolderOpen, Plus } from 'lucide-react';
import { Task } from '../types';
import { TaskItem } from './TaskItem';
import { TaskForm } from './TaskForm';
import { useProjects } from '../hooks/useProjects';
import { sortTasks, getAllTasksIncludingSubtasks } from '../utils/taskUtils';

interface ProjectViewProps {
  tasks: Task[];
  activeListName?: string;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, updates: Partial<Task>) => void;
  onAddSubtask: (parentId: string, subtask: any) => void;
  onAddTask: (task: any, listId?: string) => void;
}

export function ProjectView({
  tasks,
  activeListName,
  onToggleTask,
  onDeleteTask,
  onUpdateTask,
  onAddSubtask,
  onAddTask,
}: ProjectViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { projects } = useProjects();

  // Get all tasks including subtasks for comprehensive project analysis
  const allTasksWithSubtasks = getAllTasksIncludingSubtasks(tasks);

  // Group tasks by projects
  const getTasksForProject = (projectId: string) => {
    const projectTasks = allTasksWithSubtasks.filter(task => 
      task.project === projectId
    );
    return sortTasks(projectTasks, { primary: 'dueDate', primaryAscending: true, secondaryAscending: true });
  };

  // Sort projects: projects with tasks first, then empty projects
  const sortedProjects = [...projects].sort((a, b) => {
    const aTaskCount = getTasksForProject(a.id).length;
    const bTaskCount = getTasksForProject(b.id).length;
    
    // If one has tasks and the other doesn't, prioritize the one with tasks
    if (aTaskCount > 0 && bTaskCount === 0) return -1;
    if (aTaskCount === 0 && bTaskCount > 0) return 1;
    
    // If both have tasks or both are empty, maintain original order
    return 0;
  });

  // Calculate statistics
  const totalTasks = allTasksWithSubtasks.length;
  const completedTasks = allTasksWithSubtasks.filter(task => task.completed).length;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {activeListName ? `${activeListName} - Projects View` : 'Projects View'}
        </h2>
        <p className="text-gray-600 mb-4">
          {activeListName 
            ? `Organize your ${activeListName.toLowerCase()} tasks by projects`
            : 'Organize all your tasks by projects'
          }
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-900">
              {totalTasks}
            </span>
            <span className="text-gray-500">Total Tasks</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-blue-600">
              {projects.length}
            </span>
            <span className="text-gray-500">Projects</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-green-600">
              {completedTasks}
            </span>
            <span className="text-gray-500">Completed</span>
          </div>
          <div className="text-center">
            <span className="block text-2xl font-semibold text-yellow-600">
              {pendingTasks}
            </span>
            <span className="text-gray-500">Pending</span>
          </div>
        </div>
      </div>

      {/* Quick Add Task */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Add Task</h3>
        <TaskForm
          onSubmit={onAddTask}
          onCancel={() => setIsFormOpen(false)}
          isOpen={isFormOpen}
          onToggle={() => setIsFormOpen(!isFormOpen)}
        />
      </div>

      {/* Project Sections */}
      <div className="space-y-6">
        {sortedProjects.map(project => {
          const projectTasks = getTasksForProject(project.id);
          const completedCount = projectTasks.filter(task => task.completed).length;
          const pendingCount = projectTasks.length - completedCount;

          return (
            <div key={project.id} className="bg-white rounded-lg shadow-sm border">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div 
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: project.color }}
                  >
                    <FolderOpen className="text-white" size={20} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{project.name}</h3>
                    <p className="text-sm text-gray-500">
                      {projectTasks.length} task{projectTasks.length !== 1 ? 's' : ''}
                      {completedCount > 0 && (
                        <span className="ml-2">
                          • {completedCount} completed, {pendingCount} pending
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {Math.round((completedCount / projectTasks.length) * 100) || 0}% complete
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                      <div 
                        className="h-2 rounded-full transition-all duration-300"
                        style={{ 
                          backgroundColor: project.color,
                          width: `${(completedCount / projectTasks.length) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 max-h-80 overflow-y-auto">
                {projectTasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">
                    No tasks in this project
                  </p>
                ) : (
                  <div className="space-y-3">
                    {projectTasks.slice(0, 10).map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={onToggleTask}
                        onDelete={onDeleteTask}
                        onUpdate={onUpdateTask}
                        onAddSubtask={onAddSubtask}
                      />
                    ))}
                    {projectTasks.length > 10 && (
                      <p className="text-center text-gray-500 text-sm py-2">
                        And {projectTasks.length - 10} more...
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {sortedProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <FolderOpen size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No projects yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first project to organize your tasks
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
}