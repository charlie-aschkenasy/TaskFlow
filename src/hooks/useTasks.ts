import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { useTaskLists } from './useTaskLists';
import { Task } from '../types';

// Helper function to generate next occurrence date
function getNextOccurrence(task: Task): Date | null {
  if (!task.recurring?.enabled || !task.dueDate) return null;
  
  const { frequency, interval, daysOfWeek, endDate } = task.recurring;
  const currentDue = new Date(task.dueDate);
  let nextDate = new Date(currentDue);
  
  switch (frequency) {
    case 'daily':
      nextDate.setDate(nextDate.getDate() + interval);
      break;
    case 'weekly':
      if (daysOfWeek && daysOfWeek.length > 0) {
        // Find next occurrence based on selected days
        const currentDay = nextDate.getDay();
        const sortedDays = [...daysOfWeek].sort();
        
        // Find next day in current week
        let nextDay = sortedDays.find(day => day > currentDay);
        
        if (nextDay !== undefined) {
          // Next occurrence is in current week
          nextDate.setDate(nextDate.getDate() + (nextDay - currentDay));
        } else {
          // Next occurrence is in next interval of weeks
          nextDate.setDate(nextDate.getDate() + (7 * interval - currentDay + sortedDays[0]));
        }
      } else {
        nextDate.setDate(nextDate.getDate() + (7 * interval));
      }
      break;
    case 'monthly':
      nextDate.setMonth(nextDate.getMonth() + interval);
      break;
    case 'yearly':
      nextDate.setFullYear(nextDate.getFullYear() + interval);
      break;
    case 'custom':
      // For custom, treat similar to weekly for now
      if (daysOfWeek && daysOfWeek.length > 0) {
        const currentDay = nextDate.getDay();
        const sortedDays = [...daysOfWeek].sort();
        let nextDay = sortedDays.find(day => day > currentDay);
        
        if (nextDay !== undefined) {
          nextDate.setDate(nextDate.getDate() + (nextDay - currentDay));
        } else {
          nextDate.setDate(nextDate.getDate() + (7 - currentDay + sortedDays[0]));
        }
      }
      break;
  }
  
  // Check if next occurrence is beyond end date
  if (endDate && nextDate > new Date(endDate)) {
    return null;
  }
  
  return nextDate;
}

