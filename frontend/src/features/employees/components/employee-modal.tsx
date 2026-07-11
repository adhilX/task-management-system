import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { AlertCircle } from 'lucide-react';
import Modal from '@/components/shared/modal';

export const employeeSchema = zod.object({
  name: zod.string().min(2, 'Name must be at least 2 characters'),
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(6, 'Password must be at least 6 characters').optional().or(zod.literal('')),
  role: zod.enum(['Admin', 'Employee']),
  department: zod.string().min(1, 'Please specify a department'),
});

export type EmployeeFormValues = zod.infer<typeof employeeSchema>;

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingEmployee: any | null;
  onSubmit: (data: EmployeeFormValues) => void;
  isPending: boolean;
  errorMsg: string | null;
}

export function EmployeeModal({
  isOpen,
  onClose,
  editingEmployee,
  onSubmit,
  isPending,
  errorMsg,
}: EmployeeModalProps) {
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

  // Reset form when modal opens/closes or editing employee details change
  useEffect(() => {
    if (isOpen) {
      if (editingEmployee) {
        reset({
          name: editingEmployee.name,
          email: editingEmployee.email,
          role: editingEmployee.role,
          department: editingEmployee.department || '',
          password: '',
        });
      } else {
        reset({
          name: '',
          email: '',
          role: 'Employee',
          department: '',
          password: '',
        });
      }
    }
  }, [editingEmployee, isOpen, reset]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingEmployee ? 'Edit Employee Profile' : 'Add New Employee'}
    >
      {errorMsg && (
        <div className="flex items-center space-x-2 rounded-lg bg-red-950/50 border border-red-500/50 p-3 text-xs text-red-400 mb-4">
          <AlertCircle className="h-4.5 w-4.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            className="w-full rounded-lg border border-slate-855 bg-slate-955 px-4 py-2.5 text-sm text-white outline-none focus:border-indigo-500 focus:bg-slate-955"
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
            onClick={onClose}
            className="rounded-lg bg-slate-800 px-4 py-2.5 text-sm font-semibold text-slate-300 hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 transition disabled:opacity-50 cursor-pointer"
          >
            {isPending ? 'Saving...' : editingEmployee ? 'Save Changes' : 'Create Account'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
