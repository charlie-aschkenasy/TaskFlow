import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';

export interface NoteSection {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  order_index: number;
}

export function useNoteSections() {
  const [sections, setSections] = useState<NoteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSections();
      subscribeToSections();
    }
  }, [user]);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('note_sections')
        .select('*')
        .order('order_index', { ascending: true })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching note sections:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToSections = () => {
    const channel = supabase
      .channel('note_sections_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'note_sections',
        },
        () => {
          fetchSections();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addSection = async (name: string) => {
    if (!user) return;

    try {
      const maxOrderIndex = sections.length > 0
        ? Math.max(...sections.map(s => s.order_index))
        : -1;

      const { data, error } = await supabase
        .from('note_sections')
        .insert([
          {
            name,
            user_id: user.id,
            order_index: maxOrderIndex + 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        await supabase
          .from('notes')
          .insert([
            {
              content: '',
              section_id: data.id,
              user_id: user.id,
            },
          ]);
      }

      return data;
    } catch (error) {
      console.error('Error adding note section:', error);
      throw error;
    }
  };

  const updateSection = async (id: string, name: string) => {
    try {
      const { error } = await supabase
        .from('note_sections')
        .update({ name })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating note section:', error);
      throw error;
    }
  };

  const deleteSection = async (id: string) => {
    try {
      const { error } = await supabase
        .from('note_sections')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting note section:', error);
      throw error;
    }
  };

  return {
    sections,
    loading,
    addSection,
    updateSection,
    deleteSection,
    refetch: fetchSections,
  };
}
