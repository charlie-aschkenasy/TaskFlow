import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Save, X, Tag, AlertTriangle } from 'lucide-react';
import { useTags } from '../hooks/useTags';
import { useTasks } from '../hooks/useTasks';
import { getAllUsedTags } from '../utils/taskUtils';

export function TagManagement() {
  const { availableTags, addTag, removeTag, getTagColor } = useTags();
  const { getAllTasks, updateTask } = useTasks();
  const [editingTag, setEditingTag] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [editTagName, setEditTagName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const allTasks = getAllTasks(false); // Get all tasks regardless of list
  const usedTags = getAllUsedTags(allTasks);

  const getTaskCountForTag = (tag: string) => {
    return allTasks.filter(task => task.tags && task.tags.includes(tag)).length;
  };

  const handleAddTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    
    const normalizedTag = addTag(newTagName.trim());
    setNewTagName('');
    setShowAddForm(false);
  };

  const handleEditStart = (tag: string) => {
    setEditingTag(tag);
    setEditTagName(tag);
  };

  const handleEditSave = async (oldTag: string) => {
    if (!editTagName.trim() || editTagName.trim() === oldTag) {
      handleEditCancel();
      return;
    }

    const newTag = editTagName.trim().toLowerCase().replace(/\s+/g, '-');
    
    if (usedTags.includes(newTag)) {
      alert('A tag with this name already exists!');
      return;
    }

    setIsProcessing(true);

    try {
      // Find all tasks that use the old tag and update them
      const tasksToUpdate = allTasks.filter(task => 
        task.tags && task.tags.includes(oldTag)
      );

      // Update each task
      for (const task of tasksToUpdate) {
        const updatedTags = task.tags.map(tag => tag === oldTag ? newTag : tag);
        await updateTask(task.id, { tags: updatedTags });
      }

      // Update available tags
      removeTag(oldTag);
      addTag(newTag);

      setEditingTag(null);
      setEditTagName('');
    } catch (error) {
      console.error('Error updating tag:', error);
      alert('Failed to update tag. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditCancel = () => {
    setEditingTag(null);
    setEditTagName('');
  };

  const handleDeleteTag = async (tag: string) => {
    const taskCount = getTaskCountForTag(tag);
    
    const confirmed = window.confirm(
      taskCount > 0
        ? `Are you sure you want to delete "${tag}"? This tag is used in ${taskCount} task${taskCount !== 1 ? 's' : ''}. It will be removed from all tasks.`
        : `Are you sure you want to delete "${tag}"?`
    );
    
    if (!confirmed) return;

    setIsProcessing(true);

    try {
      if (taskCount > 0) {
        // Find all tasks that use this tag and remove it
        const tasksToUpdate = allTasks.filter(task => 
          task.tags && task.tags.includes(tag)
        );

        // Update each task to remove the tag
        for (const task of tasksToUpdate) {
          const updatedTags = task.tags.filter(t => t !== tag);
          await updateTask(task.id, { tags: updatedTags });
        }
      }

      // Remove from available tags
      removeTag(tag);
    } catch (error) {
      console.error('Error deleting tag:', error);
      alert('Failed to delete tag. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Combine available tags and used tags, removing duplicates
  const allTags = Array.from(new Set([...availableTags, ...usedTags])).sort();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Tags</h2>
          <p className="text-gray-600 mt-1">
            Manage your tags. You have {allTags.length} tag{allTags.length !== 1 ? 's' : ''}.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          disabled={isProcessing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={18} />
          Add Tag
        </button>
      </div>

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
            <span className="text-yellow-800">Processing tag changes...</span>
          </div>
        </div>
      )}

      {/* Add New Tag Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Tag</h3>
          <form onSubmit={handleAddTag} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tag Name *
              </label>
              <input
                type="text"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                autoFocus
              />
              <p className="text-xs text-gray-500 mt-1">
                Tag names will be automatically formatted (lowercase, spaces replaced with hyphens)
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Create Tag
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setNewTagName('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tags Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allTags.map(tag => {
          const taskCount = getTaskCountForTag(tag);
          const isUsed = taskCount > 0;
          
          return (
            <div key={tag} className="bg-white p-4 rounded-lg shadow-sm border">
              {editingTag === tag ? (
                // Edit Form
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editTagName}
                    onChange={(e) => setEditTagName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    disabled={isProcessing}
                  />
                  
                  {isUsed && (
                    <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
                      <AlertTriangle size={14} />
                      <span>This will update {taskCount} task{taskCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSave(tag)}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Save size={14} />
                      Save
                    </button>
                    <button
                      onClick={handleEditCancel}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: getTagColor(tag) }}
                      >
                        <Tag size={16} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">#{tag}</h3>
                        <p className="text-sm text-gray-500">
                          {taskCount} task{taskCount !== 1 ? 's' : ''}
                          {!isUsed && <span className="text-gray-400"> (unused)</span>}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditStart(tag)}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Edit3 size={14} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag)}
                      disabled={isProcessing}
                      className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      {allTags.length === 0 && (
        <div className="text-center py-12">
          <Tag size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tags yet</h3>
          <p className="text-gray-500 mb-4">Create your first tag to categorize your tasks</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Your First Tag
          </button>
        </div>
      )}
    </div>
  );
}