import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { TaskList } from '../types';

// Generate UUIDs for default task lists
const generateDefaultTaskLists = (): TaskList[] => [
  { id: crypto.randomUUID(), name: 'Personal', color: '#10B981', icon: '🏠' },
  { id: crypto.randomUUID(), name: 'Work', color: '#3B82F6', icon: '💼' },
  { id: crypto.randomUUID(), name: 'School', color: '#F59E0B', icon: '🎓' },
  { id: crypto.randomUUID(), name: 'Health', color: '#EF4444', icon: '💪' },
  { id: crypto.randomUUID(), name: 'Hobbies', color: '#8B5CF6', icon: '🎨' },
];

export function useTaskLists() {
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [activeListId, setActiveListId] = useState<string>('all');
  const [personalListId, setPersonalListId] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadTaskLists = async () => {
      const { data, error } = await supabase
        .from('task_lists')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading task lists:', error);
        return;
      }

      if (data.length === 0) {
        // Create default task lists for new users
        const defaultLists = generateDefaultTaskLists();
        const defaultListsForDb = defaultLists.map(list => ({
          ...list,
          user_id: user.id,
          created_at: new Date().toISOString(),
        }));

        const { error: insertError } = await supabase
          .from('task_lists')
          .insert(defaultListsForDb);

        if (!insertError) {
          setTaskLists(defaultLists);
          // Set the personal list ID (first in the array)
          const personalList = defaultLists.find(list => list.name === 'Personal');
          if (personalList) {
            setPersonalListId(personalList.id);
          }
        }
      } else {
        const formattedLists = data.map(list => ({
          id: list.id,
          name: list.name,
          color: list.color,
          icon: list.icon,
        }));
        setTaskLists(formattedLists);
        
        // Set the personal list ID
        const personalList = formattedLists.find(list => list.name === 'Personal');
        if (personalList) {
          setPersonalListId(personalList.id);
        }
      }
    };

    loadTaskLists();

    // Set up real-time subscription
    const subscription = supabase
      .channel('task_lists')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'task_lists',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          loadTaskLists();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const saveTaskListToSupabase = async (taskList: TaskList) => {
    if (!user) return;

    const { error } = await supabase
      .from('task_lists')
      .upsert({
        id: taskList.id,
        name: taskList.name,
        color: taskList.color,
        icon: taskList.icon,
        user_id: user.id,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving task list:', error);
    }
  };

  useEffect(() => {
    const savedActiveList = localStorage.getItem('activeListId');
    if (savedActiveList) {
      setActiveListId(savedActiveList);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('taskLists', JSON.stringify(taskLists));
  }, [taskLists]);

  const addTaskList = async (name: string, color: string, icon: string) => {
    if (!user) return '';

    const newTaskList: TaskList = {
      id: crypto.randomUUID(),
      name,
      color,
      icon,
    };
    setTaskLists(prev => [...prev, newTaskList]);
    await saveTaskListToSupabase(newTaskList);
    return newTaskList.id;
  };

  const updateTaskList = async (id: string, updates: Partial<TaskList>) => {
    setTaskLists(prev => prev.map(list => 
      list.id === id ? { ...list, ...updates } : list
    ));
    
    const updatedList = taskLists.find(list => list.id === id);
    if (updatedList) {
      await saveTaskListToSupabase({ ...updatedList, ...updates });
    }
  };

  const deleteTaskList = async (id: string) => {
    if (!user) return;

    setTaskLists(prev => prev.filter(list => list.id !== id));
    if (activeListId === id) {
      setActiveListId('all');
    }
    
    // Delete from Supabase
    await supabase
      .from('task_lists')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  };

  const getTaskListById = (id: string) => {
    return taskLists.find(list => list.id === id);
  };

  const getActiveTaskList = () => {
    if (activeListId === 'all') return null;
    return getTaskListById(activeListId);
  };

  const getPersonalListId = () => {
    return personalListId || taskLists.find(list => list.name === 'Personal')?.id || '';
  };
  return {
    taskLists,
    activeListId,
    setActiveListId,
    addTaskList,
    updateTaskList,
    deleteTaskList,
    getTaskListById,
    getActiveTaskList,
    getPersonalListId,
  };
}