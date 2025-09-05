import React, { useState } from 'react';
import { Plus, Settings, Check, Edit3, Trash2, ChevronDown, List, FolderPlus } from 'lucide-react';
import { TaskList } from '../types';

interface CompactListSelectorProps {
  taskLists: TaskList[];
  activeListId: string;
  onSelectList: (listId: string) => void;
  onAddList: (name: string, color: string, icon: string) => void;
  onUpdateList: (id: string, updates: Partial<TaskList>) => void;
  onDeleteList: (id: string) => void;
}

export function CompactListSelector({ 
  taskLists, 
  activeListId, 
  onSelectList, 
  onAddList, 
  onUpdateList, 
  onDeleteList 
}: CompactListSelectorProps) {
  const [listDropdownOpen, setListDropdownOpen] = useState(false);
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

  const getActiveList = () => {
    if (activeListId === 'all') {
      return { id: 'all', name: 'All Tasks', icon: '📋', color: '#6B7280' };
    }
    return taskLists.find(list => list.id === activeListId) || taskLists[0];
  };

  const activeList = getActiveList();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    
    // Note: onAddList is now async, but we don't await here since it's passed as a prop
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
    setListDropdownOpen(false);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editingList) return;
    
    // Note: onUpdateList is now async, but we don't await here since it's passed as a prop
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
      // Note: onDeleteList is now async, but we don't await here since it's passed as a prop
      onDeleteList(listId);
      setListDropdownOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium text-gray-700 mb-2">Current List</div>
      
      {/* Current List Selector */}
      <div className="relative">
        <button
          onClick={() => setListDropdownOpen(!listDropdownOpen)}
          className="w-full flex items-center justify-between gap-2 px-4 py-3 bg-gray-50 text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span>{activeList?.icon}</span>
            <span className="font-medium">{activeList?.name}</span>
          </div>
          <ChevronDown size={16} className={`transition-transform ${listDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {listDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
            {/* All Tasks Option */}
            <button
              onClick={() => {
                onSelectList('all');
                setListDropdownOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors text-left hover:bg-gray-50 ${
                activeListId === 'all' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
              }`}
            >
              <span>📋</span>
              <span>All Tasks</span>
              {activeListId === 'all' && <Check size={14} className="ml-auto" />}
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            {/* Task Lists */}
            {taskLists.map(list => (
              <div key={list.id} className="relative">
                {editingList === list.id ? (
                  <div className="p-3 bg-gray-50 border-b">
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
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        onSelectList(list.id);
                        setListDropdownOpen(false);
                      }}
                      className={`flex-1 flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors text-left hover:bg-gray-50 ${
                        activeListId === list.id ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <span>{list.icon}</span>
                      <span>{list.name}</span>
                      {activeListId === list.id && <Check size={14} className="ml-auto" />}
                    </button>
                    <div className="flex items-center pr-2">
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

            <div className="border-t border-gray-100 my-1"></div>

            {/* Add New List Button */}
            <button
              onClick={() => {
                setShowAddForm(true);
                setListDropdownOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Plus size={16} />
              <span>Add New List</span>
            </button>
          </div>
        )}
      </div>

      {/* Add New List Form */}
      {showAddForm && (
        <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Create New List</h4>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              placeholder="List name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
            />
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
            <div className="grid grid-cols-8 gap-2">
              {predefinedColors.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setNewListColor(color)}
                  className={`w-6 h-6 rounded border-2 transition-all ${
                    newListColor === color
                      ? 'border-gray-800 scale-110'
                      : 'border-gray-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Click outside to close dropdown */}
      {listDropdownOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setListDropdownOpen(false)}
        />
      )}
    </div>
  );
}