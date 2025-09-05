import React, { useState } from 'react';
import { Plus, Settings, Check, Edit3, Trash2, ChevronDown, ChevronUp, List } from 'lucide-react';
import { TaskList } from '../types';

interface ListSelectorProps {
  taskLists: TaskList[];
  activeListId: string;
  onSelectList: (listId: string) => void;
  onAddList: (name: string, color: string, icon: string) => void;
  onUpdateList: (id: string, updates: Partial<TaskList>) => void;
  onDeleteList: (id: string) => void;
}

export function ListSelector({ 
  taskLists, 
  activeListId, 
  onSelectList, 
  onAddList, 
  onUpdateList, 
  onDeleteList 
}: ListSelectorProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    onAddList(newListName.trim(), newListColor, newListIcon);
    setNewListName('');
    setNewListColor('#3B82F6');
    setNewListIcon('📝');
    setShowAddForm(false);
  };

  const handleEditStart = (list: TaskList) => {
    setEditingList(list.id);
    setEditName(list.name);
    setEditColor(list.color);
    setEditIcon(list.icon);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editingList) return;
    
    onUpdateList(editingList, {
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

  const handleDelete = (listId: string) => {
    if (window.confirm('Are you sure you want to delete this list? All tasks in this list will be moved to Personal.')) {
      onDeleteList(listId);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4">
    <div className="bg-white rounded-lg shadow-sm border">
      {/* List Selection Bar */}
      <div className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium text-gray-700">Lists:</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="text-gray-400 hover:text-blue-500 transition-colors ml-auto"
            title="Add new list"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* Horizontal List Selection */}
        <div className="flex flex-wrap gap-2">
          {/* All Tasks Option */}
          <button
            onClick={() => onSelectList('all')}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeListId === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>📋</span>
            <span>All</span>
            {activeListId === 'all' && <Check size={14} />}
          </button>

          {/* Task Lists */}
          {taskLists.map(list => (
            <div key={list.id} className="relative">
              {editingList === list.id ? (
                <div className="absolute top-0 left-0 z-10 bg-white border border-gray-300 rounded-lg p-3 shadow-lg min-w-64">
                  <form onSubmit={handleEditSubmit} className="space-y-2">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <div className="flex gap-1">
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
                    <div className="flex gap-1">
                      {predefinedColors.slice(0, 6).map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setEditColor(color)}
                          className={`w-4 h-4 rounded border ${
                            editColor === color
                              ? 'border-gray-800 scale-110'
                              : 'border-gray-300'
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="submit"
                        className="px-2 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleEditCancel}
                        className="px-2 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectList(list.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeListId === list.id
                        ? 'text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    style={activeListId === list.id ? { backgroundColor: list.color } : {}}
                  >
                    <span>{list.icon}</span>
                    <span>{list.name}</span>
                    {activeListId === list.id && <Check size={14} />}
                  </button>
                  <div className="flex">
                    <button
                      onClick={() => handleEditStart(list)}
                      className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                      title="Edit list"
                    >
                      <Edit3 size={12} />
                    </button>
                    <button
                      onClick={() => handleDelete(list.id)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete list"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Add New List Form */}
      {showAddForm && (
        <div className="border-t p-4 bg-gray-50">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                List Name
              </label>
              <input
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                placeholder="Enter list name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Icon
              </label>
              <div className="grid grid-cols-8 gap-2">
                {predefinedIcons.map(icon => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewListIcon(icon)}
                    className={`p-2 text-lg rounded border transition-colors ${
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="bg-blue-500 text-white px-3 py-2 rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Create List
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-2 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
    </div>
  );
}