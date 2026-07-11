'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  KanbanSquare,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  User,
  Search,
  X,
  AlertCircle,
  Clock,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useSearchParams } from 'next/navigation';

const taskSchema = zod.object({
  title: zod.string().min(2, 'Task title must be at least 2 characters'),
  description: zod.string().optional(),
  status: zod.enum(['To Do', 'In Progress', 'Review', 'Completed']),
  priority: zod.enum(['Low', 'Medium', 'High']),
  project: zod.string().min(1, 'Please select a project'),
  assignee: zod.string().min(1, 'Please select an assignee'),
  dueDate: zod.string().optional().or(zod.literal('')),
});

type TaskFormValues = zod.infer<typeof taskSchema>;

export default function TasksPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();

  // Filter States
  const [projectIdFilter, setProjectIdFilter] = useState(searchParams.get('projectId') || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [search, setSearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any | null>(null);
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
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'To Do',
      priority: 'Medium',
    },
  });

  const selectedProjectId = watch('project');
  const [availableAssignees, setAvailableAssignees] = useState<any[]>([]);

  // Fetch projects list for filters and creation dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projectsSelect'],
    queryFn: async () => {
      const response = await api.get('/projects', { params: { page: 1, limit: 100 } });
      return response.data.projects;
    },
  });

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', projectIdFilter, priorityFilter, search],
    queryFn: async () => {
      const params: any = { page: 1, limit: 200 };
      if (projectIdFilter) params.projectId = projectIdFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (search) params.search = search;

      const response = await api.get('/tasks', { params });
      return response.data;
    },
  });

  // Populate assignees list based on selected project's team & manager
  useEffect(() => {
    if (selectedProjectId && projectsData) {
      const proj = projectsData.find((p: any) => p.id === selectedProjectId);
      if (proj) {
        const teamMembers = proj.team || [];
        const manager = proj.manager ? [proj.manager] : [];
        // Unique list of users on project
        const combined = [...manager, ...teamMembers];
        const unique = combined.filter((v, i, a) => a.findIndex(t => (t.id || t._id) === (v.id || v._id)) === i);
        setAvailableAssignees(unique);
      } else {
        setAvailableAssignees([]);
      }
    } else {
      setAvailableAssignees([]);
    }
  }, [selectedProjectId, projectsData]);

  // Create/Update Task Mutation
  const taskMutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const payload = {
        ...data,
        dueDate: data.dueDate || undefined,
      };

      if (editingTask) {
        const response = await api.put(`/tasks/${editingTask.id}`, payload);
        return response.data;
      } else {
        const response = await api.post('/tasks', payload);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsModalOpen(false);
      setEditingTask(null);
      reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to save task');
    },
  });

  // Update Status Only Mutation (used for Drag & Drop / Mobile Quick moves)
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'To Do' | 'In Progress' | 'Review' | 'Completed' }) => {
      const response = await api.put(`/tasks/${id}`, { status });
      return response.data;
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
      const response = await api.delete(`/tasks/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const handleEditClick = (task: any) => {
    setEditingTask(task);
    reset({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      project: task.project?.id || task.project?._id || task.project || '',
      assignee: task.assignee?.id || task.assignee?._id || task.assignee || '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingTask(null);
    reset({
      title: '',
      description: '',
      status: 'To Do',
      priority: 'Medium',
      project: projectIdFilter || '',
      assignee: '',
      dueDate: '',
    });
    setIsModalOpen(true);
  };

  // Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string, assigneeId: string) => {
    if (!isAdmin && assigneeId !== currentUser?.id) {
      e.preventDefault();
      alert('You can only modify tasks assigned to you.');
      return;
    }
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

  // Separate tasks into columns
  const columns: { name: 'To Do' | 'In Progress' | 'Review' | 'Completed'; borderClass: string; textClass: string; bgClass: string }[] = [
    { name: 'To Do', borderClass: 'border-slate-800', textClass: 'text-slate-400', bgClass: 'bg-slate-900/10' },
    { name: 'In Progress', borderClass: 'border-indigo-900/40', textClass: 'text-indigo-400', bgClass: 'bg-indigo-950/5' },
    { name: 'Review', borderClass: 'border-violet-900/40', textClass: 'text-violet-400', bgClass: 'bg-violet-950/5' },
    { name: 'Completed', borderClass: 'border-emerald-900/40', textClass: 'text-emerald-400', bgClass: 'bg-emerald-950/5' },
  ];

  const getTasksForStatus = (status: string) => {
    if (!tasksData?.tasks) return [];
    return tasksData.tasks.filter((task: any) => task.status === status);
  };

  return (
    <div className="space-y-6 flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">Task Board</h2>
          <p className="text-sm text-slate-400">Drag & drop cards or use actions to update status lanes.</p>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Create Task</span>
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-900 bg-slate-900/10 p-4 backdrop-blur-xl sm:flex-row shrink-0">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="w-full rounded-lg border border-slate-900 bg-slate-950 px-10 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
          />
        </div>

        {/* Project Filter */}
        <select
          value={projectIdFilter}
          onChange={(e) => setProjectIdFilter(e.target.value)}
          className="rounded-lg border border-slate-900 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500"
        >
          <option value="">All Projects</option>
          {projectsData?.map((p: any) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>

        {/* Priority Filter */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="rounded-lg border border-slate-900 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500"
        >
          <option value="">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {/* Kanban Board Container */}
      <div className="flex-1 overflow-x-auto min-h-0">
        {tasksLoading ? (
          <div className="flex h-64 items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
              <p className="text-sm text-slate-400">Loading agile board...</p>
            </div>
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
                    <span className="rounded bg-slate-900 px-2 py-0.5 text-xs font-semibold text-slate-400 border border-slate-900">
                      {laneTasks.length}
                    </span>
                  </div>

                  {/* Cards Area */}
                  <div className="flex-1 space-y-4 overflow-y-auto min-h-0 pr-1">
                    {laneTasks.length > 0 ? (
                      laneTasks.map((task: any) => {
                        const assigneeId = task.assignee?.id || task.assignee?._id || task.assignee;
                        const isTaskAssignedToMe = assigneeId === currentUser?.id;
                        const canModify = isAdmin || isTaskAssignedToMe;

                        return (
                          <div
                            key={task.id}
                            draggable={canModify}
                            onDragStart={(e) => handleDragStart(e, task.id, assigneeId)}
                            className={`group relative rounded-xl border border-slate-900 bg-slate-950 p-4 shadow-lg transition hover:border-slate-800 cursor-grab active:cursor-grabbing ${
                              canModify ? '' : 'opacity-75'
                            }`}
                          >
                            {/* Card Top */}
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                task.priority === 'High' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                              }`}>
                                {task.priority.toUpperCase()}
                              </span>
                              
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition duration-150">
                                <button
                                  onClick={() => handleEditClick(task)}
                                  className="rounded p-1 text-slate-400 hover:bg-slate-850 hover:text-white transition"
                                  title="Edit Task Details"
                                >
                                  <Edit2 className="h-3 w-3" />
                                </button>
                                {isAdmin && (
                                  <button
                                    onClick={() => {
                                      if (confirm(`Delete task: ${task.title}?`)) {
                                        deleteMutation.mutate(task.id);
                                      }
                                    }}
                                    className="rounded p-1 text-slate-500 hover:bg-red-950/20 hover:text-red-400 transition"
                                    title="Delete Task"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Title & Desc */}
                            <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">{task.title}</h4>
                            <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8">{task.description || 'No description.'}</p>

                            {/* Assignee & Due Date */}
                            <div className="flex items-center justify-between border-t border-slate-900/60 pt-3 text-[11px] text-slate-400">
                              <div className="flex items-center space-x-1.5 min-w-0">
                                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-850 text-slate-300 shrink-0">
                                  <User className="h-3 w-3" />
                                </div>
                                <span className="truncate text-slate-300 font-medium">{task.assignee?.name || 'Unassigned'}</span>
                              </div>
                              {task.dueDate && (
                                <div className="flex items-center space-x-1 shrink-0 text-slate-400">
                                  <Calendar className="h-3 w-3 text-slate-500" />
                                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                                </div>
                              )}
                            </div>

                            {/* Project reference */}
                            <div className="mt-2 text-[10px] text-slate-500 truncate">
                              Workspace: <strong className="text-slate-400">{task.project?.name || 'N/A'}</strong>
                            </div>

                            {/* Quick status progress buttons (Mobile/Accessibility friendly) */}
                            {canModify && col.name !== 'Completed' && (
                              <button
                                onClick={() => {
                                  const nextStatus =
                                    col.name === 'To Do' ? 'In Progress' :
                                    col.name === 'In Progress' ? 'Review' : 'Completed';
                                  updateStatusMutation.mutate({ id: task.id, status: nextStatus });
                                }}
                                className="mt-3 flex w-full items-center justify-center space-x-1 rounded bg-slate-900 border border-slate-850 px-2 py-1 text-[10px] font-bold text-slate-400 hover:text-white hover:border-slate-700 transition"
                              >
                                <span>Advance Status</span>
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex h-24 items-center justify-center text-slate-650 text-xs border border-dashed border-slate-900 rounded-lg">
                        Lanes empty
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
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editingTask ? (isAdmin ? 'Edit Task details' : 'Task Status update') : 'Create Task'}
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
              {/* Full edits only for admin */}
              {(!editingTask || isAdmin) ? (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Task Title</label>
                    <input
                      {...register('title')}
                      type="text"
                      placeholder="Implement authentication gateway"
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500"
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
                      className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Project Workspace</label>
                      <select
                        {...register('project')}
                        disabled={!!editingTask} // Project cannot be moved easily
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 disabled:opacity-50"
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
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
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
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
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
                        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                </>
              ) : (
                /* Readonly title/desc details for Employee status edits */
                <div className="space-y-4 rounded-lg bg-slate-950/50 p-4 border border-slate-850">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 block mb-0.5">Task Title</span>
                    <span className="text-sm font-bold text-white">{editingTask.title}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 block mb-0.5">Description</span>
                    <span className="text-xs text-slate-400 block leading-relaxed">{editingTask.description || 'No description.'}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
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

              {/* Status lane select (available for both Admin and Employee) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Task Lane Status</label>
                <select
                  {...register('status')}
                  className="w-full rounded-lg border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Review">Review</option>
                  <option value="Completed">Completed</option>
                </select>
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
                  disabled={taskMutation.isPending}
                  className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition disabled:opacity-50"
                >
                  {taskMutation.isPending ? 'Saving...' : editingTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
