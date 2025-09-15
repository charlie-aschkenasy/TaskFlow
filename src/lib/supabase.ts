import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

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
          created_at: string
          updated_at: string
          due_date: string | null
          priority: string | null
          tags: string[] | null
          list_id: string | null
          project_id: string | null
          parent_id: string | null
          time_frame: string | null
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
          due_date?: string | null
          priority?: string | null
          tags?: string[] | null
          list_id?: string | null
          project_id?: string | null
          parent_id?: string | null
          time_frame?: string | null
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          completed?: boolean
          created_at?: string
          updated_at?: string
          due_date?: string | null
          priority?: string | null
          tags?: string[] | null
          list_id?: string | null
          project_id?: string | null
          parent_id?: string | null
          time_frame?: string | null
          user_id?: string
        }
      }
      task_lists: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
          user_id?: string
        }
      }
    }
  }
}