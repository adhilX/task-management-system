import React from 'react';
import { Edit2, Trash2, UserMinus, UserCheck } from 'lucide-react';
import Badge from '@/components/ui/badge';

interface EmployeeTableProps {
  users: any[];
  onEdit: (employee: any) => void;
  onToggleStatus: (employee: any) => void;
  onDelete: (employee: any) => void;
}

export function EmployeeTable({ users, onEdit, onToggleStatus, onDelete }: EmployeeTableProps) {
  return (
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
          {users.map((employee: any) => (
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
                    onClick={() => onEdit(employee)}
                    className="rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition cursor-pointer"
                    title="Edit Profile"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onToggleStatus(employee)}
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
                    onClick={() => onDelete(employee)}
                    className="rounded p-1.5 text-slate-555 hover:bg-red-950/20 hover:text-red-400 transition cursor-pointer"
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
  );
}
