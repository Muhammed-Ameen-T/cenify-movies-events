// src/services/api/adminDashboardApi.ts
import api from '../../config/axios.config';
import { ADMIN_ENDPOINTS } from '../../constants/apiEndPoint';
import { ERROR_MESSAGES } from '../../constants/auth.messages';
import { AdminDashboardData, AdminDashboardQueryParams } from '../../types/adminDashboard';

export const fetchAdminDashboardData = async (params: AdminDashboardQueryParams): Promise<AdminDashboardData> => {
  try {
    const response = await api.get(ADMIN_ENDPOINTS.getDashboard, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching admin dashboard data:', error);
    const errorMessage = error.response?.data?.message || ERROR_MESSAGES.FETCH_DASHBOARD_FAILED;
    throw new Error(errorMessage);
  }
};