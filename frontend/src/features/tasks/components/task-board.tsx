import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/task.service';
import { projectService } from '@/services/project.service';
import { Plus } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import ConfirmationDialog from '@/components/shared/confirmation-dialog';
import { CardSkeleton } from '@/components/common/loading-skeleton';

import { TaskCard } from './task-card';
import { TaskModal, TaskFormValues } from './task-modal';
import { TaskFilters } from './task-filters';

export function TaskBoard() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Filter States
  const [projectIdFilter, setProjectIdFilter] = useState(searchParams.get('projectId') || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal & Confirmation States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);

  const isAdmin = currentUser?.role === 'Admin';

  // Fetch projects list for filters and creation dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projectsSelect'],
    queryFn: async () => {
      const res = await projectService.getProjects({ page: 1, limit: 100 });
      return res.projects;
    },
  });

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectIdFilter, priorityFilter, search],
    queryFn: async () => {
      return taskService.getTasks({
        page: 1,
        limit: 100,
        projectId: projectIdFilter || undefined,
        priority: priorityFilter || undefined,
        search: search || undefined,
      });
    },
  });

  // Create/Update Task Mutation
  const taskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const payload = {
        ...data,
        dueDate: data.dueDate || undefined,
      };

      if (editingTask) {
        return taskService.updateTask(editingTask.id, payload);
      } else {
        return taskService.createTask(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      setEditingTask(null);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to save task');
    },
  });

  // Update Status Only Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'To Do' | 'In Progress' | 'Review' | 'Completed' }) => {
      return taskService.updateTask(id, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || 'Failed to update task status. Ensure you are assigned to this task.');
    },
  });

  // Delete Task Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return taskService.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setDeleteTarget(null);
    },
  });

  const handleEditClick = (task: any) => {
    setEditingTask(task);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string, assigneeId: string) => {
    e.dataTransfer.setData('text/plain', taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: 'To Do' | 'In Progress' | 'Review' | 'Completed') => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('text/plain');
    if (taskId) {
      updateStatusMutation.mutate({ id: taskId, status: targetStatus });
    }
  };

  const handleFormSubmit = (data: TaskFormValues) => {
    taskMutation.mutate(data);
  };

  const columns: { name: 'To Do' | 'In Progress' | 'Review' | 'Completed'; borderClass: string; textClass: string; bgClass: string }[] = [
    { name: 'To Do', borderClass: 'border-slate-800', textClass: 'text-slate-400', bgClass: 'bg-slate-900/10' },
    { name: 'In Progress', borderClass: 'border-indigo-900/40', textClass: 'text-indigo-400', bgClass: 'bg-indigo-955/5' },
    { name: 'Review', borderClass: 'border-violet-900/40', textClass: 'text-violet-400', bgClass: 'bg-violet-955/5' },
    { name: 'Completed', borderClass: 'border-emerald-900/40', textClass: 'text-emerald-400', bgClass: 'bg-emerald-950/5' },
  ];

  const getTasksForStatus = (status: string) => {
    if (!tasksData?.tasks) return [];
    return tasksData.tasks.filter((task: any) => task.status === status);
  };

  const handleAdvanceStatus = (id: string, nextStatus: 'To Do' | 'In Progress' | 'Review' | 'Completed') => {
    updateStatusMutation.mutate({ id, status: nextStatus });
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">Task Board</h2>
          <p className="text-sm text-slate-400 mt-0.5">Drag & drop cards or use actions to update status lanes.</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <TaskFilters
        search={search}
        onSearchChange={setSearch}
        projectIdFilter={projectIdFilter}
        onProjectIdFilterChange={setProjectIdFilter}
        priorityFilter={priorityFilter}
        onPriorityFilterChange={setPriorityFilter}
        projectsData={projectsData}
      />

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto min-h-0">
        {tasksLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 h-full">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="flex gap-6 h-full min-w-[900px] select-none pb-2">
            {columns.map((col) => {
              const laneTasks = getTasksForStatus(col.name);
              return (
                <div
                  key={col.name}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.name)}
                  className={`flex flex-col w-1/4 rounded-xl border ${col.borderClass} ${col.bgClass} p-4 h-full`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-900/60 shrink-0">
                    <span className={`text-sm font-bold uppercase tracking-wider ${col.textClass}`}>
                      {col.name}
                    </span>
                    <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-slate-400 border border-slate-800">
                      {laneTasks.length}
                    </span>
                  </div>

                  {/* Cards Area */}
                  <div className="flex-1 space-y-4 overflow-y-auto min-h-0 pr-1">
                    {laneTasks.length > 0 ? (
                      laneTasks.map((task: any) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          currentUser={currentUser}
                          isAdmin={isAdmin}
                          colName={col.name}
                          onEdit={handleEditClick}
                          onDelete={setDeleteTarget}
                          onDragStart={handleDragStart}
                          onAdvanceStatus={handleAdvanceStatus}
                        />
                      ))
                    ) : (
                      <div className="flex h-28 items-center justify-center text-slate-500 text-xs border border-dashed border-slate-900/60 rounded-xl bg-slate-950/10">
                        Lane empty
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Creation / Details Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingTask={editingTask}
        isAdmin={isAdmin}
        projectIdFilter={projectIdFilter}
        projectsData={projectsData}
        onSubmit={handleFormSubmit}
        isPending={taskMutation.isPending}
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
        title="Delete Task Item"
        message={`Are you sure you want to permanently delete the task "${deleteTarget?.title}"?`}
        confirmText="Delete Task"
        isDangerous
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