export function useTasks(activeListId: string = 'all') {
  const [tasks, setTasks] = useState<Task[]>([]);
  const { user } = useAuth();
  const { getPersonalListId } = useTaskLists();

  // Load tasks from Supabase on mount
  useEffect(() => {
    if (!user) return;

    const loadTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading tasks:', error);
        return;
      }

      // Convert database format to app format
      const formattedTasks = data.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        completed: task.completed,
        type: task.type || 'task', // Default to 'task' for backward compatibility
        timeFrame: task.time_frame,
        project: task.project,
        listId: task.list_id,
        priority: task.priority,
        dueDate: task.due_date || undefined,
        createdAt: task.created_at,
        parentId: task.parent_id,
        tags: task.tags || [],
        attachments: task.attachments || [],
        reminders: task.reminders || [],
        recurring: task.recurring,
        subtasks: [], // Will be populated by organizing parent-child relationships
      }));

      // Organize tasks into parent-child relationships
      const taskMap = new Map(formattedTasks.map(task => [task.id, { ...task, subtasks: [] }]));
      const rootTasks: Task[] = [];

      formattedTasks.forEach(task => {
        if (task.parentId) {
          const parent = taskMap.get(task.parentId);
          if (parent) {
            parent.subtasks.push(taskMap.get(task.id)!);
          }
        } else {
          rootTasks.push(taskMap.get(task.id)!);
        }
      });

      setTasks(rootTasks);
    };

    loadTasks();

    // Set up real-time subscription
    const subscription = supabase
      .channel('tasks')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'tasks',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          loadTasks(); // Reload tasks when changes occur
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Save task to Supabase
  const saveTaskToSupabase = async (task: Task) => {
    if (!user) return;

    const taskData = {
      id: task.id,
      title: task.title,
      description: task.description,
      completed: task.completed,
      type: task.type,
      time_frame: task.timeFrame,
      project: task.project,
      list_id: task.listId,
      priority: task.priority,
      due_date: task.dueDate,
      created_at: task.createdAt,
      parent_id: task.parentId,
      tags: task.tags,
      attachments: task.attachments,
      reminders: task.reminders,
      recurring: task.recurring,
      user_id: user.id,
    };

    const { error } = await supabase
      .from('tasks')
      .upsert(taskData);

    if (error) {
      console.error('Error saving task:', error);
    }
  };

  // Delete task from Supabase
  const deleteTaskFromSupabase = async (taskId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Check for recurring tasks that need new instances
  useEffect(() => {
    const checkRecurringTasks = () => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      setTasks(prevTasks => {
        const newTasks = [...prevTasks];
        let hasNewTasks = false;
        
        prevTasks.forEach(task => {
          if (task.recurring?.enabled && task.dueDate && task.completed) {
            const lastGenerated = task.recurring.lastGenerated ? new Date(task.recurring.lastGenerated) : new Date(task.createdAt);
            const daysSinceGenerated = Math.floor((now.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60 * 24));
            
            // Only generate if it's been at least a day since last generation
            if (daysSinceGenerated >= 1) {
              const nextOccurrence = getNextOccurrence(task);
              
              if (nextOccurrence && nextOccurrence.toISOString().split('T')[0] <= today) {
                // Create new instance of recurring task
                const newTask: Task = {
                  ...task,
                  id: crypto.randomUUID(),
                  completed: false,
                  dueDate: nextOccurrence.toISOString().split('T')[0],
                  createdAt: now.toISOString(),
                  recurring: {
                    ...task.recurring,
                    lastGenerated: now.toISOString(),
                  },
                };
                
                newTasks.push(newTask);
                hasNewTasks = true;
                
                // Update original task's lastGenerated
                const originalIndex = newTasks.findIndex(t => t.id === task.id);
                if (originalIndex !== -1) {
                  newTasks[originalIndex] = {
                    ...task,
                    recurring: {
                      ...task.recurring,
                      lastGenerated: now.toISOString(),
                    },
                  };
                }
              }
            }
          }
        });
        
        return hasNewTasks ? newTasks : prevTasks;
      });
    };
    
    // Check immediately and then every hour
    checkRecurringTasks();
    const interval = setInterval(checkRecurringTasks, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const addTask = (task: Omit<Task, 'id' | 'createdAt' | 'subtasks'>, listId?: string) => {
    if (!user) return '';

    const personalListId = getPersonalListId();
    
    // Use the task's listId first, then the provided listId, then fall back to personal
    const targetListId = task.listId || listId || (activeListId === 'all' ? personalListId : activeListId);
    
    const newTask: Task = {
      ...task,
      type: task.type || 'task', // Default to 'task' if not specified
      tags: task.tags || [],
      attachments: task.attachments || [],
      reminders: task.reminders || [],
      listId: targetListId,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      subtasks: [],
    };
    
    setTasks(prev => [...prev, newTask]);
    saveTaskToSupabase(newTask);
    return newTask.id;
  };

  const addSubtask = async (parentId: string, subtask: Omit<Task, 'id' | 'createdAt' | 'subtasks' | 'parentId' | 'listId'>) => {
    if (!user) return;

    // Find the parent task to get its listId
    const parentTask = getTaskById(parentId);
    if (!parentTask) return;
    
    const newSubtask: Task = {
      ...subtask,
      type: subtask.type || 'task', // Default to 'task' if not specified
      tags: subtask.tags || [],
      attachments: subtask.attachments || [],
      reminders: subtask.reminders || [],
      listId: parentTask.listId,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      subtasks: [],
      parentId,
    };
    
    setTasks(prev => prev.map(task => 
      addSubtaskRecursive(task, parentId, newSubtask)
    ));
    
    await saveTaskToSupabase(newSubtask);
  };

  const addSubtaskRecursive = (task: Task, parentId: string, newSubtask: Task): Task => {
    if (task.id === parentId) {
      return { ...task, subtasks: [...task.subtasks, newSubtask] };
    }
    return {
      ...task,
      subtasks: task.subtasks.map(subtask => addSubtaskRecursive(subtask, parentId, newSubtask))
    };
  };

  const updateTask = async (id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => updateTaskRecursive(task, id, updates)));
    
    // Find the updated task and save to Supabase
    const updatedTask = getTaskById(id);
    if (updatedTask) {
      await saveTaskToSupabase({ ...updatedTask, ...updates });
    }
    
    // Force a re-render to apply new sorting
    setTasks(prev => [...prev]);
  };

  const updateTaskRecursive = (task: Task, id: string, updates: Partial<Task>): Task => {
    if (task.id === id) {
      return { ...task, ...updates };
    }
    return {
      ...task,
      subtasks: task.subtasks.map(subtask => updateTaskRecursive(subtask, id, updates))
    };
  };

  const deleteTask = async (id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id).map(task => deleteTaskRecursive(task, id)));
    await deleteTaskFromSupabase(id);
  };

  const moveTasksToList = async (fromListId: string, toListId: string) => {
    setTasks(prev => prev.map(task => 
      task.listId === fromListId ? { ...task, listId: toListId } : task
    ));
    
    // Update all affected tasks in Supabase
    for (const task of tasks) {
      if (task.listId === fromListId) {
        await saveTaskToSupabase({ ...task, listId: toListId });
      }
    }
  };

  const deleteTaskRecursive = (task: Task, idToDelete: string): Task => {
    return {
      ...task,
      subtasks: task.subtasks.filter(subtask => subtask.id !== idToDelete).map(subtask => deleteTaskRecursive(subtask, idToDelete))
    };
  };

  const toggleTask = async (id: string) => {
    await updateTask(id, { completed: !getTaskById(id)?.completed });
  };

  const getTaskById = (id: string): Task | null => {
    for (const task of tasks) {
      const found = findTaskRecursive(task, id);
      if (found) return found;
    }
    return null;
  };

  const findTaskRecursive = (task: Task, id: string): Task | null => {
    if (task.id === id) return task;
    for (const subtask of task.subtasks) {
      const found = findTaskRecursive(subtask, id);
      if (found) return found;
    }
    return null;
  };

  const getAllTasks = (filterByList: boolean = true): Task[] => {
    // Only return top-level tasks, not subtasks
    const topLevelTasks = tasks;
    
    if (!filterByList || activeListId === 'all') {
      return topLevelTasks;
    }
    
    // Filter tasks by the active list ID
    const filteredTasks = topLevelTasks.filter(task => task.listId === activeListId);
    console.log(`Filtering tasks for listId: ${activeListId}`, {
      totalTasks: topLevelTasks.length,
      filteredTasks: filteredTasks.length,
      taskListIds: topLevelTasks.map(t => ({ id: t.id, title: t.title, listId: t.listId }))
    });
    return filteredTasks;
  };

  const reorderTasks = (draggableId: string, sourceIndex: number, destinationIndex: number, droppableId: string) => {
    setTasks(prev => {
      const newTasks = [...prev];
      
      // Find the task being moved
      const taskIndex = newTasks.findIndex(task => task.id === draggableId);
      if (taskIndex === -1) return prev;
      
      // Remove the task from its current position
      const [movedTask] = newTasks.splice(taskIndex, 1);
      
      // Calculate the new position based on the destination index
      // This is a simplified approach - in a real app you might want more sophisticated ordering
      const insertIndex = destinationIndex > sourceIndex ? destinationIndex : destinationIndex;
      
      // Insert the task at the new position
      newTasks.splice(insertIndex, 0, movedTask);
      
      return newTasks;
    });
  };

  const moveTaskToList = async (taskId: string, newListId: string, newTimeFrame?: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        const updates: Partial<Task> = { listId: newListId };
        if (newTimeFrame) {
          updates.timeFrame = newTimeFrame as Task['timeFrame'];
        }
        // Note: We'll await this in the calling component
        saveTaskToSupabase({ ...task, ...updates });
        return { ...task, ...updates };
      }
      return task;
    }));
  };

  return {
    tasks,
    addTask,
    addSubtask,
    updateTask,
    deleteTask,
    toggleTask,
    getTaskById,
    getAllTasks,
    moveTasksToList,
    reorderTasks,
    moveTaskToList,
    reorderTasks,
    moveTaskToList,
  };
}