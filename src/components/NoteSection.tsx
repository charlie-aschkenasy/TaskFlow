import React, { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { NoteSection as NoteSectionType, Note } from '../types';
import { NoteCard } from './NoteCard';
import { useNotes } from '../hooks/useNotes';

interface NoteSectionProps {
  section: NoteSectionType;
  onUpdateSection: (id: string, updates: Partial<NoteSectionType>) => void;
  onDeleteSection: (id: string) => void;
}

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

export function NoteSection({ section, onUpdateSection, onDeleteSection }: NoteSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(section.name);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { notes, addNote, updateNote, deleteNote } = useNotes(section.id);

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== section.name) {
      onUpdateSection(section.id, { name: editedName.trim() });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditedName(section.name);
    setIsEditing(false);
  };

  const handleColorChange = (color: string) => {
    onUpdateSection(section.id, { color });
    setShowColorPicker(false);
  };

  const handleDeleteSection = () => {
    if (window.confirm(`Are you sure you want to delete "${section.name}"? All notes in this section will be deleted.`)) {
      onDeleteSection(section.id);
    }
  };

  const handleAddNote = async () => {
    try {
      await addNote(section.id);
    } catch (error) {
      console.error('Failed to add note:', error);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 flex-1">
          <div
            className="w-3 h-3 rounded-full cursor-pointer"
            style={{ backgroundColor: section.color }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Change color"
          />

          {isEditing ? (
            <div className="flex items-center gap-2 flex-1">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="flex-1 px-2 py-1 text-lg font-semibold border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <button
                onClick={handleSaveName}
                className="p-1 text-green-600 hover:bg-green-100 rounded"
                title="Save"
              >
                <Check size={18} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="p-1 text-red-600 hover:bg-red-100 rounded"
                title="Cancel"
              >
                <X size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{section.name}</h3>
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded"
                title="Edit name"
              >
                <Edit2 size={16} />
              </button>
              <span className="text-sm text-gray-500 ml-2">
                {notes.length} note{notes.length !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddNote}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            Add Note
          </button>
          <button
            onClick={handleDeleteSection}
            className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
            title="Delete section"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {showColorPicker && (
        <div className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Choose section color:</p>
          <div className="flex gap-2 flex-wrap">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorChange(color.value)}
                className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-500 transition-colors"
                style={{ backgroundColor: color.value }}
                title={color.label}
              />
            ))}
          </div>
        </div>
      )}

      {notes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No notes yet</p>
          <p className="text-sm mt-1">Click "Add Note" to create your first note</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onUpdate={updateNote}
              onDelete={deleteNote}
              sectionColor={section.color}
            />
          ))}
        </div>
      )}
    </div>
  );
}
