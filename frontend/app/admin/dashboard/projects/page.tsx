"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { projectService } from "../../../../services/project.service";
import { userService } from "../../../../services/user.service";
import { useAdminAuthStore } from "../../../../stores/adminAuthStore";
import { Plus, Pencil, Trash2 } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";

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
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  // 1. Fetch Projects
  const { data: projectsData, isLoading: projectsLoading } = useQuery<{ projects: Project[] }>({
    queryKey: ["projects"],
    queryFn: () => projectService.getProjects(),
  });

  const projects = projectsData?.projects || [];

  // 2. Fetch Employees (for Team selection)
  const { data: employeesData } = useQuery<{ users: Member[] }>({
    queryKey: ["employeesList"],
    queryFn: () => userService.getUsers({ page: 1, limit: 100, role: "employee" }),
  });

  const form = useForm<ProjectInputs>({
    resolver: zodResolver(projectSchema),
    defaultValues: { name: "", description: "", status: "Planning", team: [] },
  });

  // 3. Create Project Mutation
  const createMutation = useMutation({
    mutationFn: (inputs: ProjectInputs) => {
      const payload = {
        ...inputs,
        // Ensure dates are ISO formatted if provided
        startDate: inputs.startDate ? new Date(inputs.startDate).toISOString() : undefined,
        endDate: inputs.endDate ? new Date(inputs.endDate).toISOString() : undefined,
      };
      return projectService.createProject(payload);
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
      return projectService.updateProject(id, payload);
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
      projectService.deleteProject(id),
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
          <h1 className="text-xl font-bold tracking-tight text-text-title">Project Workflow</h1>
          <p className="text-xs text-text-muted mt-1">Configure project lifecycles and assign employee workspaces.</p>
        </div>
        <button
          onClick={() => {
            form.reset({ name: "", description: "", status: "Planning", team: [] });
            setProjectModalOpen(true);
          }}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-pure-white shadow-lg transition self-start"
        >
          <span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> New Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {projectsLoading ? (
        <div className="text-center py-10 text-xs text-text-muted">Loading system projects...</div>
      ) : !projects || projects.length === 0 ? (
        <div className="text-center py-10 text-xs text-text-muted border border-border-card rounded-2xl bg-bg-card/50">
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
                className="p-6 rounded-2xl bg-bg-card border border-border-card hover:border-border-accent/60 transition flex flex-col justify-between shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-text-title tracking-tight text-base">{proj.name}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border capitalize ${proj.status?.toLowerCase() === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : proj.status?.toLowerCase() === "completed"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-bg-accent text-text-muted border-border-card"
                      }`}>
                      {proj.status}
                    </span>
                  </div>
                  <p className="text-xs text-text-body leading-relaxed min-h-[40px]">
                    {proj.description || "No project description provided."}
                  </p>

                  <div className="text-[11px] space-y-1 pt-2 border-t border-border-card/60">
                    <p className="text-text-body">
                      <span className="font-semibold text-text-title">Team:</span> {teamNames || "Unassigned"}
                    </p>
                    {proj.startDate && (
                      <p className="text-text-muted">
                        Start: {new Date(proj.startDate).toLocaleDateString()} &bull; End:{" "}
                        {proj.endDate ? new Date(proj.endDate).toLocaleDateString() : "N/A"}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-border-card/45">
                  <button
                    onClick={() => handleEdit(proj)}
                    className="px-2.5 py-1 text-[11px] bg-bg-accent hover:bg-border-accent/40 text-text-body hover:text-text-title rounded-lg flex items-center gap-1"
                  >
                    <Pencil className="w-2.5 h-2.5" /> Edit
                  </button>
                  <button
                    onClick={() => setProjectToDelete(proj)}
                    className="px-2.5 py-1 text-[11px] bg-red-500/10 hover:bg-red-50 hover:text-pure-white text-red-500 border border-red-500/20 rounded-lg flex items-center gap-1"
                  >
                    <Trash2 className="w-2.5 h-2.5" /> Delete
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
          <div className="w-full max-w-lg bg-bg-card border border-border-card rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center border-b border-border-card pb-3">
              <h3 className="font-bold text-text-title">
                {editingProject ? `Edit Project: ${editingProject.name}` : "Create New Project"}
              </h3>
              <button
                onClick={() => {
                  setProjectModalOpen(false);
                  setEditingProject(null);
                }}
                className="text-text-muted hover:text-text-title"
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
                <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  {...form.register("name")}
                  className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
                  placeholder="Website Redesign"
                />
                {form.formState.errors.name && (
                  <p className="text-[10px] text-red-400 mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                  Description
                </label>
                <textarea
                  {...form.register("description")}
                  rows={3}
                  className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
                  placeholder="Details about project objectives and scope..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    {...form.register("startDate")}
                    className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    {...form.register("endDate")}
                    className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                  Status
                </label>
                <select
                  {...form.register("status")}
                  className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
                >
                  <option value="Planning">Planning</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                </select>
              </div>

              {/* Assign Team Members Checkboxes */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1.5">
                  Assign Team Members
                </label>
                <div className="p-3 bg-bg-input border border-border-input rounded-xl max-h-40 overflow-y-auto space-y-2">
                  {!employeesData || employeesData.users.length === 0 ? (
                    <p className="text-[10px] text-slate-500 text-center py-2">
                      No active employees found to assign.
                    </p>
                  ) : (
                    employeesData.users.map((emp) => (
                      <label key={emp.id} className="flex items-center gap-2 text-xs text-text-body cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.watch("team")?.includes(emp.id)}
                          onChange={(e) => handleCheckboxChange(emp.id, e.target.checked)}
                          className="rounded border-border-input bg-bg-input text-emerald-600 focus:ring-0"
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
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-pure-white mt-4"
              >
                {editingProject ? "Save Project Changes" : "Create Project Workflow"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        onConfirm={() => {
          if (projectToDelete) {
            deleteMutation.mutate(projectToDelete.id);
          }
        }}
        title="Delete Project"
        message={`Are you sure you want to permanently delete project "${projectToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
