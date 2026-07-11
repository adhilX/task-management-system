import api from './api-client';
import { Project } from '../types';

export const projectService = {
  async getProjects(params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }): Promise<{ projects: Project[]; total: number; pages: number }> {
    const response = await api.get('/projects', { params });
    return response.data;
  },

  async createProject(data: any): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data;
  },

  async updateProject(id: string, data: any): Promise<Project> {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  async deleteProject(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  }
};
