import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set up your Supabase project.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          completed: boolean
          time_frame: 'daily' | 'weekly' | 'monthly' | 'yearly'
          project: string
          list_id: string
          priority: 'low' | 'medium' | 'high'
          due_date: string | null
          created_at: string
          parent_id: string | null
          tags: string[]
          attachments: any[]
          reminders: any[]
          recurring: any | null
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          completed?: boolean
          time_frame: 'daily' | 'weekly' | 'monthly' | 'yearly'
          project: string
          list_id: string
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_at?: string
          parent_id?: string | null
          tags?: string[]
          attachments?: any[]
          reminders?: any[]
          recurring?: any | null
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          completed?: boolean
          time_frame?: 'daily' | 'weekly' | 'monthly' | 'yearly'
          project?: string
          list_id?: string
          priority?: 'low' | 'medium' | 'high'
          due_date?: string | null
          created_at?: string
          parent_id?: string | null
          tags?: string[]
          attachments?: any[]
          reminders?: any[]
          recurring?: any | null
          user_id?: string
        }
      }
      task_lists: {
        Row: {
          id: string
          name: string
          color: string
          icon: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          icon: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon?: string
          user_id?: string
          created_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          color: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          user_id?: string
          created_at?: string
        }
      }
    }
  }
}