import React from 'react';
import Link from 'next/link';
import { FolderKanban, Edit2, Trash2, Calendar, User, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import Badge from '@/components/ui/badge';

interface ProjectCardProps {
  project: any;
  isAdmin: boolean;
  onEdit: (project: any) => void;
  onDelete: (project: any) => void;
}

export function ProjectCard({ project, isAdmin, onEdit, onDelete }: ProjectCardProps) {
  return (
    <Card hoverable className="flex flex-col justify-between">
      <div>
        {/* Project Status & Options */}
        <div className="flex items-center justify-between mb-4">
          <Badge
            variant={
              project.status === 'Completed' ? 'emerald' :
              project.status === 'Active' ? 'indigo' :
              project.status === 'On Hold' ? 'amber' :
              'slate'
            }
            glow={project.status === 'Active' || project.status === 'Completed'}
          >
            {project.status}
          </Badge>
          
          {isAdmin && (
            <div className="flex items-center space-x-1">
              <button
                onClick={() => onEdit(project)}
                className="rounded p-1 text-slate-400 hover:bg-slate-850 hover:text-white transition cursor-pointer"
                title="Edit Project"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onDelete(project)}
                className="rounded p-1 text-slate-500 hover:bg-red-955/20 hover:text-red-400 transition cursor-pointer"
                title="Delete Project"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Name & Desc */}
        <h3 className="text-lg font-bold text-white mb-2 truncate tracking-tight">{project.name}</h3>
        <p className="text-xs text-slate-400 mb-6 line-clamp-2 h-10 leading-relaxed">
          {project.description || 'No description provided.'}
        </p>

        {/* Details list */}
        <div className="space-y-3 border-t border-slate-900/60 pt-4 text-xs">
          <div className="flex items-center space-x-2 text-slate-400">
            <User className="h-4 w-4 text-slate-500 shrink-0" />
            <span>
              Manager: <strong className="text-slate-200">{project.manager?.name || 'Unassigned'}</strong>
            </span>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Users className="h-4 w-4 text-slate-500 shrink-0" />
            <span>
              Team Size: <strong className="text-slate-200">{project.team?.length || 0} members</strong>
            </span>
          </div>
          {(project.startDate || project.endDate) && (
            <div className="flex items-center space-x-2 text-slate-400">
              <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
              <span>
                {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} -{' '}
                {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* View tasks button */}
      <div className="mt-6 pt-4 border-t border-slate-900/60 text-center">
        <Link
          href={`/dashboard/tasks?projectId=${project.id}`}
          className="inline-flex w-full items-center justify-center space-x-2 rounded-lg bg-slate-800 px-4 py-2.5 text-xs font-semibold text-white hover:bg-slate-700 transition-colors cursor-pointer"
        >
          <FolderKanban className="h-4 w-4 text-slate-400" />
          <span>Open Task Board</span>
        </Link>
      </div>
    </Card>
  );
}
