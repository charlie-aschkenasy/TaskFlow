/*
  # Add Project Sort Order

  1. Schema Changes
    - Add `sort_order` integer column to `projects` table
    - Set default values based on existing `created_at` order for backward compatibility
    - Add index on `sort_order` for performance

  2. Data Migration
    - Update existing projects to have sort_order based on their creation date
    - Ensures smooth transition for existing users

  3. Notes
    - New projects will get max(sort_order) + 1 automatically via application logic
    - Lower sort_order numbers appear first in lists
*/

-- Add sort_order column to projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'projects' AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE projects ADD COLUMN sort_order integer DEFAULT 0;
  END IF;
END $$;

-- Set sort_order for existing projects based on created_at
-- This ensures existing users see projects in their original order
UPDATE projects
SET sort_order = subquery.row_num
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as row_num
  FROM projects
) AS subquery
WHERE projects.id = subquery.id AND projects.sort_order = 0;

-- Create index on sort_order for better query performance
CREATE INDEX IF NOT EXISTS idx_projects_sort_order ON projects(user_id, sort_order);