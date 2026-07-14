import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { projectService } from "../services/project.service";

const taskSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().optional(),
  status: z.string(),
  priority: z.string(),
  project: z.string().min(1, "Please select a project"),
  assignee: z.string().min(1, "Please select an assignee"),
  dueDate: z.string().optional(),
});

export type TaskInputs = z.infer<typeof taskSchema>;

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

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTask: Task | null;
  projects: Project[];
  onSubmit: (data: TaskInputs) => void;
  isPending: boolean;
}

export default function TaskModal({
  isOpen,
  onClose,
  editingTask,
  projects,
  onSubmit,
  isPending,
}: TaskModalProps) {
  const form = useForm<TaskInputs>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      status: "To Do",
      priority: "Medium",
      project: "",
      assignee: "",
      dueDate: "",
    },
  });

  const selectedProjectId = form.watch("project");
  const [projectMembers, setProjectMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (!selectedProjectId) {
      setProjectMembers([]);
      return;
    }

    setLoadingMembers(true);
    projectService
      .getProjectMembers(selectedProjectId)
      .then((members: any) => {
        setProjectMembers(members || []);
      })
      .catch((err) => {
        console.error("Failed to load project members:", err);
      })
      .finally(() => {
        setLoadingMembers(false);
      });
  }, [selectedProjectId]);

  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        const projectId = typeof editingTask.project === "object" ? editingTask.project.id : editingTask.project;
        const assigneeId = typeof editingTask.assignee === "object" ? editingTask.assignee.id : editingTask.assignee;
        form.reset({
          title: editingTask.title,
          description: editingTask.description || "",
          status: editingTask.status,
          priority: editingTask.priority,
          project: projectId,
          assignee: assigneeId,
          dueDate: editingTask.dueDate ? new Date(editingTask.dueDate).toISOString().split("T")[0] : "",
        });
      } else {
        form.reset({
          title: "",
          description: "",
          status: "To Do",
          priority: "Medium",
          project: "",
          assignee: "",
          dueDate: "",
        });
      }
    }
  }, [isOpen, editingTask, form]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-bg-card border border-border-card rounded-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex justify-between items-center border-b border-border-card pb-3">
          <h3 className="font-bold text-text-title">
            {editingTask ? "Edit Sprint Task" : "Assign New Task"}
          </h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-title"
          >
            ✕
          </button>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
              Task Title
            </label>
            <input
              type="text"
              {...form.register("title")}
              className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
              placeholder="Build auth service"
            />
            {form.formState.errors.title && (
              <p className="text-[10px] text-red-400 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
              Description
            </label>
            <textarea
              {...form.register("description")}
              rows={2}
              className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
              placeholder="Explain requirements or link details..."
            />
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
              Project
            </label>
            <select
              {...form.register("project")}
              className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
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

          <div className="relative group">
            <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
              Assign Employee
            </label>
            <select
              {...form.register("assignee")}
              disabled={!selectedProjectId}
              className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <option value="">
                {!selectedProjectId ? "Please select a project first" : "Select Assignee"}
              </option>
              {loadingMembers ? (
                <option disabled>Loading members...</option>
              ) : (
                projectMembers?.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name}
                  </option>
                ))
              )}
            </select>

            {/* Beautiful Custom CSS Tooltip */}
            {!selectedProjectId && (
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-max max-w-[200px] bg-bg-card/95 backdrop-blur-md border border-border-card text-text-title text-[10px] px-3 py-1.5 rounded-xl shadow-xl z-20 pointer-events-none transition-all duration-200 text-center">
                Please select a project first to assign an employee.
              </div>
            )}

            {form.formState.errors.assignee && (
              <p className="text-[10px] text-red-400 mt-1">{form.formState.errors.assignee.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                Priority
              </label>
              <select
                {...form.register("priority")}
                className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
                Status
              </label>
              <select
                {...form.register("status")}
                className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
              >
                <option value="To Do">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Review">In Review</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">
              Due Date
            </label>
            <input
              type="date"
              {...form.register("dueDate")}
              className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-pure-white mt-4"
          >
            {editingTask ? "Save Task Changes" : "Assign Task"}
          </button>
        </form>
      </div>
    </div>
  );
}
