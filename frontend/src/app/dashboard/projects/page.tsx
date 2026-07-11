'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  FolderKanban,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  User,
  Users,
  Search,
  AlertCircle,
  FolderOpen,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import Link from 'next/link';

import { Card } from '@/components/shared/card';
import Badge from '@/components/shared/badge';
import Modal from '@/components/shared/modal';
import ConfirmationDialog from '@/components/shared/confirmation-dialog';
import EmptyState from '@/components/shared/empty-state';
import { CardSkeleton } from '@/components/shared/loading-skeleton';

const projectSchema = zod.object({
  name: zod.string().min(2, 'Project name must be at least 2 characters'),
  description: zod.string().optional(),
  status: zod.enum(['Planning', 'Active', 'Completed', 'On Hold']),
  manager: zod.string().min(1, 'Please select a project manager'),
  team: zod.array(zod.string()),
  startDate: zod.string().optional().or(zod.literal('')),
  endDate: zod.string().optional().or(zod.literal('')),
});

type ProjectFormValues = zod.infer<typeof projectSchema>;

export default function ProjectsPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal & Confirmation States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const isAdmin = currentUser?.role === 'Admin';

  // Form setup
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

  // Fetch projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', page, search, statusFilter],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/projects', { params });
      return response.data;
    },
  });

  // Fetch employees list for Manager & Team dropdowns
  const { data: usersData } = useQuery({
    queryKey: ['usersListSelect'],
    queryFn: async () => {
      const response = await api.get('/users', { params: { page: 1, limit: 200 } });
      return response.data.users;
    },
  });

  // Create/Update Project Mutation
  const projectMutation = useMutation({
    mutationFn: async (data: ProjectFormValues) => {
      const payload = {
        ...data,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      };

      if (editingProject) {
        const response = await api.put(`/projects/${editingProject.id}`, payload);
        return response.data;
      } else {
        const response = await api.post('/projects', payload);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setEditingProject(null);
      reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to save project');
    },
  });

  // Delete Project Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/projects/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteTarget(null);
    },
  });

  const handleEditClick = (project: any) => {
    setEditingProject(project);
    reset({
      name: project.name,
      description: project.description || '',
      status: project.status,
      manager: project.manager?.id || project.manager?._id || project.manager || '',
      team: project.team?.map((member: any) => member.id || member._id || member) || [],
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      endDate: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingProject(null);
    reset({
      name: '',
      description: '',
      status: 'Planning',
      manager: '',
      team: [],
      startDate: '',
      endDate: '',
    });
    setIsModalOpen(true);
  };

  const handleTeamMemberToggle = (userId: string) => {
    const current = [...selectedTeam];
    const index = current.indexOf(userId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(userId);
    }
    setValue('team', current);
  };

  const handleFormSubmit = (data: ProjectFormValues) => {
    projectMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">Project Spaces</h2>
          <p className="text-sm text-slate-400 mt-0.5">View and track agile projects, timelines, and team assignments.</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <Card className="flex flex-col gap-4 p-4 md:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name..."
            className="w-full rounded-lg border border-slate-900 bg-slate-955 px-10 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-900 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Project States</option>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </Card>

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : projectsData && projectsData.projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projectsData.projects.map((project: any) => (
            <Card
              key={project.id}
              hoverable
              className="flex flex-col justify-between"
            >
              <div>
                {/* Project Status & Options */}
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={
                    project.status === 'Completed' ? 'emerald' :
                    project.status === 'Active' ? 'indigo' :
                    project.status === 'On Hold' ? 'amber' :
                    'slate'
                  } glow={project.status === 'Active' || project.status === 'Completed'}>
                    {project.status}
                  </Badge>
                  
                  {isAdmin && (
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEditClick(project)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                        title="Edit Project"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(project)}
                        className="rounded p-1 text-slate-500 hover:bg-red-950/20 hover:text-red-400 transition cursor-pointer"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Name & Desc */}
                <h3 className="text-lg font-bold text-white mb-2 truncate tracking-tight">{project.name}</h3>
                <p className="text-xs text-slate-400 mb-6 line-clamp-2 h-10 leading-relaxed">{project.description || 'No description provided.'}</p>

                {/* Details list */}
                <div className="space-y-3 border-t border-slate-900/60 pt-4 text-xs">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <User className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>Manager: <strong className="text-slate-200">{project.manager?.name || 'Unassigned'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Users className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>Team Size: <strong className="text-slate-200">{project.team?.length || 0} members</strong></span>
                  </div>
                  {(project.startDate || project.endDate) && (
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                      <span>
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'TBD'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'TBD'}
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
          ))}
        </div>
      ) : (
        <EmptyState
          icon={FolderOpen}
          title="No Project Spaces"
          description="Create your first workspace project to begin organizing task boards, deadlines, and assigning team members."
          actionText={isAdmin ? "Create Project" : undefined}
          onAction={isAdmin ? handleOpenAddModal : undefined}
        />
      )}

      {/* Creation/Editing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project Space' : 'Create Project Space'}
      >
        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-950/50 border border-red-500/50 p-3 text-xs text-red-400 mb-4">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
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
                className="w-full rounded-lg border border-slate-850 bg-slate-955 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 cursor-pointer"
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
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={projectMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
            >
              {projectMutation.isPending ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
        title="Delete Project Space"
        message={`Are you sure you want to delete the project "${deleteTarget?.name}"? This action is permanent and will cascade delete all associated dashboard tasks.`}
        confirmText="Delete Project"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
