/*
  # Notes Management Schema

  1. New Tables
    - `note_sections`
      - `id` (uuid, primary key)
      - `name` (text, section name)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      - `order_index` (integer, for custom ordering)
    
    - `notes`
      - `id` (uuid, primary key)
      - `content` (text, rich text content)
      - `section_id` (uuid, references note_sections)
      - `user_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own note sections and notes
    - Separate policies for SELECT, INSERT, UPDATE, and DELETE operations
    - Cascade delete: when a section is deleted, all its notes are deleted

  3. Indexes
    - Index on user_id for both tables for efficient queries
    - Index on section_id in notes table for fast section lookups
    - Index on order_index for efficient ordering

  4. Important Notes
    - Each section can contain one note (the content field stores all the text)
    - Auto-update updated_at timestamp on modifications
    - Default order_index based on creation order
*/

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create note_sections table
CREATE TABLE IF NOT EXISTS note_sections (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  order_index integer DEFAULT 0
);

-- Create notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  content text DEFAULT '',
  section_id uuid REFERENCES note_sections(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE note_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for note_sections
CREATE POLICY "Users can view own note sections"
  ON note_sections
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own note sections"
  ON note_sections
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own note sections"
  ON note_sections
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own note sections"
  ON note_sections
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for notes
CREATE POLICY "Users can view own notes"
  ON notes
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notes"
  ON notes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notes"
  ON notes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notes"
  ON notes
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_note_sections_user_id ON note_sections(user_id);
CREATE INDEX IF NOT EXISTS idx_note_sections_order_index ON note_sections(order_index);
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_section_id ON notes(section_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
DROP TRIGGER IF EXISTS update_note_sections_updated_at ON note_sections;
CREATE TRIGGER update_note_sections_updated_at
  BEFORE UPDATE ON note_sections
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON notes;
CREATE TRIGGER update_notes_updated_at
  BEFORE UPDATE ON notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
