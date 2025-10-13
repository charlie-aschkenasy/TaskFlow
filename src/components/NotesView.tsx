import React, { useState, useEffect } from 'react';
import { StickyNote, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { useNoteSections } from '../hooks/useNoteSections';
import { useNotes } from '../hooks/useNotes';

export function NotesView() {
  const { sections, loading: sectionsLoading, addSection, updateSection, deleteSection } = useNoteSections();
  const { notes, updateNote } = useNotes();
  const [newSectionName, setNewSectionName] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');
  const [noteContents, setNoteContents] = useState<Record<string, string>>({});
  const [lastSavedTimes, setLastSavedTimes] = useState<Record<string, Date>>({});
  const [savingStates, setSavingStates] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const initialContents: Record<string, string> = {};
    sections.forEach(section => {
      const note = notes[section.id];
      if (note) {
        initialContents[section.id] = note.content;
      } else {
        initialContents[section.id] = '';
      }
    });
    setNoteContents(initialContents);
  }, [sections, notes]);

  useEffect(() => {
    Object.keys(noteContents).forEach(sectionId => {
      const content = noteContents[sectionId];
      const originalContent = notes[sectionId]?.content || '';

      if (content !== originalContent) {
        const saveTimeout = setTimeout(async () => {
          setSavingStates(prev => ({ ...prev, [sectionId]: true }));
          try {
            await updateNote(sectionId, content);
            setLastSavedTimes(prev => ({ ...prev, [sectionId]: new Date() }));
          } catch (error) {
            console.error('Error saving note:', error);
          } finally {
            setSavingStates(prev => ({ ...prev, [sectionId]: false }));
          }
        }, 1000);

        return () => clearTimeout(saveTimeout);
      }
    });
  }, [noteContents, notes, updateNote]);

  const handleAddSection = async () => {
    if (!newSectionName.trim()) return;

    try {
      await addSection(newSectionName.trim());
      setNewSectionName('');
      setIsAddingSection(false);
    } catch (error) {
      console.error('Error adding section:', error);
    }
  };

  const handleStartEdit = (sectionId: string, currentName: string) => {
    setEditingSectionId(sectionId);
    setEditingSectionName(currentName);
  };

  const handleSaveEdit = async () => {
    if (!editingSectionId || !editingSectionName.trim()) return;

    try {
      await updateSection(editingSectionId, editingSectionName.trim());
      setEditingSectionId(null);
      setEditingSectionName('');
    } catch (error) {
      console.error('Error updating section:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingSectionId(null);
    setEditingSectionName('');
  };

  const handleDeleteSection = async (sectionId: string, sectionName: string) => {
    if (window.confirm(`Are you sure you want to delete "${sectionName}"? This will also delete all notes in this section. This action cannot be undone.`)) {
      try {
        await deleteSection(sectionId);
      } catch (error) {
        console.error('Error deleting section:', error);
      }
    }
  };

  const handleNoteChange = (sectionId: string, content: string) => {
    setNoteContents(prev => ({ ...prev, [sectionId]: content }));
  };

  const formatLastSaved = (sectionId: string) => {
    const lastSaved = lastSavedTimes[sectionId];
    if (!lastSaved) {
      const note = notes[sectionId];
      if (note?.updated_at) {
        return formatTimestamp(new Date(note.updated_at));
      }
      return '';
    }

    return formatTimestamp(lastSaved);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Saved just now';
    if (diffMins < 60) return `Saved ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Saved ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;

    return `Saved on ${date.toLocaleDateString()}`;
  };

  const getCharacterCount = (content: string) => {
    return content.replace(/<[^>]*>/g, '').trim().length;
  };

  if (sectionsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-500">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Notes</h2>
        <p className="text-gray-600 mb-4">
          Organize your thoughts into sections
        </p>
        <div className="flex justify-center gap-6 text-sm">
          <div className="text-center">
            <span className="block text-2xl font-semibold text-gray-900">
              {sections.length}
            </span>
            <span className="text-gray-500">Section{sections.length !== 1 ? 's' : ''}</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Section</h3>
        {!isAddingSection ? (
          <button
            onClick={() => setIsAddingSection(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={18} />
            Create Section
          </button>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={newSectionName}
              onChange={(e) => setNewSectionName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSection()}
              placeholder="Enter section name..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleAddSection}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
            <button
              onClick={() => {
                setIsAddingSection(false);
                setNewSectionName('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="space-y-6">
        {sections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <StickyNote size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No sections yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first section to start taking notes
            </p>
          </div>
        ) : (
          sections.map(section => {
            const content = noteContents[section.id] || '';
            const isSaving = savingStates[section.id];
            const isEditing = editingSectionId === section.id;

            return (
              <div key={section.id} className="bg-white rounded-lg shadow-sm border">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="p-2 rounded-lg bg-yellow-100">
                        <StickyNote className="text-yellow-600" size={20} />
                      </div>
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingSectionName}
                            onChange={(e) => setEditingSectionName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveEdit()}
                            className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                            autoFocus
                          />
                          <button
                            onClick={handleSaveEdit}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Save"
                          >
                            <Check size={16} className="text-green-600" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Cancel"
                          >
                            <X size={16} className="text-gray-600" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{section.name}</h3>
                            <p className="text-xs text-gray-500">
                              {formatLastSaved(section.id)}
                              {isSaving && <span className="ml-2">Saving...</span>}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleStartEdit(section.id, section.name)}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Edit section name"
                            >
                              <Edit2 size={16} className="text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(section.id, section.name)}
                              className="p-2 hover:bg-gray-100 rounded transition-colors"
                              title="Delete section"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <RichTextEditor
                    value={content}
                    onChange={(value) => handleNoteChange(section.id, value)}
                    placeholder="Write your notes here... They'll be saved automatically."
                  />
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <div>{getCharacterCount(content)} characters</div>
                    <div>Auto-saves</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
