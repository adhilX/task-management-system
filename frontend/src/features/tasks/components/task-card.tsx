import React from 'react';
import { Edit2, Trash2, Calendar, ArrowRight } from 'lucide-react';
import Badge from '@/components/ui/badge';

interface TaskCardProps {
  task: any;
  currentUser: any;
  isAdmin: boolean;
  colName: 'To Do' | 'In Progress' | 'Review' | 'Completed';
  onEdit: (task: any) => void;
  onDelete: (task: any) => void;
  onDragStart: (e: React.DragEvent, taskId: string, assigneeId: string) => void;
  onAdvanceStatus: (id: string, nextStatus: 'To Do' | 'In Progress' | 'Review' | 'Completed') => void;
}

export function TaskCard({
  task,
  currentUser,
  isAdmin,
  colName,
  onEdit,
  onDelete,
  onDragStart,
  onAdvanceStatus,
}: TaskCardProps) {
  const assigneeId = task.assignee?.id || task.assignee?._id || task.assignee;
  const isTaskAssignedToMe = assigneeId === currentUser?.id;
  const canModify = isAdmin || isTaskAssignedToMe;

  const handleDragStartInternal = (e: React.DragEvent) => {
    if (!canModify) {
      e.preventDefault();
      alert('You can only modify tasks assigned to you.');
      return;
    }
    onDragStart(e, task.id, assigneeId);
  };

  return (
    <div
      draggable={canModify}
      onDragStart={handleDragStartInternal}
      className={`group relative rounded-xl border border-slate-900 bg-slate-950 p-4 shadow-lg transition-all duration-200 hover:border-slate-800 cursor-grab active:cursor-grabbing ${
        canModify ? '' : 'opacity-75'
      }`}
    >
      {/* Card Top */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <Badge
          variant={
            task.priority === 'High' ? 'red' :
            task.priority === 'Medium' ? 'amber' :
            'indigo'
          }
          className="text-[10px] px-2 py-0"
        >
          {task.priority.toUpperCase()}
        </Badge>
        
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition duration-150">
          <button
            onClick={() => onEdit(task)}
            className="rounded p-1 text-slate-400 hover:bg-slate-850 hover:text-white transition cursor-pointer"
            title="Edit Task Details"
          >
            <Edit2 className="h-3.5 w-3.5" />
          </button>
          {isAdmin && (
            <button
              onClick={() => onDelete(task)}
              className="rounded p-1 text-slate-500 hover:bg-red-955/20 hover:text-red-400 transition cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Title & Desc */}
      <h4 className="text-sm font-semibold text-white mb-1.5 group-hover:text-indigo-400 transition-colors line-clamp-1 leading-snug">
        {task.title}
      </h4>
      <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8 leading-relaxed">
        {task.description || 'No description.'}
      </p>

      {/* Assignee & Due Date */}
      <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 text-[11px] text-slate-400">
        <div className="flex items-center space-x-1.5 min-w-0">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-850 text-slate-350 shrink-0 font-bold text-[9px] uppercase">
            {task.assignee?.name ? task.assignee.name.slice(0, 2) : 'U'}
          </div>
          <span className="truncate text-slate-300 font-medium">
            {task.assignee?.name || 'Unassigned'}
          </span>
        </div>
        {task.dueDate && (
          <div className="flex items-center space-x-1 shrink-0 text-slate-400">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <span>{new Date(task.dueDate).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Project reference */}
      <div className="mt-2.5 text-[10px] text-slate-500 truncate border-t border-slate-900/40 pt-1.5">
        Workspace: <strong className="text-slate-400">{task.project?.name || 'N/A'}</strong>
      </div>

      {/* Quick status progress buttons (Mobile/Accessibility friendly) */}
      {canModify && colName !== 'Completed' && (
        <button
          onClick={() => {
            const nextStatus =
              colName === 'To Do' ? 'In Progress' :
              colName === 'In Progress' ? 'Review' : 'Completed';
            onAdvanceStatus(task.id, nextStatus);
          }}
          className="mt-3.5 flex w-full items-center justify-center space-x-1 rounded bg-slate-900 border border-slate-850 px-2 py-1.5 text-[10px] font-bold text-slate-400 hover:text-white hover:border-slate-700 transition cursor-pointer"
        >
          <span>Advance Status</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      )}
    </div>
  );
}
