/*
  # Add Missing Columns to Notes Tables

  1. Changes
    - Add `color` column to `note_sections` table with default blue color
    - Add `order_index` column to `notes` table with default 0
    - Add index on notes.order_index for efficient ordering

  2. Notes
    - These columns were missing from the initial migration
    - Safe to add with IF NOT EXISTS pattern
*/

-- Add color column to note_sections if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'note_sections' AND column_name = 'color'
  ) THEN
    ALTER TABLE note_sections ADD COLUMN color text DEFAULT '#3b82f6';
  END IF;
END $$;

-- Add order_index column to notes if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notes' AND column_name = 'order_index'
  ) THEN
    ALTER TABLE notes ADD COLUMN order_index integer DEFAULT 0;
  END IF;
END $$;

-- Create index on notes.order_index if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_notes_order_index ON notes(order_index);
