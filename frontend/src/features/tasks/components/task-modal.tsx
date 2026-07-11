import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { AlertCircle } from 'lucide-react';
import Modal from '@/components/shared/modal';

export const taskSchema = zod.object({
  title: zod.string().min(2, 'Task title must be at least 2 characters'),
  description: zod.string().optional(),
  status: zod.enum(['To Do', 'In Progress', 'Review', 'Completed']),
  priority: zod.enum(['Low', 'Medium', 'High']),
  project: zod.string().min(1, 'Please select a project'),
  assignee: zod.string().min(1, 'Please select an assignee'),
  dueDate: zod.string().optional().or(zod.literal('')),
});

export type TaskFormValues = zod.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: any | null;
  isAdmin: boolean;
  projectIdFilter: string;
  projectsData: any[] | undefined;
  onSubmit: (data: TaskFormValues) => void;
  isPending: boolean;
  errorMsg: string | null;
}

export function TaskModal({
  isOpen,
  onClose,
  editingTask,
  isAdmin,
  projectIdFilter,
  projectsData,
  onSubmit,
  isPending,
  errorMsg,
}: TaskModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'To Do',
      priority: 'Medium',
    },
  });

  const selectedProjectId = watch('project');
  const [availableAssignees, setAvailableAssignees] = useState<any[]>([]);

  // Reset form values when modal opens/closes or edit target changes
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        reset({
          title: editingTask.title,
          description: editingTask.description || '',
          status: editingTask.status,
          priority: editingTask.priority,
          project: editingTask.project?.id || editingTask.project?._id || editingTask.project || '',
          assignee: editingTask.assignee?.id || editingTask.assignee?._id || editingTask.assignee || '',
          dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split('T')[0] : '',
        });
      } else {
        reset({
          title: '',
          description: '',
          status: 'To Do',
          priority: 'Medium',
          project: projectIdFilter || '',
          assignee: '',
          dueDate: '',
        });
      }
    }
  }, [editingTask, isOpen, projectIdFilter, reset]);

  // Populate assignees list based on selected project's team & manager
  useEffect(() => {
    if (selectedProjectId && projectsData) {
      const proj = projectsData.find((p: any) => p.id === selectedProjectId);
      if (proj) {
        const teamMembers = proj.team || [];
        const manager = proj.manager ? [proj.manager] : [];
        const combined = [...manager, ...teamMembers];
        const getId = (member: any): string => {
          if (typeof member === 'string') return member;
          return member?.id || member?._id || '';
        };
        const unique = combined.filter((v, i, a) => a.findIndex(t => getId(t) === getId(v)) === i);
        setAvailableAssignees(unique);
      } else {
        setAvailableAssignees([]);
      }
    } else {
      setAvailableAssignees([]);
    }
  }, [selectedProjectId, projectsData]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingTask ? (isAdmin ? 'Edit Task Details' : 'Task Status Update') : 'Create Task'}
    >
      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-950/50 border border-red-500/50 p-3 text-xs text-red-400 mb-4">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {(!editingTask || isAdmin) ? (
          <>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Task Title</label>
              <input
                {...register('title')}
                type="text"
                placeholder="Implement authentication gateway"
                className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
              />
              {errors.title && (
                <p className="text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
              <textarea
                {...register('description')}
                rows={3}
                placeholder="Draft gateway schema, hash headers, configure passport..."
                className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Workspace</label>
                <select
                  {...register('project')}
                  disabled={!!editingTask}
                  className="w-full rounded-lg border border-slate-850 bg-slate-955 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 disabled:opacity-50 cursor-pointer"
                >
                  <option value="">Select Project</option>
                  {projectsData?.map((p: any) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                {errors.project && (
                  <p className="text-xs text-red-400">{errors.project.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Assignee</label>
                <select
                  {...register('assignee')}
                  className="w-full rounded-lg border border-slate-850 bg-slate-955 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">Select Assignee</option>
                  {availableAssignees.map((user: any) => {
                    const uid = user.id || user._id;
                    return (
                      <option key={uid} value={uid}>
                        {user.name} ({user.role})
                      </option>
                    );
                  })}
                </select>
                {errors.assignee && (
                  <p className="text-xs text-red-400">{errors.assignee.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Priority</label>
                <select
                  {...register('priority')}
                  className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Due Date</label>
                <input
                  {...register('dueDate')}
                  type="date"
                  className="w-full rounded-lg border border-slate-850 bg-slate-955 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 rounded-xl bg-slate-955/50 p-4 border border-slate-900">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 block mb-0.5">Task Title</span>
              <span className="text-sm font-bold text-white">{editingTask.title}</span>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 block mb-0.5">Description</span>
              <span className="text-xs text-slate-400 block leading-relaxed">{editingTask.description || 'No description.'}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 pt-2 border-t border-slate-900/60">
              <div>
                <span>Priority: </span>
                <strong className="text-slate-300">{editingTask.priority}</strong>
              </div>
              <div>
                <span>Assignee: </span>
                <strong className="text-slate-300">{editingTask.assignee?.name}</strong>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Task Lane Status</label>
          <select
            {...register('status')}
            className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Review">Review</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/60">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
