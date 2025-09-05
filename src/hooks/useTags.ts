import { useState, useEffect } from 'react';

const DEFAULT_TAGS = [
  'urgent',
  'study',
  'exam',
  'assignment',
  'meeting',
  'research',
  'group-project',
  'presentation',
  'reading',
  'lab',
  'internship',
  'club',
  'networking',
  'career',
  'personal'
];

export function useTags() {
  const [availableTags, setAvailableTags] = useState<string[]>(DEFAULT_TAGS);

  useEffect(() => {
    const savedTags = localStorage.getItem('availableTags');
    if (savedTags) {
      setAvailableTags(JSON.parse(savedTags));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('availableTags', JSON.stringify(availableTags));
  }, [availableTags]);

  const addTag = (tag: string) => {
    const normalizedTag = tag.toLowerCase().trim().replace(/\s+/g, '-');
    if (normalizedTag && !availableTags.includes(normalizedTag)) {
      setAvailableTags(prev => [...prev, normalizedTag].sort());
    }
    return normalizedTag;
  };

  const removeTag = (tag: string) => {
    setAvailableTags(prev => prev.filter(t => t !== tag));
  };

  const getTagColor = (tag: string): string => {
    // Generate consistent colors based on tag name
    const colors = [
      '#3B82F6', '#10B981', '#F59E0B', '#EF4444', 
      '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
      '#F97316', '#6366F1', '#14B8A6', '#F43F5E'
    ];
    
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return {
    availableTags,
    addTag,
    removeTag,
    getTagColor,
  };
}