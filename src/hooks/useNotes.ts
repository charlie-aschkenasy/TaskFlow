import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Note } from '../types';

export function useNotes(sectionId: string | null) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    if (!sectionId) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated');
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('notes')
        .select('*')
        .eq('section_id', sectionId)
        .eq('user_id', user.id)
        .order('order_index', { ascending: true });

      if (fetchError) throw fetchError;

      const formattedNotes: Note[] = (data || []).map(note => ({
        id: note.id,
        content: note.content,
        sectionId: note.section_id,
        userId: note.user_id,
        createdAt: note.created_at,
        updatedAt: note.updated_at,
        orderIndex: note.order_index,
      }));

      setNotes(formattedNotes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [sectionId]);

  useEffect(() => {
    fetchNotes();

    if (!sectionId) return;

    const channel = supabase
      .channel(`notes_changes_${sectionId}`)
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
          filter: `section_id=eq.${sectionId}`
        },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sectionId, fetchNotes]);

  const addNote = async (sectionId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error('User not authenticated');

      const maxOrderIndex = notes.length > 0
        ? Math.max(...notes.map(n => n.orderIndex))
        : -1;

      const { data, error } = await supabase
        .from('notes')
        .insert({
          content: '',
          section_id: sectionId,
          user_id: user.id,
          order_index: maxOrderIndex + 1,
        })
        .select()
        .single();

      if (error) throw error;

      const newNote: Note = {
        id: data.id,
        content: data.content,
        sectionId: data.section_id,
        userId: data.user_id,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        orderIndex: data.order_index,
      };

      setNotes(prev => [...prev, newNote]);
      return newNote;
    } catch (err) {
      console.error('Error adding note:', err);
      throw err;
    }
  };

  const updateNote = async (id: string, content: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .update({ content })
        .eq('id', id);

      if (error) throw error;

      setNotes(prev =>
        prev.map(note =>
          note.id === id
            ? { ...note, content, updatedAt: new Date().toISOString() }
            : note
        )
      );
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setNotes(prev => prev.filter(note => note.id !== id));
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  };

  const reorderNotes = async (reorderedNotes: Note[]) => {
    try {
      const updates = reorderedNotes.map((note, index) => ({
        id: note.id,
        order_index: index,
      }));

      for (const update of updates) {
        await supabase
          .from('notes')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      setNotes(reorderedNotes);
    } catch (err) {
      console.error('Error reordering notes:', err);
      throw err;
    }
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    reorderNotes,
    refetch: fetchNotes,
  };
}
