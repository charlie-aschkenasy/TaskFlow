import React from 'react';
import { Search, Filter, ArrowUpDown, ChevronDown, ChevronUp } from 'lucide-react';
import { FilterState, SortOption, SortConfig, Task } from '../types';
import { useProjects } from '../hooks/useProjects';
import { MultiSelectTags } from './MultiSelectTags';
import { getAllUsedTags } from '../utils/taskUtils';

interface FilterSortProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  sortConfig: SortConfig;
  onSortChange: (sortConfig: SortConfig) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  allTasks?: Task[];
}

export function FilterSort({ 
  filters, 
  onFiltersChange, 
  sortConfig,
  onSortChange,
  isCollapsed = false,
  onToggleCollapse,
  allTasks = [],
}: FilterSortProps) {
  const { projects } = useProjects();
  
  // Get all tags that have been used in tasks
  const usedTags = getAllUsedTags(allTasks);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const handlePrimarySortChange = (newSortBy: SortOption) => {
    if (newSortBy === sortConfig.primary) {
      onSortChange({
        ...sortConfig,
        primaryAscending: !sortConfig.primaryAscending
      });
    } else {
      onSortChange({
        ...sortConfig,
        primary: newSortBy,
        primaryAscending: true
      });
    }
  };

  const handleSecondarySortChange = (newSortBy: SortOption | 'none') => {
    if (newSortBy === 'none') {
      onSortChange({
        ...sortConfig,
        secondary: undefined,
        secondaryAscending: true
      });
    } else if (newSortBy === sortConfig.secondary) {
      onSortChange({
        ...sortConfig,
        secondaryAscending: !sortConfig.secondaryAscending
      });
    } else {
      onSortChange({
        ...sortConfig,
        secondary: newSortBy as SortOption,
        secondaryAscending: true
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Collapsed Header Bar */}
      <div 
        className={`flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
          isCollapsed ? 'border-b-0' : 'border-b border-gray-200'
        }`}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter size={16} />
          Filter & Sort
          {isCollapsed && (
            <span className="text-xs text-gray-500 ml-2">
              ({Object.values(filters).filter(v => v !== 'all' && v !== '' && (!Array.isArray(v) || v.length > 0)).length} active)
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          {/* Condensed view when collapsed */}
          {isCollapsed && (
            <>
              {filters.searchQuery && (
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  <Search size={12} />
                  <span className="max-w-20 truncate">{filters.searchQuery}</span>
                </div>
              )}
              
              {filters.timeFrame !== 'all' && (
                <div className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs capitalize">
                  {filters.timeFrame}
                </div>
              )}
              
              {filters.priority !== 'all' && (
                <div className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs capitalize">
                  {filters.priority}
                </div>
              )}
              
              {filters.type && filters.type.length > 0 && filters.type.length < 3 && (
                <div className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                  {filters.type.join(', ')}
                </div>
              )}
              
              {filters.tags && filters.tags.length > 0 && (
                <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                  {filters.tags.length} tag{filters.tags.length !== 1 ? 's' : ''}
                </div>
              )}
              
              <div className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs flex items-center gap-1">
                <ArrowUpDown size={10} />
                {sortConfig.primary === 'createdAt' ? 'Created' : 
                 sortConfig.primary === 'dueDate' ? 'Due Date' : 
                 sortConfig.primary === 'tags' ? 'Tags' :
                 sortConfig.primary.charAt(0).toUpperCase() + sortConfig.primary.slice(1)}
                {sortConfig.primaryAscending ? '↑' : '↓'}
                {sortConfig.secondary && (
                  <span className="ml-1">
                    + {sortConfig.secondary === 'createdAt' ? 'Created' : 
                       sortConfig.secondary === 'dueDate' ? 'Due Date' : 
                       sortConfig.secondary === 'tags' ? 'Tags' :
                       sortConfig.secondary.charAt(0).toUpperCase() + sortConfig.secondary.slice(1)}
                    {sortConfig.secondaryAscending ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </>
          )}
          
          {onToggleCollapse && (
            <button className="text-gray-400 hover:text-gray-600 transition-colors">
              {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {!isCollapsed && (
        <div className="p-4 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Time Frame</label>
              <select
                value={filters.timeFrame}
                onChange={(e) => handleFilterChange('timeFrame', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Time Frames</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Type</label>
              <div className="space-y-1">
                {['task', 'event', 'assignment'].map(type => (
                  <label key={type} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.type.includes(type)}
                      onChange={(e) => {
                        const newTypes = e.target.checked
                          ? [...filters.type, type]
                          : filters.type.filter(t => t !== type);
                        onFiltersChange({ ...filters, type: newTypes });
                      }}
                      className="mr-2 rounded"
                    />
                    <span className="capitalize">{type}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Project</label>
              <select
                value={filters.project}
                onChange={(e) => handleFilterChange('project', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Projects</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>


            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Filter by Tags</label>
              <MultiSelectTags
                availableTags={usedTags}
                selectedTags={filters.tags}
                onTagsChange={(tags) => onFiltersChange({ ...filters, tags })}
                placeholder="Filter by tags..."
              />
            </div>
          </div>

          {/* Primary Sort */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-600">Primary sort:</span>
              {(['title', 'createdAt', 'dueDate', 'priority', 'project', 'tags'] as SortOption[]).map(option => (
                <button
                  key={option}
                  onClick={() => handlePrimarySortChange(option)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    sortConfig.primary === option
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option === 'createdAt' ? 'Created' : 
                   option === 'dueDate' ? 'Due Date' : 
                   option === 'tags' ? 'Tags' :
                   option.charAt(0).toUpperCase() + option.slice(1)}
                  {sortConfig.primary === option && (
                    <span className="ml-1">
                      {sortConfig.primaryAscending ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Secondary Sort */}
            <div className="flex items-center gap-2">
              <ArrowUpDown size={14} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-600">Then by:</span>
              <button
                onClick={() => handleSecondarySortChange('none')}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  !sortConfig.secondary
                    ? 'bg-gray-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                None
              </button>
              {(['title', 'createdAt', 'dueDate', 'priority', 'project', 'tags'] as SortOption[])
                .filter(option => option !== sortConfig.primary)
                .map(option => (
                <button
                  key={option}
                  onClick={() => handleSecondarySortChange(option)}
                  className={`px-3 py-1 text-xs rounded transition-colors ${
                    sortConfig.secondary === option
                      ? 'bg-green-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {option === 'createdAt' ? 'Created' : 
                   option === 'dueDate' ? 'Due Date' : 
                   option === 'tags' ? 'Tags' :
                   option.charAt(0).toUpperCase() + option.slice(1)}
                  {sortConfig.secondary === option && (
                    <span className="ml-1">
                      {sortConfig.secondaryAscending ? '↑' : '↓'}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}