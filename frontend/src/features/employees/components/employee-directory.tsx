import React, { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeService } from '@/services/employee.service';
import { Search, UserPlus, ShieldCheck, Inbox } from 'lucide-react';

import ConfirmationDialog from '@/components/shared/confirmation-dialog';
import { Card } from '@/components/ui/card';
import EmptyState from '@/components/shared/empty-state';
import { TableSkeleton } from '@/components/common/loading-skeleton';

import { EmployeeTable } from './employee-table';
import { EmployeeModal, EmployeeFormValues } from './employee-modal';

export function EmployeeDirectory() {
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
      return employeeService.getEmployees({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        status: statusFilter || undefined,
      });
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
        return employeeService.updateEmployee(editingEmployee.id, updateData);
      } else {
        // Create
        return employeeService.createEmployee(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsModalOpen(false);
      setEditingEmployee(null);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.message || 'Failed to save employee profile');
    },
  });

  // Toggle Account Status Mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'Active' | 'Inactive' }) => {
      const newStatus = status === 'Active' ? 'Inactive' : 'Active';
      return employeeService.updateEmployee(id, { status: newStatus });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setStatusChangeTarget(null);
    },
  });

  // Delete User Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return employeeService.deleteEmployee(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setDeleteTarget(null);
    },
  });

  const handleEditClick = (employee: any) => {
    setEditingEmployee(employee);
    setErrorMsg(null);
    setIsModalOpen(true);
  };

  const handleOpenAddModal = () => {
    setEditingEmployee(null);
    setErrorMsg(null);
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
            className="w-full rounded-lg border border-slate-900 bg-slate-955 px-10 py-2.5 text-sm text-white outline-none transition focus:border-indigo-500"
          />
        </div>

        {/* Role Filter */}
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-lg border border-slate-900 bg-slate-955 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500 cursor-pointer"
        >
          <option value="">All Roles</option>
          <option value="Admin">Admin</option>
          <option value="Employee">Employee</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-900 bg-slate-955 px-4 py-2.5 text-sm text-slate-300 outline-none transition focus:border-indigo-500 cursor-pointer"
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
          <EmployeeTable
            users={usersData.users}
            onEdit={handleEditClick}
            onToggleStatus={setStatusChangeTarget}
            onDelete={setDeleteTarget}
          />
        ) : (
          <EmptyState
            icon={Inbox}
            title="No Employees Found"
            description="We couldn't find any team members matching your filter or search query. Clear search filters or create a new user profile."
          />
        )}
      </div>

      {/* Creation/Editing Modal */}
      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingEmployee={editingEmployee}
        onSubmit={handleFormSubmit}
        isPending={employeeMutation.isPending}
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
