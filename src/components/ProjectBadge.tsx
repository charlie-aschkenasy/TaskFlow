import React from 'react';
import { Project } from '../types';

interface ProjectBadgeProps {
  project?: Project;
  size?: 'sm' | 'md' | 'lg';
}

export function ProjectBadge({ project, size = 'sm' }: ProjectBadgeProps) {
  if (!project) return null;

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium text-white ${sizeClasses[size]}`}
      style={{ backgroundColor: project.color }}
    >
      <span
        className="w-2 h-2 rounded-full mr-1.5 bg-white opacity-70"
      />
      {project.name}
    </span>
  );
}