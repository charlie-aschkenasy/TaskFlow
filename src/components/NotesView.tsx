import React, { useState } from 'react';
import { Plus, BookOpen, X, Check } from 'lucide-react';
import { useNoteSections } from '../hooks/useNoteSections';
import { NoteSection } from './NoteSection';

export function NotesView() {
  const { sections, loading, addSection, updateSection, deleteSection } = useNoteSections();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState('');
  const [newSectionColor, setNewSectionColor] = useState('#3b82f6');

  const handleAddSection = async () => {
    if (newSectionName.trim()) {
      try {
        await addSection(newSectionName.trim(), newSectionColor);
        setNewSectionName('');
        setNewSectionColor('#3b82f6');
        setShowAddForm(false);
      } catch (error) {
        console.error('Failed to add section:', error);
      }
    }
  };

  const colorOptions = [
    { value: '#3b82f6', label: 'Blue' },
    { value: '#10b981', label: 'Green' },
    { value: '#f59e0b', label: 'Orange' },
    { value: '#ef4444', label: 'Red' },
    { value: '#8b5cf6', label: 'Purple' },
    { value: '#ec4899', label: 'Pink' },
    { value: '#6366f1', label: 'Indigo' },
    { value: '#14b8a6', label: 'Teal' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-2">
          <BookOpen size={32} className="text-blue-600" />
          <h2 className="text-3xl font-bold text-gray-900">Notes</h2>
        </div>
        <p className="text-gray-600 mb-4">
          Organize your notes into sections
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        {!showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={20} />
            Add Section
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newSectionName}
                onChange={(e) => setNewSectionName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddSection();
                  if (e.key === 'Escape') {
                    setShowAddForm(false);
                    setNewSectionName('');
                  }
                }}
                placeholder="Section name..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleAddSection}
                className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                title="Create section"
              >
                <Check size={20} />
              </button>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setNewSectionName('');
                  setNewSectionColor('#3b82f6');
                }}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                title="Cancel"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Choose a color:</p>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    onClick={() => setNewSectionColor(color.value)}
                    className={`w-8 h-8 rounded-full border-2 transition-colors ${
                      newSectionColor === color.value
                        ? 'border-gray-900'
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: color.value }}
                    title={color.label}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
          <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No sections yet</h3>
          <p className="text-gray-500 mb-4">
            Create your first section to start taking notes
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {sections.map((section) => (
            <NoteSection
              key={section.id}
              section={section}
              onUpdateSection={updateSection}
              onDeleteSection={deleteSection}
            />
          ))}
        </div>
      )}
    </div>
  );
}
