import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, List } from 'lucide-react';
import { useTaskLists } from '../hooks/useTaskLists';
import { useTasks } from '../hooks/useTasks';

export function ListManagement() {
  const { taskLists, addTaskList, updateTaskList, deleteTaskList, getPersonalListId } = useTaskLists();
  const { getAllTasks, moveTasksToList } = useTasks();
  const [editingList, setEditingList] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListColor, setNewListColor] = useState('#3B82F6');
  const [newListIcon, setNewListIcon] = useState('📝');
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('#3B82F6');
  const [editIcon, setEditIcon] = useState('📝');

  const predefinedColors = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
    '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'
  ];

  const predefinedIcons = [
    '📝', '💼', '🎓', '🏠', '💪', '🎨', '🛒', '🎯', 
    '📚', '🚗', '🍳', '🎵', '🌱', '💡', '🔧', '⚡'
  ];

  const allTasks = getAllTasks(false); // Get all tasks regardless of list

  const getTaskCountForList = (listId: string) => {
    return allTasks.filter(task => task.listId === listId).length;
  };

  const handleAddList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    await addTaskList(newListName.trim(), newListColor, newListIcon);
    setNewListName('');
    setNewListColor('#3B82F6');
    setNewListIcon('📝');
    setShowAddForm(false);
  };

  const handleEditStart = (list: any) => {
    setEditingList(list.id);
    setEditName(list.name);
    setEditColor(list.color);
    setEditIcon(list.icon);
  };

  const handleEditSave = async (listId: string) => {
    if (!editName.trim()) return;
    
    await updateTaskList(listId, {
      name: editName.trim(),
      color: editColor,
      icon: editIcon,
    });
    
    setEditingList(null);
    setEditName('');
    setEditColor('#3B82F6');
    setEditIcon('📝');
  };

  const handleEditCancel = () => {
    setEditingList(null);
    setEditName('');
    setEditColor('#3B82F6');
    setEditIcon('📝');
  };

  const handleDeleteList = async (listId: string, listName: string) => {
    const taskCount = getTaskCountForList(listId);
    const personalListId = getPersonalListId();
    
    if (taskCount > 0) {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${listName}"? This list contains ${taskCount} task${taskCount !== 1 ? 's' : ''}. All tasks will be moved to your Personal list.`
      );
      if (!confirmed) return;
      
      // Move tasks to Personal list before deleting
      await moveTasksToList(listId, personalListId);
    } else {
      const confirmed = window.confirm(`Are you sure you want to delete "${listName}"?`);
      if (!confirmed) return;
    }
    
    await deleteTaskList(listId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Task Lists</h2>
          <p className="text-gray-600 mt-1">
            Manage your task lists. You have {taskLists.length} list{taskLists.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <Plus size={18} />
          Add List
        </button>
      </div>

      {/* Add New List Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New List</h3>
          <form onSubmit={handleAddList} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List Name *
              </label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon
              </label>
              <div className="grid grid-cols-8 gap-2">
                {predefinedIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewListIcon(icon)}
                    className={`p-3 text-lg rounded border transition-colors ${
                      newListIcon === icon
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
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
                    onClick={() => setNewListColor(color)}
                    className={`w-8 h-8 rounded border-2 transition-all ${
                      newListColor === color
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
                Create List
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewListName('');
                  setNewListColor('#3B82F6');
                  setNewListIcon('📝');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Lists Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {taskLists.map(list => (
          <div key={list.id} className="bg-white p-4 rounded-lg shadow-sm border">
            {editingList === list.id ? (
              // Edit Form
              <div className="space-y-3">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                
                <div className="grid grid-cols-8 gap-1">
                  {predefinedIcons.slice(0, 8).map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setEditIcon(icon)}
                      className={`p-1 text-sm rounded border ${
                        editIcon === icon
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                
                <div className="grid grid-cols-8 gap-1">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setEditColor(color)}
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
                    onClick={() => handleEditSave(list.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                  >
                    <Save size={14} />
                    Save
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    <X size={14} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // Display Mode
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{list.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{list.name}</h3>
                      <p className="text-sm text-gray-500">
                        {getTaskCountForList(list.id)} task{getTaskCountForList(list.id) !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: list.color }}
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditStart(list)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  >
                    <Edit3 size={14} />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteList(list.id, list.name)}
                    className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {taskLists.length === 0 && (
        <div className="text-center py-12">
          <List size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No lists yet</h3>
          <p className="text-gray-500 mb-4">Create your first list to organize your tasks</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Your First List
          </button>
        </div>
      )}
    </div>
  );
}