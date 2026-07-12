"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { apiFetch } from "../../../../utils/api";
import { useAdminAuthStore } from "../../../../stores/adminAuthStore";

const projectSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
  status: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  team: z.array(z.string()),
});

type ProjectInputs = z.infer<typeof projectSchema>;

interface Member {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  manager: string | Member;
  team: Array<string | Member>;
}

export default function AdminProjectsPage() {
  const queryClient = useQueryClient();
  const { adminInfo } = useAdminAuthStore();
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  // 1. Fetch Projects
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => apiFetch("/projects"),
  });

  // 2. Fetch Employees (for Team selection)
  const { data: employeesData } = useQuery<{ users: Member[] }>({
    queryKey: ["employeesList"],
    queryFn: () => apiFetch("/users", { params: { page: 1, limit: 100, role: "employee" } }),
  });

  const form = useForm<ProjectInputs>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "", status: "planning", team: [] },
  });

  // 3. Create Project Mutation
  const createMutation = useMutation({
    mutationFn: (inputs: ProjectInputs) => {
      const payload = {
        ...inputs,
        manager: adminInfo?.id || "",
        // Ensure dates are ISO formatted if provided
        startDate: inputs.startDate ? new Date(inputs.startDate).toISOString() : undefined,
        endDate: inputs.endDate ? new Date(inputs.endDate).toISOString() : undefined,
      };
      return apiFetch("/projects", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setProjectModalOpen(false);
      form.reset();
    },
  });

  // 4. Update Project Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, inputs }: { id: string; inputs: ProjectInputs }) => {
      const payload = {
        ...inputs,
        startDate: inputs.startDate ? new Date(inputs.startDate).toISOString() : undefined,
        endDate: inputs.endDate ? new Date(inputs.endDate).toISOString() : undefined,
      };
      return apiFetch(`/projects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      setEditingProject(null);
      form.reset();
    },
  });

  // 5. Delete Project Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/projects/${id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      name: project.name,
      description: project.description || "",
      status: project.status,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split("T")[0] : "",
      endDate: project.endDate ? new Date(project.endDate).toISOString().split("T")[0] : "",
      team: project.team.map((member) => (typeof member === "object" ? member.id : member)),
    });
  };

  const handleCheckboxChange = (employeeId: string, checked: boolean) => {
    const currentTeam = form.getValues("team");
    if (checked) {
      form.setValue("team", [...currentTeam, employeeId]);
    } else {
      form.setValue("team", currentTeam.filter((id) => id !== employeeId));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Project Workflow</h1>
          <p className="text-xs text-slate-400 mt-1">Configure project lifecycles and assign employee workspaces.</p>
        </div>
        <button
          onClick={() => {
            form.reset({ name: "", description: "", status: "planning", team: [] });
            setProjectModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-purple-600 hover:bg-purple-500 text-white shadow-lg transition self-start"
        >
          ➕ New Project
        </button>
      </div>

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="text-center py-10 text-xs text-slate-400">Loading system projects...</div>
      ) : !projects || projects.length === 0 ? (
        <div className="text-center py-10 text-xs text-slate-500 border border-slate-850 rounded-2xl">
          No projects configured yet. Click "New Project" to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const teamNames = proj.team
              .map((member) => (typeof member === "object" ? member.name : member))
              .join(", ");

            return (
              <div
                key={proj.id}
                className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 hover:border-slate-700 transition flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white tracking-tight text-base">{proj.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                      proj.status === "active"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : proj.status === "completed"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-slate-500/10 text-slate-400 border-slate-800"
                    }`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-450 leading-relaxed min-h-[40px]">
                    {proj.description || "No project description provided."}
                  </p>

                  <div className="text-[11px] space-y-1 pt-2 border-t border-slate-800/60">
                    <p className="text-slate-450">
                      <span className="font-semibold text-slate-300">Team:</span> {teamNames || "Unassigned"}
                    </p>
                    {proj.startDate && (
                      <p className="text-slate-500">
                        Start: {new Date(proj.startDate).toLocaleDateString()} &bull; End:{" "}
                        {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : "N/A"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-slate-800/40">
                  <button
                    onClick={() => handleEdit(proj)}
                    className="px-2.5 py-1 text-[11px] bg-slate-850 hover:bg-slate-800 text-slate-300 rounded-lg"
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete ${proj.name}?`)) {
                        deleteMutation.mutate(proj.id);
                      }
                    }}
                    className="px-2.5 py-1 text-[11px] bg-red-650/10 hover:bg-red-650 hover:text-white text-red-400 border border-red-500/15 rounded-lg"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Project Modal (Create/Edit) */}
      {(projectModalOpen || editingProject) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white">
                {editingProject ? `Edit Project: ${editingProject.name}` : "Create New Project"}
              </h3>
              <button
                onClick={() => {
                  setProjectModalOpen(false);
                  setEditingProject(null);
                }}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit((data) => {
                if (editingProject) {
                  updateMutation.mutate({ id: editingProject.id, inputs: data });
                } else {
                  createMutation.mutate(data);
                }
              })}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  {...form.register("name")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  placeholder="Website Redesign"
                />
                {form.formState.errors.name && (
                  <p className="text-[10px] text-red-400 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Description
                </label>
                <textarea
                  {...form.register("description")}
                  rows={3}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  placeholder="Details about project objectives and scope..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    {...form.register("startDate")}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    {...form.register("endDate")}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                  Status
                </label>
                <select
                  {...form.register("status")}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="planning">Planning</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="on-hold">On Hold</option>
                </select>
              </div>

              {/* Assign Team Members Checkboxes */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                  Assign Team Members
                </label>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl max-h-40 overflow-y-auto space-y-2">
                  {!employeesData || employeesData.users.length === 0 ? (
                    <p className="text-[10px] text-slate-500 text-center py-2">
                      No active employees found to assign.
                    </p>
                  ) : (
                    employeesData.users.map((emp) => (
                      <label key={emp.id} className="flex items-center gap-2 text-xs text-slate-350 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.watch("team")?.includes(emp.id)}
                          onChange={(e) => handleCheckboxChange(emp.id, e.target.checked)}
                          className="rounded border-slate-800 bg-slate-900 text-purple-600 focus:ring-0"
                        />
                        {emp.name}
                      </label>
                    ))
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-semibold text-white mt-4"
              >
                {editingProject ? "Save Project Changes" : "Create Project Workflow"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
