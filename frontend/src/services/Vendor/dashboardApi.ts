// src/services/User/dashboardApi.ts
import api from '../../config/axios.config';
import { VENDOR_ENDPOINTS } from '../../constants/apiEndPoint';
import { ERROR_MESSAGES } from '../../constants/auth.messages';
import { VendorDashboardData, DashboardQueryParams } from '../../types/vendorDashboard';

export const fetchDashboardData = async (params: DashboardQueryParams): Promise<VendorDashboardData> => {
  try {
    const response = await api.get(VENDOR_ENDPOINTS.getDashboard, { params });
    return response.data.data;
  } catch (error: any) {
    console.error('Error fetching dashboard data:', error);
    const errorMessage = error.response?.data?.message || ERROR_MESSAGES.FETCH_DASHBOARD_FAILED;
    throw new Error(errorMessage);
  }
};