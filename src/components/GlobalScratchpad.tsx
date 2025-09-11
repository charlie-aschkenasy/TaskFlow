import React, { useState, useEffect } from 'react';
import { StickyNote, X, Minimize2, Maximize2 } from 'lucide-react';
import { RichTextEditor } from './RichTextEditor';

interface GlobalScratchpadProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalScratchpad({ isOpen, onClose }: GlobalScratchpadProps) {
  const [content, setContent] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load content from localStorage on mount
  useEffect(() => {
    const savedContent = localStorage.getItem('taskflow-scratchpad');
    const savedTimestamp = localStorage.getItem('taskflow-scratchpad-timestamp');
    
    if (savedContent) {
      setContent(savedContent);
    }
    
    if (savedTimestamp) {
      setLastSaved(new Date(savedTimestamp));
    }
  }, []);

  // Auto-save content to localStorage whenever it changes
  useEffect(() => {
    if (content !== '') {
      const saveTimeout = setTimeout(() => {
        localStorage.setItem('taskflow-scratchpad', content);
        localStorage.setItem('taskflow-scratchpad-timestamp', new Date().toISOString());
        setLastSaved(new Date());
      }, 1000); // Auto-save after 1 second of inactivity

      return () => clearTimeout(saveTimeout);
    }
  }, [content]);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear all notes? This action cannot be undone.')) {
      setContent('');
      localStorage.removeItem('taskflow-scratchpad');
      localStorage.removeItem('taskflow-scratchpad-timestamp');
      setLastSaved(null);
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-40"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`fixed z-50 bg-white rounded-lg shadow-2xl border transition-all duration-200 ${
        isMinimized 
          ? 'bottom-4 right-4 w-80 h-12' 
          : 'bottom-4 right-4 w-96 h-[500px]'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <div className="flex items-center gap-2">
            <StickyNote size={18} className="text-yellow-600" />
            <h3 className="font-medium text-gray-900">Scratchpad</h3>
            {lastSaved && !isMinimized && (
              <span className="text-xs text-gray-500 ml-2">
                {formatLastSaved()}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
            </button>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded transition-colors"
              title="Close"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Content */}
        {!isMinimized && (
          <div className="flex flex-col h-[calc(100%-48px)]">
            {/* Editor */}
            <div className="flex-1 p-3">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Write your notes here... They'll be saved automatically."
              />
            </div>
            
            {/* Footer */}
            <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
              <div className="text-xs text-gray-500">
                {content.replace(/<[^>]*>/g, '').trim().length} characters
              </div>
              
              <div className="flex items-center gap-2">
                {content && (
                  <button
                    onClick={handleClear}
                    className="text-xs text-red-600 hover:text-red-800 transition-colors"
                  >
                    Clear All
                  </button>
                )}
                <div className="text-xs text-gray-500">
                  Auto-saves
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}