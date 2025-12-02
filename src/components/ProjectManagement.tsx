import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, FolderOpen, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useProjects } from '../hooks/useProjects';
import { useTasks } from '../hooks/useTasks';
import { Project } from '../types';

interface SortableProjectItemProps {
  project: Project & { sort_order?: number };
  taskCount: number;
  isEditing: boolean;
  editName: string;
  editColor: string;
  onEditStart: () => void;
  onEditSave: () => void;
  onEditCancel: () => void;
  onDelete: () => void;
  onEditNameChange: (name: string) => void;
  onEditColorChange: (color: string) => void;
  predefinedColors: string[];
}

function SortableProjectItem({
  project,
  taskCount,
  isEditing,
  editName,
  editColor,
  onEditStart,
  onEditSave,
  onEditCancel,
  onDelete,
  onEditNameChange,
  onEditColorChange,
  predefinedColors,
}: SortableProjectItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white rounded-lg shadow-sm border ${
        isDragging ? 'shadow-lg ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-center p-4 gap-3">
        {!isEditing && (
          <button
            className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical size={20} />
          </button>
        )}

        <div className="flex-1">
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editName}
                onChange={(e) => onEditNameChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />

              <div className="grid grid-cols-8 gap-1">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => onEditColorChange(color)}
                    className={`w-6 h-6 rounded border ${
                      editColor === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onEditSave}
                  className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  onClick={onEditCancel}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: project.color }}
                >
                  <FolderOpen size={16} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500">
                    {taskCount} task{taskCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onEditStart}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                >
                  <Edit3 size={14} />
                  Edit
                </button>
                <button
                  onClick={onDelete}
                  className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ProjectManagement() {
  const { projects, otherProjectId, addProject, updateProject, deleteProject, reorderProjects } = useProjects();
  const { getAllTasks, updateTask } = useTasks();
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#3B82F6');
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3B82F6');

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444',
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const allTasks = getAllTasks(false);

  const getTaskCountForProject = (projectId: string) => {
    return allTasks.filter(task => task.project === projectId).length;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = projects.findIndex(p => p.id === active.id);
      const newIndex = projects.findIndex(p => p.id === over.id);

      const reordered = arrayMove(projects, oldIndex, newIndex);
      reorderProjects(reordered);
    }
  };

  const handleAddProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    await addProject(newProjectName.trim(), newProjectColor);
    setNewProjectName('');
    setNewProjectColor('#3B82F6');
    setShowAddForm(false);
  };

  const handleEditStart = (project: any) => {
    setEditingProject(project.id);
    setEditName(project.name);
    setEditColor(project.color);
  };

  const handleEditSave = async (projectId: string) => {
    if (!editName.trim()) return;

    await updateProject(projectId, {
      name: editName.trim(),
      color: editColor,
    });

    setEditingProject(null);
    setEditName('');
    setEditColor('#3B82F6');
  };

  const handleEditCancel = () => {
    setEditingProject(null);
    setEditName('');
    setEditColor('#3B82F6');
  };

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    if (projectId === otherProjectId) {
      alert('The "Other" project cannot be deleted as it is used as a default for unassigned tasks.');
      return;
    }

    const taskCount = getTaskCountForProject(projectId);
    const defaultProject = projects.find(p => p.id === otherProjectId) || projects.find(p => p.name === 'Personal') || projects[0];

    if (taskCount > 0) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${projectName}"? This project contains ${taskCount} task${taskCount !== 1 ? 's' : ''}. All tasks will be moved to "${defaultProject?.name || 'the first available project'}".`
      );
      if (!confirmed) return;

      const tasksToUpdate = allTasks.filter(task => task.project === projectId);
      for (const task of tasksToUpdate) {
        await updateTask(task.id, { project: defaultProject?.id || '' });
      }
    } else {
      const confirmed = window.confirm(`Are you sure you want to delete "${projectName}"?`);
      if (!confirmed) return;
    }

    await deleteProject(projectId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          <p className="text-gray-600 mt-1">
            Manage your projects. You have {projects.length} project{projects.length !== 1 ? 's' : ''}.
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Drag projects to reorder them.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Add Project
        </button>
      </div>

      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Project</h3>
          <form onSubmit={handleAddProject} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Project Name *
              </label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
              </label>
              <div className="grid grid-cols-8 gap-2">
                {predefinedColors.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewProjectColor(color)}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      newProjectColor === color
                        ? 'border-gray-800 scale-110'
                        : 'border-gray-300 hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Create Project
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewProjectName('');
                  setNewProjectColor('#3B82F6');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {projects.length > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={projects.map(p => p.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {projects.map(project => (
                <SortableProjectItem
                  key={project.id}
                  project={project}
                  taskCount={getTaskCountForProject(project.id)}
                  isEditing={editingProject === project.id}
                  editName={editName}
                  editColor={editColor}
                  onEditStart={() => handleEditStart(project)}
                  onEditSave={() => handleEditSave(project.id)}
                  onEditCancel={handleEditCancel}
                  onDelete={() => handleDeleteProject(project.id, project.name)}
                  onEditNameChange={setEditName}
                  onEditColorChange={setEditColor}
                  predefinedColors={predefinedColors}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="text-center py-12">
          <FolderOpen size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects yet</h3>
          <p className="text-gray-500 mb-4">Create your first project to organize your tasks</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Your First Project
          </button>
        </div>
      )}
    </div>
  );
}
