// src/services/Admin/userApi.ts
import api from '../../config/axios.config';
import { User } from '../../types/user';

interface FetchUsersParams {
  page: number;
  limit: number;
  isBlocked?: boolean; // Changed to boolean
  role?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

const USER_ENDPOINTS = {
  fetchUsers: '/admin/users',
  updateStatus: '/admin/users/block/',
};

export const fetchUsers = async (params: FetchUsersParams): Promise<{ users: User[]; totalCount: number; totalPages: number }> => {
  const response = await api.get(USER_ENDPOINTS.fetchUsers, { params });
  console.log("🚀 ~ fetchUsers ~ response:", response.data.data.data.data)
  const { data, totalCount, totalPages } = response.data.data.data;
  const users = data.map((user: any) => ({
    ...user,
    status: user.isBlocked ? 'blocked' : 'active', // Map isBlocked to status
  })) as User[];
  return { users, totalCount, totalPages };
};

export const updateUserStatus = async (id: string, isBlocked: boolean): Promise<void> => {
  await api.patch(`${USER_ENDPOINTS.updateStatus}${id}`, { isBlocked });
};