import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { AlertCircle } from 'lucide-react';
import Modal from '@/components/shared/modal';

export const projectSchema = zod.object({
  name: zod.string().min(2, 'Project name must be at least 2 characters'),
  description: zod.string().optional(),
  status: zod.enum(['Planning', 'Active', 'Completed', 'On Hold']),
  manager: zod.string().min(1, 'Please select a project manager'),
  team: zod.array(zod.string()),
  startDate: zod.string().optional().or(zod.literal('')),
  endDate: zod.string().optional().or(zod.literal('')),
});

export type ProjectFormValues = zod.infer<typeof projectSchema>;

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProject: any | null;
  usersData: any[] | undefined;
  onSubmit: (data: ProjectFormValues) => void;
  isPending: boolean;
  errorMsg: string | null;
}

export function ProjectModal({
  isOpen,
  onClose,
  editingProject,
  usersData,
  onSubmit,
  isPending,
  errorMsg,
}: ProjectModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: 'Planning',
      team: [],
    },
  });

  const selectedTeam = watch('team') || [];

  // Reset form when project changes or modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (editingProject) {
        reset({
          name: editingProject.name,
          description: editingProject.description || '',
          status: editingProject.status,
          manager: editingProject.manager?.id || editingProject.manager?._id || editingProject.manager || '',
          team: editingProject.team?.map((member: any) => member.id || member._id || member) || [],
          startDate: editingProject.startDate ? new Date(editingProject.startDate).toISOString().split('T')[0] : '',
          endDate: editingProject.endDate ? new Date(editingProject.endDate).toISOString().split('T')[0] : '',
        });
      } else {
        reset({
          name: '',
          description: '',
          status: 'Planning',
          manager: '',
          team: [],
          startDate: '',
          endDate: '',
        });
      }
    }
  }, [editingProject, isOpen, reset]);

  const handleTeamMemberToggle = (userId: string) => {
    const current = [...selectedTeam];
    const index = current.indexOf(userId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(userId);
    }
    setValue('team', current, { shouldValidate: true });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingProject ? 'Edit Project Space' : 'Create Project Space'}
    >
      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-950/50 border border-red-500/50 p-3 text-xs text-red-400 mb-4">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Name</label>
          <input
            {...register('name')}
            type="text"
            placeholder="Phoenix Launch Platform"
            className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Description</label>
          <textarea
            {...register('description')}
            rows={3}
            placeholder="Agile product space to organize features and tasks for the launch..."
            className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</label>
            <input
              {...register('startDate')}
              type="date"
              className="w-full rounded-lg border border-slate-850 bg-slate-955 px-4 py-2.5 text-sm text-slate-350 outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">End Date</label>
            <input
              {...register('endDate')}
              type="date"
              className="w-full rounded-lg border border-slate-850 bg-slate-955 px-4 py-2.5 text-sm text-slate-350 outline-none focus:border-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Status</label>
            <select
              {...register('status')}
              className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Manager</label>
            <select
              {...register('manager')}
              className="w-full rounded-lg border border-slate-855 bg-slate-955 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
            >
              <option value="">Select Manager</option>
              {usersData?.map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
            {errors.manager && (
              <p className="text-xs text-red-400">{errors.manager.message}</p>
            )}
          </div>
        </div>

        {/* Team Selector Checkboxes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Project Team Members</label>
          <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-850 bg-slate-950 p-3 space-y-2">
            {usersData && usersData.length > 0 ? (
              usersData.map((user: any) => (
                <label key={user.id} className="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer hover:text-white transition">
                  <input
                    type="checkbox"
                    checked={selectedTeam.includes(user.id)}
                    onChange={() => handleTeamMemberToggle(user.id)}
                    className="rounded border-slate-800 text-indigo-600 bg-slate-950 focus:ring-indigo-500 h-4 w-4"
                  />
                  <span>{user.name} ({user.department || 'General'})</span>
                </label>
              ))
            ) : (
              <span className="text-xs text-slate-500">No employees available.</span>
            )}
          </div>
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
            {isPending ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
