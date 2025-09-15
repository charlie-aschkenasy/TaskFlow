import { Task } from '../types';

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);
  return dueDate < today && !task.completed;
}

export function getTaskCountsByTimeframe(tasks: Task[]) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  const allTasks = getAllTasksIncludingSubtasks(tasks);

  return {
    overdue: allTasks.filter(task => isTaskOverdue(task)).length,
    today: allTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= today && dueDate < tomorrow;
    }).length,
    upcoming: allTasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= tomorrow && dueDate < nextWeek;
    }).length,
    total: allTasks.length,
    completed: allTasks.filter(task => task.completed).length
  };
}

export function getAllTasksIncludingSubtasks(tasks: Task[]): Task[] {
  const flatten = (taskList: Task[]): Task[] => {
    const result: Task[] = [];
    (taskList || []).forEach(task => {
      result.push(task);
      if (task.subtasks && task.subtasks.length > 0) {
        result.push(...flatten(task.subtasks));
      }
    });
    return result;
  };
  
  return flatten(tasks);
}

export function filterTasks(tasks: Task[], filters: {
  search?: string;
  priority?: string;
  status?: string;
  tags?: string[];
  project?: string;
  assignee?: string;
  timeFrame?: string;
  completed?: string;
  searchQuery?: string;
  type?: string[];
}): Task[] {
  return tasks.filter(task => {
    // Search filter
    if (filters.search || filters.searchQuery) {
      const searchTerm = filters.search || filters.searchQuery || '';
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch = 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Time frame filter
    if (filters.timeFrame && filters.timeFrame !== 'all') {
      if (task.timeFrame !== filters.timeFrame) return false;
    }

    // Priority filter
    if (filters.priority && filters.priority !== 'all') {
      if (task.priority !== filters.priority) return false;
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'completed' && !task.completed) return false;
      if (filters.status === 'pending' && task.completed) return false;
      if (filters.status === 'overdue' && !isTaskOverdue(task)) return false;
    }

    // Completed filter (alternative to status)
    if (filters.completed && filters.completed !== 'all') {
      if (filters.completed === 'completed' && !task.completed) return false;
      if (filters.completed === 'pending' && task.completed) return false;
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(filterTag =>
        task.tags && task.tags.includes(filterTag)
      );
      if (!hasMatchingTag) return false;
    }

    // Project filter
    if (filters.project && filters.project !== 'all') {
      if (task.project !== filters.project) return false;
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(task.type)) return false;
    }

    // Assignee filter
    if (filters.assignee && filters.assignee !== 'all') {
      if (task.assignedTo !== filters.assignee) return false;
    }

    return true;
  });
}

export function getAllUsedTags(tasks: Task[]): string[] {
  const allTasks = getAllTasksIncludingSubtasks(tasks);
  const tagSet = new Set<string>();
  
  allTasks.forEach(task => {
    if (task.tags && task.tags.length > 0) {
      task.tags.forEach(tag => tagSet.add(tag));
    }
  });
  
  return Array.from(tagSet).sort();
}

export function sortTasks(tasks: Task[], sortConfig: { primary: string; primaryAscending: boolean; secondary?: string; secondaryAscending: boolean }): Task[] {
  const sortedTasks = [...tasks];
  
  const sortFunction = (a: Task, b: Task) => {
    // First priority: completed tasks always go to bottom
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Primary sort
    const primaryResult = applySortCriteria(a, b, sortConfig.primary, sortConfig.primaryAscending);
    if (primaryResult !== 0) {
      return primaryResult;
    }
    
    // Secondary sort (if primary values are equal and secondary is specified)
    if (sortConfig.secondary) {
      return applySortCriteria(a, b, sortConfig.secondary, sortConfig.secondaryAscending);
    }
    
    return 0;
  };
  
  const applySortCriteria = (a: Task, b: Task, sortBy: string, ascending: boolean): number => {
    switch (sortBy) {
    case 'dueDate':
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      const diff = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      return ascending ? diff : -diff;
    
    case 'priority':
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      const priorityDiff = bPriority - aPriority;
      return ascending ? -priorityDiff : priorityDiff;
    
    case 'createdAt':
      return ascending 
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    
    case 'title':
      return ascending ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title);
    
    case 'project':
      // Sort by project name
      return ascending ? a.project.localeCompare(b.project) : b.project.localeCompare(a.project);
    
    case 'tags':
      // Sort by first tag alphabetically, tasks with no tags go to end
      const aFirstTag = a.tags && a.tags.length > 0 ? a.tags[0].toLowerCase() : '';
      const bFirstTag = b.tags && b.tags.length > 0 ? b.tags[0].toLowerCase() : '';
      
      // If one has tags and other doesn't, prioritize the one with tags
      if (aFirstTag && !bFirstTag) return ascending ? -1 : 1;
      if (!aFirstTag && bFirstTag) return ascending ? 1 : -1;
      if (!aFirstTag && !bFirstTag) return 0;
      
      // Both have tags, sort alphabetically
      return ascending ? aFirstTag.localeCompare(bFirstTag) : bFirstTag.localeCompare(aFirstTag);
    
    default:
      return 0;
    }
  };
  
  // Sort all tasks with completed ones automatically at bottom
  return sortedTasks.sort(sortFunction);
}