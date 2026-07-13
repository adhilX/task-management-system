"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiFetch } from "../../../../utils/api";
import { Plus, Pencil, Trash2 } from "lucide-react";

const taskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  project: z.string().min(1, "Please select a project"),
  assignee: z.string().min(1, "Please select an assignee"),
  dueDate: z.string().optional(),
});

type TaskInputs = z.infer<typeof taskSchema>;

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

  // 1. Fetch Tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery<{ tasks: Task[] }>({
    queryKey: ["tasks"],
    queryFn: () => apiFetch("/tasks", { params: { limit: 100 } }),
  });

  // 2. Fetch Projects
  const { data: projectsData } = useQuery<{ projects: Project[] }>({
    queryKey: ["projects"],
    queryFn: () => apiFetch("/projects"),
  });

  const projects = projectsData?.projects || [];

  const form = useForm<TaskInputs>({
    resolver: zodResolver(taskSchema),
    defaultValues: { title: "", description: "", status: "todo", priority: "medium", project: "", assignee: "" },
  });

  // Selected project to filter assignable team members
  const selectedProjectId = form.watch("project");
  const [assignableEmployees, setAssignableEmployees] = useState<Member[]>([]);

  useEffect(() => {
    if (!selectedProjectId || !projects) {
      setAssignableEmployees([]);
      return;
    }
    const proj = projects.find((p) => p.id === selectedProjectId);
    if (!proj) {
      setAssignableEmployees([]);
      return;
    }

    // Map team members (can be string IDs or Member objects)
    const members: Member[] = [];
    
    // Add manager if it is an object
    if (typeof proj.manager === "object" && proj.manager !== null) {
      members.push(proj.manager as Member);
    }
    
    proj.team.forEach((member) => {
      if (typeof member === "object" && member !== null) {
        members.push(member as Member);
      }
    });

    // Remove duplicates
    const uniqueMembers = members.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i);
    setAssignableEmployees(uniqueMembers);
    
    // Reset assignee if current assignee is not in the list of assignables anymore
    const currentAssignee = form.getValues("assignee");
    if (currentAssignee && !uniqueMembers.some((m) => m.id === currentAssignee)) {
      form.setValue("assignee", "");
    }
  }, [selectedProjectId, projects, form]);

  // 3. Create Task Mutation
  const createMutation = useMutation({
    mutationFn: (inputs: TaskInputs) => {
      const payload = {
        ...inputs,
        dueDate: inputs.dueDate ? new Date(inputs.dueDate).toISOString() : undefined,
      };
      return apiFetch("/tasks", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setTaskModalOpen(false);
      form.reset();
    },
  });

  // 4. Update Task Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, inputs }: { id: string; inputs: TaskInputs }) => {
      const payload = {
        ...inputs,
        dueDate: inputs.dueDate ? new Date(inputs.dueDate).toISOString() : undefined,
      };
      return apiFetch(`/tasks/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      setEditingTask(null);
      form.reset();
    },
  });

  // 5. Delete Task Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/tasks/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
  });

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    const projectId = typeof task.project === "object" ? task.project.id : task.project;
    const assigneeId = typeof task.assignee === "object" ? task.assignee.id : task.assignee;
    
    form.reset({
      title: task.title,
      description: task.description || "",
      status: task.status,
      priority: task.priority,
      project: projectId,
      assignee: assigneeId,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Sprint Tasks</h1>
          <p className="text-xs text-slate-400 mt-1">Designate tasks, set priorities, and assign employees.</p>
        </div>
        <button
          onClick={() => {
            form.reset({ title: "", description: "", status: "todo", priority: "medium", project: "", assignee: "" });
            setTaskModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg transition self-start"
        >
          <span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> New Task</span>
        </button>
      </div>

      {/* Tasks Table */}
      {tasksLoading ? (
        <div className="text-center py-10 text-xs text-slate-400">Loading sprint tasks...</div>
      ) : !tasksData || !tasksData.tasks || tasksData.tasks.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-500 border border-slate-850 rounded-2xl">
          No tasks created yet. Click "New Task" to create one.
        </div>
      ) : (
        <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-900/10">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase bg-slate-900/30">
                <th className="py-3 px-6">Task ID</th>
                <th className="py-3 px-6">Title</th>
                <th className="py-3 px-6">Project</th>
                <th className="py-3 px-6">Assignee</th>
                <th className="py-3 px-6">Priority</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {tasksData.tasks.map((task) => {
                const projName = typeof task.project === "object" ? task.project.name : "N/A";
                const assignName = typeof task.assignee === "object" ? task.assignee.name : "Unassigned";

                return (
                  <tr key={task.id} className="border-b border-slate-800/40 hover:bg-slate-900/10 transition">
                    <td className="py-4 px-6 font-mono text-[10px] text-slate-500">{task.id?.substring(18)}</td>
                    <td className="py-4 px-6 font-semibold text-white max-w-[200px] truncate">
                      {task.title}
                      {task.description && (
                        <span className="block text-[10px] font-normal text-slate-500 truncate mt-0.5">
                          {task.description}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-400">{projName}</td>
                    <td className="py-4 px-6 text-slate-450">{assignName}</td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        task.priority === "high"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : task.priority === "medium"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-800"
                      }`}>
                        {task.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                        task.status === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : task.status === "in-progress"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                          : task.status === "review"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-slate-500/10 text-slate-400 border-slate-800"
                      }`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleEdit(task)}
                        className="px-2.5 py-1 text-[11px] bg-slate-850 hover:bg-slate-800 text-slate-350 hover:text-white rounded-lg inline-flex items-center gap-1"
                      >
                        <Pencil className="w-2.5 h-2.5" /> Edit
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete this task?`)) {
                            deleteMutation.mutate(task.id);
                          }
                        }}
                        className="px-2.5 py-1 text-[11px] bg-red-650/10 hover:bg-red-650 hover:text-white text-red-400 border border-red-500/15 rounded-lg inline-flex items-center gap-1"
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
      {(taskModalOpen || editingTask) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">
                {editingTask ? "Edit Sprint Task" : "Assign New Task"}
              </h3>
              <button
                onClick={() => {
                  setTaskModalOpen(false);
                  setEditingTask(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit((data) => {
                if (editingTask) {
                  updateMutation.mutate({ id: editingTask.id, inputs: data });
                } else {
                  createMutation.mutate(data);
                }
              })}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Task Title
                </label>
                <input
                  type="text"
                  {...form.register("title")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  placeholder="Build auth service"
                />
                {form.formState.errors.title && (
                  <p className="text-[10px] text-red-400 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  {...form.register("description")}
                  rows={2}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  placeholder="Explain requirements or link details..."
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Project
                </label>
                <select
                  {...form.register("project")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="">Select Project</option>
                  {projects?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.project && (
                  <p className="text-[10px] text-red-400 mt-1">{form.formState.errors.project.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Assign Employee
                </label>
                <select
                  {...form.register("assignee")}
                  disabled={!selectedProjectId}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedProjectId
                      ? "Please select a project first"
                      : "Select Project Member"}
                  </option>
                  {assignableEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
                {form.formState.errors.assignee && (
                  <p className="text-[10px] text-red-400 mt-1">{form.formState.errors.assignee.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Priority
                  </label>
                  <select
                    {...form.register("priority")}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Status
                  </label>
                  <select
                    {...form.register("status")}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In Progress</option>
                    <option value="review">In Review</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  {...form.register("dueDate")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-white mt-4"
              >
                {editingTask ? "Save Task Changes" : "Assign Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
