import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface Note {
  id: string;
  content: string;
  section_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export function useNotes(sectionId?: string) {
  const [notes, setNotes] = useState<Record<string, Note>>({});
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchNotes();
      subscribeToNotes();
    }
  }, [user, sectionId]);

  const fetchNotes = async () => {
    try {
      let query = supabase.from('notes').select('*');

      if (sectionId) {
        query = query.eq('section_id', sectionId);
      }

      const { data, error } = await query;

      if (error) throw error;

      const notesMap: Record<string, Note> = {};
      (data || []).forEach((note) => {
        notesMap[note.section_id] = note;
      });

      setNotes(notesMap);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToNotes = () => {
    const channel = supabase
      .channel('notes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notes',
        },
        () => {
          fetchNotes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const updateNote = async (sectionId: string, content: string) => {
    if (!user) return;

    try {
      const note = notes[sectionId];

      if (note) {
        const { error } = await supabase
          .from('notes')
          .update({ content })
          .eq('id', note.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('notes')
          .insert([
            {
              content,
              section_id: sectionId,
              user_id: user.id,
            },
          ]);

        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  };

  const getNoteBySection = (sectionId: string): Note | undefined => {
    return notes[sectionId];
  };

  return {
    notes,
    loading,
    updateNote,
    getNoteBySection,
    refetch: fetchNotes,
  };
}
