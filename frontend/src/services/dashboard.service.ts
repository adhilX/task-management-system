import api from './api-client';
import { DashboardStats } from '../types';

export const dashboardService = {
  async getAdminStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/admin');
    return response.data;
  },

  async getEmployeeStats(): Promise<DashboardStats> {
    const response = await api.get('/dashboard/employee');
    return response.data;
  }
};
