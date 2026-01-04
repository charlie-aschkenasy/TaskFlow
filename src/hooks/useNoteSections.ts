import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { NoteSection } from '../types';

export function useNoteSections() {
  const [sections, setSections] = useState<NoteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('note_sections')
        .select('*')
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedSections: NoteSection[] = (data || []).map(section => ({
        id: section.id,
        name: section.name,
        color: section.color,
        orderIndex: section.order_index,
        userId: section.user_id,
        createdAt: section.created_at,
        updatedAt: section.updated_at,
      }));

      setSections(formattedSections);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sections');
      console.error('Error fetching note sections:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSections();

    const channel = supabase
      .channel('note_sections_changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'note_sections' },
        () => {
          fetchSections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addSection = async (name: string, color: string = '#3b82f6') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const maxOrderIndex = sections.length > 0
        ? Math.max(...sections.map(s => s.orderIndex))
        : -1;

      const { data, error } = await supabase
        .from('note_sections')
        .insert({
          name,
          color,
          user_id: user.id,
          order_index: maxOrderIndex + 1,
        })
        .select()
        .single();

      if (error) throw error;

      const newSection: NoteSection = {
        id: data.id,
        name: data.name,
        color: data.color,
        orderIndex: data.order_index,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      };

      setSections(prev => [...prev, newSection]);
      return newSection;
    } catch (err) {
      console.error('Error adding section:', err);
      throw err;
    }
  };

  const updateSection = async (id: string, updates: Partial<NoteSection>) => {
    try {
      const dbUpdates: any = {};

      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.orderIndex !== undefined) dbUpdates.order_index = updates.orderIndex;

      const { error } = await supabase
        .from('note_sections')
        .update(dbUpdates)
        .eq('id', id);

      if (error) throw error;

      setSections(prev =>
        prev.map(section =>
          section.id === id ? { ...section, ...updates } : section
        )
      );
    } catch (err) {
      console.error('Error updating section:', err);
      throw err;
    }
  };

  const deleteSection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('note_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setSections(prev => prev.filter(section => section.id !== id));
    } catch (err) {
      console.error('Error deleting section:', err);
      throw err;
    }
  };

  const reorderSections = async (reorderedSections: NoteSection[]) => {
    try {
      const updates = reorderedSections.map((section, index) => ({
        id: section.id,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from('note_sections')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      setSections(reorderedSections);
    } catch (err) {
      console.error('Error reordering sections:', err);
      throw err;
    }
  };

  return {
    sections,
    loading,
    error,
    addSection,
    updateSection,
    deleteSection,
    reorderSections,
    refetch: fetchSections,
  };
}
