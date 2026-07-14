"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { userService } from "../../../../services/user.service";
import { Plus, Pencil, Trash2, Lock, Unlock } from "lucide-react";
import ConfirmationModal from "@/components/ConfirmationModal";

const inviteSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  department: z.string().min(1, "Please select a department"),
});

const editSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  department: z.string().min(1, "Please select a department"),
});

type InviteInputs = z.infer<typeof inviteSchema>;
type EditInputs = z.infer<typeof editSchema>;

interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department?: string;
  createdAt: string;
}

export default function AdminEmployeesPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // 1. Fetch Users List
  const { data, isLoading } = useQuery<{ users: Employee[]; total: number }>({
    queryKey: ["employees", searchTerm],
    queryFn: () =>
      userService.getUsers({
        page: 1,
        limit: 100,
        search: searchTerm,
        role: "employee",
      }),
  });

  // Forms
  const inviteForm = useForm<InviteInputs>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { name: "", email: "", department: "" },
  });

  const editForm = useForm<EditInputs>({
    resolver: zodResolver(editSchema),
  });

  // 2. Invite Employee Mutation
  const inviteMutation = useMutation({
    mutationFn: (inputs: InviteInputs) =>
      userService.inviteEmployee(inputs),
    onSuccess: (newUser, variables) => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setSuccessMsg(`Successfully invited ${variables.name}! An email has been queued.`);
      inviteForm.reset();
      setInviteModalOpen(false);
      setTimeout(() => setSuccessMsg(""), 5000);
    },
    onError: (err: any) => {
      setErrorMsg(err.message || "Failed to invite employee.");
      setTimeout(() => setErrorMsg(""), 5000);
    },
  });

  // 3. Toggle Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      userService.updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  // 4. Edit Employee Mutation
  const editMutation = useMutation({
    mutationFn: ({ id, name, department }: { id: string; name: string; department: string }) =>
      userService.updateUser(id, { name, department }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEditEmployee(null);
    },
  });

  // 5. Delete Employee Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees"] });
    },
  });

  const openEditModal = (emp: Employee) => {
    setEditEmployee(emp);
    editForm.reset({
      name: emp.name,
      department: emp.department || "",
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-text-title">Employee Management</h1>
          <p className="text-xs text-text-muted mt-1">Invite, configure, activate, and deactivate team accounts.</p>
        </div>
        <button
          onClick={() => setInviteModalOpen(true)}
          className="px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-pure-white shadow-lg transition self-start"
        >
          <span className="flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" /> Invite Employee</span>
        </button>
      </div>

      {/* Alerts */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25 text-xs text-emerald-405">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-400">
          {errorMsg}
        </div>
      )}

      {/* Search Input */}
      <div className="max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full px-4 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title placeholder-text-muted focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
      </div>

      {/* Employees Table */}
      {isLoading ? (
        <div className="text-center py-10 text-xs text-text-muted">Loading team members...</div>
      ) : !data || data.users.length === 0 ? (
        <div className="text-center py-10 text-xs text-text-muted border border-border-card rounded-2xl bg-bg-card/50">
          No employees found matching the search.
        </div>
      ) : (
        <div className="overflow-x-auto border border-border-card rounded-2xl bg-bg-card">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-border-card text-text-muted font-semibold uppercase bg-bg-accent/50">
                <th className="py-3 px-6">Name</th>
                <th className="py-3 px-6">Email</th>
                <th className="py-3 px-6">Department</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="text-text-body">
              {data.users.map((emp) => (
                <tr key={emp.id} className="border-b border-border-card/40 hover:bg-bg-accent/40 transition">
                  <td className="py-4 px-6 font-semibold text-text-title">{emp.name}</td>
                  <td className="py-4 px-6 text-text-body">{emp.email}</td>
                  <td className="py-4 px-6 text-text-body">{emp.department || "General"}</td>
                  <td className="py-4 px-6">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold border ${emp.status === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : emp.status === "pending"
                          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                          : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(emp)}
                      className="px-2 py-1 bg-bg-accent hover:bg-border-accent/40 text-text-body hover:text-text-title rounded-lg inline-flex items-center gap-1"
                    >
                      <Pencil className="w-2.5 h-2.5" /> Edit
                    </button>
                    <button
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          id: emp.id,
                          status: emp.status === "active" ? "inactive" : "active",
                        })
                      }
                      className={`px-2 py-1 rounded-lg text-pure-white inline-flex items-center gap-1 ${emp.status === "active"
                          ? "bg-amber-600 hover:bg-amber-500"
                          : "bg-emerald-600 hover:bg-emerald-500"
                        }`}
                    >
                      {emp.status === "active" ? (
                        <>
                          <Lock className="w-2.5 h-2.5" /> Suspend
                        </>
                      ) : (
                        <>
                          <Unlock className="w-2.5 h-2.5" /> Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setEmployeeToDelete(emp)}
                      className="px-2 py-1 bg-red-500/10 hover:bg-red-550 hover:text-pure-white text-red-500 border border-red-500/20 rounded-lg inline-flex items-center gap-1"
                    >
                      <Trash2 className="w-2.5 h-2.5" /> Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Invite Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-bg-card border border-border-card rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border-card pb-3">
              <h3 className="font-bold text-text-title">Invite Team Member</h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-text-muted hover:text-text-title">✕</button>
            </div>
            <form onSubmit={inviteForm.handleSubmit((d) => inviteMutation.mutate(d))} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  {...inviteForm.register("name")}
                  className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
                  placeholder="Jane Doe"
                />
                {inviteForm.formState.errors.name && <p className="text-[10px] text-red-400 mt-1">{inviteForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Email Address</label>
                <input
                  type="email"
                  {...inviteForm.register("email")}
                  className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
                  placeholder="jane.doe@company.com"
                />
                {inviteForm.formState.errors.email && <p className="text-[10px] text-red-400 mt-1">{inviteForm.formState.errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Department</label>
                <select
                  {...inviteForm.register("department")}
                  className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
                >
                  <option value="">Select Department</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
                {inviteForm.formState.errors.department && <p className="text-[10px] text-red-400 mt-1">{inviteForm.formState.errors.department.message}</p>}
              </div>
              <button
                type="submit"
                disabled={inviteMutation.isPending}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-pure-white"
              >
                {inviteMutation.isPending ? "Sending Invite..." : "Send Secure Invitation Link"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-bg-card border border-border-card rounded-2xl p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-border-card pb-3">
              <h3 className="font-bold text-text-title">Edit Team Member</h3>
              <button onClick={() => setEditEmployee(null)} className="text-text-muted hover:text-text-title">✕</button>
            </div>
            <form
              onSubmit={editForm.handleSubmit((d) =>
                editMutation.mutate({ id: editEmployee.id, name: d.name, department: d.department })
              )}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Full Name</label>
                <input
                  type="text"
                  {...editForm.register("name")}
                  className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
                />
                {editForm.formState.errors.name && <p className="text-[10px] text-red-400 mt-1">{editForm.formState.errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider text-text-muted font-semibold mb-1">Department</label>
                <select
                  {...editForm.register("department")}
                  className="w-full px-3 py-2 bg-bg-input border border-border-input rounded-xl text-xs text-text-title"
                >
                  <option value="Engineering">Engineering</option>
                  <option value="Product">Product</option>
                  <option value="HR">HR</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Operations">Operations</option>
                </select>
                {editForm.formState.errors.department && <p className="text-[10px] text-red-400 mt-1">{editForm.formState.errors.department.message}</p>}
              </div>
              <button
                type="submit"
                disabled={editMutation.isPending}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-semibold text-pure-white"
              >
                {editMutation.isPending ? "Saving Changes..." : "Save Member Details"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!employeeToDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={() => {
          if (employeeToDelete) {
            deleteMutation.mutate(employeeToDelete.id);
          }
        }}
        title="Delete Team Member"
        message={`Are you sure you want to permanently delete team member "${employeeToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
}
