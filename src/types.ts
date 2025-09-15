export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  type: 'task' | 'event' | 'assignment';
  timeFrame: 'daily' | 'weekly' | 'monthly' | 'yearly';
  project: string;
  listId: string;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
  parentId?: string;
  subtasks: Task[];
  tags: string[];
  attachments: Attachment[];
  reminders: Reminder[];
  recurring?: {
    enabled: boolean;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
    interval: number; // e.g., every 2 weeks = interval: 2, frequency: 'weekly'
    daysOfWeek?: number[]; // 0-6, Sunday-Saturday (for weekly/custom)
    endDate?: string;
    lastGenerated?: string;
  };
}

export interface Reminder {
  id: string;
  type: 'absolute' | 'relative';
  absoluteTime?: string; // ISO string for absolute reminders
  relativeAmount?: number; // e.g., 30 for "30 minutes before"
  relativeUnit?: 'minutes' | 'hours' | 'days' | 'weeks';
  message?: string; // Custom reminder message
  enabled: boolean;
  triggered?: boolean; // Track if reminder has been triggered
}
export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'link';
  url: string;
  size?: number; // in bytes, for files
  uploadedAt: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface TaskList {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export type ViewMode = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'dashboard' | 'calendar';
export type ViewMode = 'all' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'dashboard' | 'task-dashboard' | 'calendar' | 'tags' | 'projects' | 'priority';

export interface FilterState {
  timeFrame: string;
  project: string;
  completed: string;
  priority: string;
  searchQuery: string;
  tags: string[];
  type: string[];
}

export type SortOption = 'createdAt' | 'dueDate' | 'priority' | 'title' | 'project' | 'tags';

export interface SortConfig {
  primary: SortOption;
  primaryAscending: boolean;
  secondary?: SortOption;
  secondaryAscending: boolean;
}