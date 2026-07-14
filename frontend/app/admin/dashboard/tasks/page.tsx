"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../../../services/task.service";
import { projectService } from "../../../../services/project.service";
import { Plus, Pencil, Trash2 } from "lucide-react";
import TaskModal, { TaskInputs } from "../../../../components/TaskModal";
import ConfirmationModal from "@/components/ConfirmationModal";

interface Member {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  manager: string | Member;
  team: Array<string | Member>;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  project: string | Project;
  assignee: string | Member;
  dueDate?: string;
}

export default function AdminTasksPage() {
  const queryClient = useQueryClient();
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);

  // 1. Fetch Tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery<{ tasks: Task[] }>({
    queryKey: ["tasks"],
    queryFn: () => taskService.getTasks({ limit: 100 }),
  });

  // 2. Fetch Projects
  const { data: projectsData } = useQuery<{ projects: Project[] }>({
    queryKey: ["projects"],
    queryFn: () => projectService.getProjects(),
  });

  const projects = projectsData?.projects || [];

  // 4. Create Task Mutation
  const createMutation = useMutation({
    mutationFn: (inputs: TaskInputs) => {
      const payload = {
        ...inputs,
        dueDate: inputs.dueDate ? new Date(inputs.dueDate).toISOString() : undefined,
      };
      return taskService.createTask(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTaskModalOpen(false);
    },
  });

  // 5. Update Task Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, inputs }: { id: string; inputs: TaskInputs }) => {
      const payload = {
        ...inputs,
        dueDate: inputs.dueDate ? new Date(inputs.dueDate).toISOString() : undefined,
      };
      return taskService.updateTask(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(null);
    },
  });

  // 6. Delete Task Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      taskService.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
  const handleEdit = (task: Task) => {
    setEditingTask(task);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-title">Sprint Tasks</h1>
          <p className="text-xs text-text-muted mt-1">Designate tasks, set priorities, and assign employees.</p>
        </div>
        <button
          onClick={() => {
            setTaskModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-pure-white shadow-lg transition self-start"
        >
          <span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> New Task</span>
        </button>
      </div>

      {/* Tasks Table */}
      {tasksLoading ? (
        <div className="text-center py-10 text-xs text-text-muted">Loading sprint tasks...</div>
      ) : !tasksData || !tasksData.tasks || tasksData.tasks.length === 0 ? (
        <div className="text-center py-10 text-xs text-text-muted border border-border-card rounded-2xl bg-bg-card/50">
          No tasks created yet. Click "New Task" to create one.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border-card rounded-2xl bg-bg-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-card text-text-muted font-semibold uppercase bg-bg-accent/50">
                <th className="py-3 px-6">Task ID</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Project</th>
                <th className="py-3 px-6">Assignee</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-text-body">
              {tasksData.tasks.map((task) => {
                const projName = typeof task.project === "object" ? task.project.name : "N/A";
                const assignName = typeof task.assignee === "object" ? task.assignee.name : "Unassigned";

                return (
                  <tr key={task.id} className="border-b border-border-card/40 hover:bg-bg-accent/40 transition">
                    <td className="py-4 px-6 font-mono text-[10px] text-text-muted">{task.id?.substring(18)}</td>
                    <td className="py-4 px-6 font-semibold text-text-title max-w-[200px] truncate">
                      {task.title}
                      {task.description && (
                        <span className="block text-[10px] font-normal text-text-muted truncate mt-0.5">
                          {task.description}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-text-body">{projName}</td>
                    <td className="py-4 px-6 text-text-body">{assignName}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${task.priority?.toLowerCase() === "high"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : task.priority?.toLowerCase() === "medium"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                            : "bg-bg-accent text-text-muted border-border-card"
                        }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${task.status?.toLowerCase() === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : task.status?.toLowerCase() === "in progress" || task.status?.toLowerCase() === "in-progress"
                            ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                            : task.status?.toLowerCase() === "review"
                              ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                              : "bg-bg-accent text-text-muted border-border-card"
                        }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="px-2.5 py-1 text-[11px] bg-bg-accent hover:bg-border-accent/40 text-text-body hover:text-text-title rounded-lg inline-flex items-center gap-1"
                      >
                        <Pencil className="w-2.5 h-2.5" /> Edit
                      </button>
                      <button
                        onClick={() => setTaskToDelete(task)}
                        className="px-2.5 py-1 text-[11px] bg-red-500/10 hover:bg-red-500 hover:text-pure-white text-red-500 border border-red-500/20 rounded-lg inline-flex items-center gap-1"
                      >
                        <Trash2 className="w-2.5 h-2.5" /> Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Task Modal (Create/Edit) */}
      <TaskModal
        isOpen={taskModalOpen || !!editingTask}
        onClose={() => {
          setTaskModalOpen(false);
          setEditingTask(null);
        }}
        editingTask={editingTask}
        projects={projects}
        onSubmit={(data) => {
          if (editingTask) {
            updateMutation.mutate({ id: editingTask.id, inputs: data });
          } else {
            createMutation.mutate(data);
          }
        }}
        isPending={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={() => {
          if (taskToDelete) {
            deleteMutation.mutate(taskToDelete.id);
          }
        }}
        title="Delete Task"
        message={`Are you sure you want to permanently delete task "${taskToDelete?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
