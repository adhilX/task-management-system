import React from 'react';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface TaskFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  projectIdFilter: string;
  onProjectIdFilterChange: (value: string) => void;
  priorityFilter: string;
  onPriorityFilterChange: (value: string) => void;
  projectsData: any[] | undefined;
}

export function TaskFilters({
  search,
  onSearchChange,
  projectIdFilter,
  onProjectIdFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  projectsData,
}: TaskFiltersProps) {
  return (
    <Card className="flex flex-col gap-4 p-4 sm:flex-row shrink-0">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tasks..."
          className="w-full rounded-lg border border-slate-900 bg-slate-955 px-10 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
        />
      </div>

      {/* Project Filter */}
      <select
        value={projectIdFilter}
        onChange={(e) => onProjectIdFilterChange(e.target.value)}
        className="rounded-lg border border-slate-900 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500 cursor-pointer"
      >
        <option value="">All Projects</option>
        {projectsData?.map((p: any) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>

      {/* Priority Filter */}
      <select
        value={priorityFilter}
        onChange={(e) => onPriorityFilterChange(e.target.value)}
        className="rounded-lg border border-slate-900 bg-slate-955 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500 cursor-pointer"
      >
        <option value="">All Priorities</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
    </Card>
  );
}
