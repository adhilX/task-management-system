'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import {
  Search,
  UserPlus,
  Edit2,
  Trash2,
  UserMinus,
  UserCheck,
  AlertCircle,
  ShieldCheck,
  User,
  Inbox,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';

import Modal from '@/components/shared/modal';
import ConfirmationDialog from '@/components/shared/confirmation-dialog';
import Badge from '@/components/shared/badge';
import { Card } from '@/components/shared/card';
import EmptyState from '@/components/shared/empty-state';
import { TableSkeleton } from '@/components/shared/loading-skeleton';

const employeeSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters').optional().or(zod.literal('')),
  role: zod.enum(['Admin', 'Employee']),
  department: zod.string().min(1, 'Please specify a department'),
});

type EmployeeFormValues = zod.infer<typeof employeeSchema>;

export default function EmployeesPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();

  // Filter States
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Confirmation States
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [statusChangeTarget, setStatusChangeTarget] = useState<any | null>(null);

  // Form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      role: 'Employee',
    },
  });

  // Check admin rights
  if (currentUser?.role !== 'Admin') {
    return (
      <div className="flex h-96 flex-col items-center justify-center space-y-3 rounded-xl border border-slate-900 bg-slate-900/10 p-8 text-center max-w-lg mx-auto mt-12">
        <ShieldCheck className="h-12 w-12 text-slate-500" />
        <h3 className="text-lg font-bold text-white">Access Denied</h3>
        <p className="text-sm text-slate-400">Only workspace Administrators can access Employee directories.</p>
      </div>
    );
  }

  // Fetch users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter, statusFilter],
    queryFn: async () => {
      const params: any = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (statusFilter) params.status = statusFilter;

      const response = await api.get('/users', { params });
      return response.data;
    },
  });

  // Create/Update Employee Mutation
  const employeeMutation = useMutation({
    mutationFn: async (data: EmployeeFormValues) => {
      if (editingEmployee) {
        // Update
        const updateData: any = {
          name: data.name,
          email: data.email,
          role: data.role,
          department: data.department,
        };
        if (data.password) {
          updateData.password = data.password;
        }
        const response = await api.put(`/users/${editingEmployee.id}`, updateData);
        return response.data;
      } else {
        // Create
        const response = await api.post('/users', data);
        return response.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingEmployee(null);
      reset();
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to save employee profile');
    },
  });

  // Toggle Account Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'Active' | 'Inactive' }) => {
      const newStatus = status === 'Active' ? 'Inactive' : 'Active';
      const response = await api.put(`/users/${id}`, { status: newStatus });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setStatusChangeTarget(null);
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
    },
  });

  const handleEditClick = (employee: any) => {
    setEditingEmployee(employee);
    setErrorMsg(null);
    reset({
      name: employee.name,
      email: employee.email,
      role: employee.role,
      department: employee.department || '',
      password: '', // Password optional on update
    });
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setErrorMsg(null);
    reset({
      name: '',
      email: '',
      role: 'Employee',
      department: '',
      password: '',
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data: EmployeeFormValues) => {
    employeeMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white leading-tight">Employee Directory</h2>
          <p className="text-sm text-slate-400 mt-0.5">Manage account access, assignments, and structural roles.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center space-x-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition-colors cursor-pointer shrink-0"
        >
          <UserPlus className="h-4.5 w-4.5" />
          <span>Add Employee</span>
        </button>
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
            placeholder="Search employees by name or email..."
            className="w-full rounded-lg border border-slate-900 bg-slate-950 px-10 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-900 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Employee">Employee</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-900 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>
      </Card>

      {/* Directory Table */}
      <div className="overflow-hidden rounded-xl border border-slate-900 bg-slate-900/20 backdrop-blur-xl">
        {isLoading ? (
          <TableSkeleton rows={5} cols={6} />
        ) : usersData && usersData.users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-900 bg-slate-900/40 text-xs font-bold uppercase tracking-wider text-slate-400">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Joined</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900/60">
                {usersData.users.map((employee: any) => (
                  <tr key={employee.id} className="hover:bg-slate-900/25 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-slate-300 font-bold text-xs uppercase">
                          {employee.name.slice(0, 2)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-sm font-semibold text-white">{employee.name}</span>
                          <span className="truncate text-xs text-slate-500">{employee.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-300">{employee.department || 'General'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={employee.role === 'Admin' ? 'indigo' : 'default'}>
                        {employee.role}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={employee.status === 'Active' ? 'emerald' : 'red'} glow={employee.status === 'Active'}>
                        <span className={`h-1.5 w-1.5 rounded-full ${employee.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
                        <span>{employee.status}</span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(employee.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleEditClick(employee)}
                          className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setStatusChangeTarget(employee)}
                          className={`rounded p-1.5 transition cursor-pointer ${
                            employee.status === 'Active'
                              ? 'text-amber-500 hover:bg-slate-800'
                              : 'text-emerald-500 hover:bg-slate-800'
                          }`}
                          title={employee.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
                        >
                          {employee.status === 'Active' ? <UserMinus className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => setDeleteTarget(employee)}
                          className="rounded p-1.5 text-slate-500 hover:bg-red-950/20 hover:text-red-400 transition cursor-pointer"
                          title="Delete Employee"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={Inbox}
            title="No Employees Found"
            description="We couldn't find any team members matching your filter or search query. Clear search filters or create a new user profile."
          />
        )}
      </div>

      {/* Creation/Editing Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
      >
        {errorMsg && (
          <div className="flex items-center space-x-2 rounded-lg bg-red-950/50 border border-red-500/50 p-3 text-xs text-red-400 mb-4">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Full Name</label>
            <input
              {...register('name')}
              type="text"
              placeholder="John Smith"
              className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:bg-slate-950"
            />
            {errors.name && (
              <p className="text-xs text-red-400">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Email Address</label>
            <input
              {...register('email')}
              type="email"
              placeholder="john.smith@company.com"
              className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:bg-slate-950"
            />
            {errors.email && (
              <p className="text-xs text-red-400">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Department</label>
            <input
              {...register('department')}
              type="text"
              placeholder="Engineering"
              className="w-full rounded-lg border border-slate-855 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:bg-slate-950"
            />
            {errors.department && (
              <p className="text-xs text-red-400">{errors.department.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">System Role</label>
            <select
              {...register('role')}
              className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-slate-300 outline-none focus:border-indigo-500 focus:bg-slate-950 cursor-pointer"
            >
              <option value="Employee">Employee</option>
              <option value="Admin">Admin</option>
            </select>
            {errors.role && (
              <p className="text-xs text-red-400">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">Password</label>
              {editingEmployee && (
                <span className="text-[10px] text-slate-500 uppercase font-medium">Leave blank to keep current</span>
              )}
            </div>
            <input
              {...register('password')}
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-850 bg-slate-950 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:bg-slate-950"
            />
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password.message}</p>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800/60">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={employeeMutation.isPending}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
            >
              {employeeMutation.isPending ? 'Saving...' : editingEmployee ? 'Save Changes' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteMutation.mutate(deleteTarget.id);
          }
        }}
        title="Delete Employee"
        message={`Are you sure you want to delete ${deleteTarget?.name}? This action is irreversible and will deactivate all of their platform access privileges.`}
        confirmText="Delete Account"
        isDangerous
        isLoading={deleteMutation.isPending}
      />

      {/* Toggle Status Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!statusChangeTarget}
        onClose={() => setStatusChangeTarget(null)}
        onConfirm={() => {
          if (statusChangeTarget) {
            toggleStatusMutation.mutate({
              id: statusChangeTarget.id,
              status: statusChangeTarget.status,
            });
          }
        }}
        title={statusChangeTarget?.status === 'Active' ? 'Deactivate Employee' : 'Activate Employee'}
        message={`Are you sure you want to ${statusChangeTarget?.status === 'Active' ? 'deactivate' : 'activate'} ${statusChangeTarget?.name}'s account?`}
        confirmText={statusChangeTarget?.status === 'Active' ? 'Deactivate' : 'Activate'}
        isDangerous={statusChangeTarget?.status === 'Active'}
        isLoading={toggleStatusMutation.isPending}
      />
    </div>
  );
}
