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
  X,
  AlertCircle,
  Clock,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import Link from 'next/link';

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

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Fetch employees list for Manager & Team dropdowns (Admin only or all for select options)
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
          <h2 className="text-2xl font-bold tracking-tight text-white">Project Spaces</h2>
          <p className="text-sm text-slate-400">View and track agile projects, timelines, and team assignments.</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-900 bg-slate-900/10 p-4 backdrop-blur-xl md:flex-row">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects by name..."
            className="w-full rounded-lg border border-slate-900 bg-slate-950 px-10 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-900 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500"
        >
          <option value="">All Project States</option>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="flex flex-col items-center space-y-4">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
            <p className="text-sm text-slate-400">Loading project data...</p>
          </div>
        </div>
      ) : projectsData && projectsData.projects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {projectsData.projects.map((project: any) => (
            <div
              key={project.id}
              className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-slate-900 bg-slate-900/20 p-6 backdrop-blur-xl transition hover:border-slate-800"
            >
              <div>
                {/* Project Status & Options */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    project.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    project.status === 'Active' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                    project.status === 'On Hold' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {project.status}
                  </span>
                  
                  {isAdmin && (
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleEditClick(project)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition"
                        title="Edit Project"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete project: ${project.name}?`)) {
                            deleteMutation.mutate(project.id);
                          }
                        }}
                        className="rounded p-1 text-slate-500 hover:bg-red-950/20 hover:text-red-400 transition"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Name & Desc */}
                <h3 className="text-lg font-bold text-white mb-2 truncate">{project.name}</h3>
                <p className="text-sm text-slate-400 mb-6 line-clamp-2 h-10">{project.description || 'No description provided.'}</p>

                {/* Details list */}
                <div className="space-y-3 border-t border-slate-900 pt-4 text-xs">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <User className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>Manager: <strong className="text-slate-200">{project.manager?.name || 'Unassigned'}</strong></span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Users className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>Team: <strong className="text-slate-200">{project.team?.length || 0} members</strong></span>
                  </div>
                  {(project.startDate || project.endDate) && (
                    <div className="flex items-center space-x-2 text-slate-400">
                      <Calendar className="h-4 w-4 text-slate-500 shrink-0" />
                      <span>
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : 'N/A'} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* View tasks button */}
              <div className="mt-6 pt-4 border-t border-slate-900 text-center">
                <Link
                  href={`/dashboard/tasks?projectId=${project.id}`}
                  className="inline-flex w-full items-center justify-center space-x-2 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-700 transition"
                >
                  <FolderKanban className="h-4 w-4" />
                  <span>Open Task Board</span>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex h-64 items-center justify-center text-slate-500 text-sm">
          No projects found.
        </div>
      )}

      {/* Creation/Editing Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingProject ? 'Edit Project space' : 'Create Project'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

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
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
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
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Start Date</label>
                  <input
                    {...register('startDate')}
                    type="date"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">End Date</label>
                  <input
                    {...register('endDate')}
                    type="date"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Status</label>
                  <select
                    {...register('status')}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
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
                    className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
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
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">Project Team members</label>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3 space-y-2">
                  {usersData && usersData.length > 0 ? (
                    usersData.map((user: any) => (
                      <label key={user.id} className="flex items-center space-x-3 text-sm text-slate-300 cursor-pointer">
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

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={projectMutation.isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  {projectMutation.isPending ? 'Saving...' : editingProject ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
