import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Tag } from 'lucide-react';
import { useTags } from '../hooks/useTags';

interface MultiSelectTagsProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
}

export function MultiSelectTags({ 
  availableTags, 
  selectedTags, 
  onTagsChange, 
  placeholder = "Select tags..." 
}: MultiSelectTagsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { getTagColor } = useTags();

  // Filter tags based on search term
  const filteredTags = availableTags.filter(tag =>
    tag.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedTags.includes(tag)
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter(t => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  };

  const removeTag = (tagToRemove: string) => {
    onTagsChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const clearAll = () => {
    onTagsChange([]);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Main Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Tag size={14} className="text-gray-400 flex-shrink-0" />
          {selectedTags.length === 0 ? (
            <span className="text-gray-500 text-sm">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {selectedTags.slice(0, 3).map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded-full"
                  style={{ backgroundColor: getTagColor(tag) }}
                >
                  {tag}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeTag(tag);
                    }}
                    className="hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </span>
              ))}
              {selectedTags.length > 3 && (
                <span className="text-xs text-gray-500 py-0.5">
                  +{selectedTags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-64 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tags..."
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Selected Tags Section */}
          {selectedTags.length > 0 && (
            <div className="p-2 bg-blue-50 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-700">
                  Selected ({selectedTags.length})
                </span>
                <button
                  onClick={clearAll}
                  className="text-xs text-red-600 hover:text-red-800 transition-colors"
                >
                  Clear all
                </button>
              </div>
              <div className="flex flex-wrap gap-1">
                {selectedTags.map(tag => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-white rounded-full"
                    style={{ backgroundColor: getTagColor(tag) }}
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:bg-black hover:bg-opacity-20 rounded-full p-0.5 transition-colors"
                    >
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Available Tags */}
          <div className="max-h-40 overflow-y-auto">
            {filteredTags.length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-500">
                {searchTerm ? 'No tags found' : 'No more tags available'}
              </div>
            ) : (
              <div className="p-1">
                {filteredTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-sm hover:bg-gray-100 rounded transition-colors text-left"
                  >
                    <span
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: getTagColor(tag) }}
                    />
                    <span className="flex-1 truncate">{tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}