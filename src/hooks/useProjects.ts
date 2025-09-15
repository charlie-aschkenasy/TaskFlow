import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { Project } from '../types';

const generateDefaultProjects = (): Project[] => [
  { id: crypto.randomUUID(), name: 'Work', color: '#3B82F6' },
  { id: crypto.randomUUID(), name: 'Personal', color: '#10B981' },
  { id: crypto.randomUUID(), name: 'Learning', color: '#F59E0B' },
  { id: crypto.randomUUID(), name: 'Health', color: '#EF4444' },
  { id: crypto.randomUUID(), name: 'Hobbies', color: '#8B5CF6' },
  { id: crypto.randomUUID(), name: 'Other', color: '#6B7280' },
];

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [otherProjectId, setOtherProjectId] = useState<string>('');
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const loadProjects = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading projects:', error);
        return;
      }

      if (data.length === 0) {
        // Create default projects for new users
        const defaultProjects = generateDefaultProjects().map(project => ({
          ...project,
          user_id: user.id,
          created_at: new Date().toISOString(),
        }));

        const { error: insertError } = await supabase
          .from('projects')
          .insert(defaultProjects);

        if (!insertError) {
          setProjects(defaultProjects);
          // Find and set the Other project ID
          const otherProject = defaultProjects.find(p => p.name === 'Other');
          if (otherProject) {
            setOtherProjectId(otherProject.id);
          }
        }
      } else {
        setProjects(data);
        
        // Find the Other project or create it if it doesn't exist
        const otherProject = data.find(p => p.name === 'Other');
        if (otherProject) {
          setOtherProjectId(otherProject.id);
        } else {
          // Create the Other project if it doesn't exist
          const newOtherProject = {
            id: crypto.randomUUID(),
            name: 'Other',
            color: '#6B7280',
            user_id: user.id,
            created_at: new Date().toISOString(),
          };

          const { error: insertError } = await supabase
            .from('projects')
            .insert([newOtherProject]);

          if (!insertError) {
            setProjects(prev => [...prev, newOtherProject]);
            setOtherProjectId(newOtherProject.id);
          }
        }
      }
    };

    loadProjects();

    // Set up real-time subscription
    const subscription = supabase
      .channel('projects')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'projects',
          filter: `user_id=eq.${user.id}`
        }, 
        () => {
          loadProjects();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const saveProjectToSupabase = async (project: Project) => {
    if (!user) return;

    const { error } = await supabase
      .from('projects')
      .upsert({
        id: project.id,
        name: project.name,
        color: project.color,
        user_id: user.id,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving project:', error);
    }
  };

  const addProject = async (name: string, color: string) => {
    if (!user) return '';

    const newProject: Project = {
      id: crypto.randomUUID(),
      name,
      color,
    };
    setProjects(prev => [...prev, newProject]);
    await saveProjectToSupabase(newProject);
    return newProject.id;
  };

  const updateProject = async (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      project.id === id ? { ...project, ...updates } : project
    ));
    
    const updatedProject = projects.find(project => project.id === id);
    if (updatedProject) {
      await saveProjectToSupabase({ ...updatedProject, ...updates });
    }
  };

  const deleteProject = async (id: string) => {
    if (!user) return;

    setProjects(prev => prev.filter(project => project.id !== id));
    
    // Delete from Supabase
    await supabase
      .from('projects')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);
  };

  const getProjectById = (id: string) => {
    return projects.find(project => project.id === id);
  };

  return {
    projects,
    otherProjectId,
    addProject,
    updateProject,
    deleteProject,
    getProjectById,
  };
}