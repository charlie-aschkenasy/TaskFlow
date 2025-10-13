import React, { useState, useEffect } from 'react';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';
import { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onUpdate: (id: string, content: string) => void;
  onDelete: (id: string) => void;
  sectionColor: string;
}

export function NoteCard({ note, onUpdate, onDelete, sectionColor }: NoteCardProps) {
  const [content, setContent] = useState(note.content);
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(
    note.updatedAt ? new Date(note.updatedAt) : null
  );

  useEffect(() => {
    setContent(note.content);
  }, [note.content]);

  useEffect(() => {
    if (content === note.content) return;

    const saveTimeout = setTimeout(async () => {
      try {
        await onUpdate(note.id, content);
        setLastSaved(new Date());
      } catch (error) {
        console.error('Failed to save note:', error);
      }
    }, 1000);

    return () => clearTimeout(saveTimeout);
  }, [content, note.id, note.content, onUpdate]);

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      onDelete(note.id);
    }
  };

  const formatLastSaved = () => {
    if (!lastSaved) return '';

    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Saved just now';
    if (diffMins < 60) return `Saved ${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Saved ${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;

    return `Saved on ${lastSaved.toLocaleDateString()}`;
  };

  return (
    <div
      className="bg-white rounded-lg shadow-sm border-l-4 transition-all duration-200 hover:shadow-md"
      style={{ borderLeftColor: sectionColor }}
    >
      <div className="flex items-center justify-between p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          {lastSaved && !isMinimized && (
            <span className="text-xs text-gray-500">
              {formatLastSaved()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
          </button>
          <button
            onClick={handleDelete}
            className="p-1 hover:bg-red-100 text-red-600 rounded transition-colors"
            title="Delete note"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <div className="p-3">
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Write your notes here..."
          />

          <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
            <span>
              {content.replace(/<[^>]*>/g, '').trim().length} characters
            </span>
            <span className="text-gray-400">Auto-saves</span>
          </div>
        </div>
      )}

      {isMinimized && (
        <div className="p-3">
          <div
            className="text-sm text-gray-600 line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: content || '<span class="text-gray-400">Empty note</span>'
            }}
          />
        </div>
      )}
    </div>
  );
}
