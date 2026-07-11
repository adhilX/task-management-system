import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/project.service';
import { employeeService } from '@/services/employee.service';
import { Plus, Search, FolderOpen } from 'lucide-react';

import { Card } from '@/components/ui/card';
import ConfirmationDialog from '@/components/shared/confirmation-dialog';
import EmptyState from '@/components/shared/empty-state';
import { CardSkeleton } from '@/components/common/loading-skeleton';

import { ProjectCard } from './project-card';
import { ProjectModal, ProjectFormValues } from './project-modal';

export function ProjectList() {
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

  // Fetch projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ['projects', page, search, statusFilter],
    queryFn: async () => {
      return projectService.getProjects({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
      });
    },
  });

  // Fetch employees list for Manager & Team dropdowns
  const { data: usersData } = useQuery({
    queryKey: ['usersListSelect'],
    queryFn: async () => {
      const res = await employeeService.getEmployees({ page: 1, limit: 200 });
      return res.users;
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
        return projectService.updateProject(editingProject.id, payload);
      } else {
        return projectService.createProject(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setIsModalOpen(false);
      setEditingProject(null);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to save project');
    },
  });

  // Delete Project Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return projectService.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setDeleteTarget(null);
    },
  });

  const handleEditClick = (project: any) => {
    setEditingProject(project);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingProject(null);
    setErrorMsg(null);
    setIsModalOpen(true);
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
          className="rounded-lg border border-slate-900 bg-slate-955 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500 cursor-pointer"
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
            <ProjectCard
              key={project.id}
              project={project}
              isAdmin={isAdmin}
              onEdit={handleEditClick}
              onDelete={setDeleteTarget}
            />
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
      <ProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingProject={editingProject}
        usersData={usersData}
        onSubmit={handleFormSubmit}
        isPending={projectMutation.isPending}
        errorMsg={errorMsg}
      />

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
