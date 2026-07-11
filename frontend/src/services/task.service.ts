import api from './api-client';
import { Task } from '../types';

export const taskService = {
  async getTasks(params: {
    page?: number;
    limit?: number;
    projectId?: string;
    priority?: string;
    search?: string;
  }): Promise<{ tasks: Task[]; total: number; pages: number }> {
    const response = await api.get('/tasks', { params });
    return response.data;
  },

  async createTask(data: any): Promise<Task> {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  async updateTask(id: string, data: any): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  async deleteTask(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  }
};
