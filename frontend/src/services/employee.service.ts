import api from './api-client';
import { User } from '../types';

export const employeeService = {
  async getEmployees(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
  }): Promise<{ users: User[]; total: number; pages: number }> {
    const response = await api.get('/users', { params });
    return response.data;
  },

  async createEmployee(data: any): Promise<User> {
    const response = await api.post('/users', data);
    return response.data;
  },

  async updateEmployee(id: string, data: any): Promise<User> {
    const response = await api.put(`/users/${id}`, data);
    return response.data;
  },

  async deleteEmployee(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  }
};
