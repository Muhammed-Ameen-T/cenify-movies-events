// src/services/User/authApi.ts
import api from '../../config/axios.config';
import { AUTH_MESSAGES, ERROR_MESSAGES } from '../../constants/auth.messages';
import { USER_AUTH_ENDPOINTS, USER_ENDPOINTS, VENDOR_ENDPOINTS } from '../../constants/apiEndPoint';
import { handleAxiosError } from '../../utils/exios-error-handler';
import { UserProfile, UserResponseDTO, WalletData } from '../../types';
import axios from 'axios';
import { Transaction, Wallet } from '../../types/user';

interface UpdateProfileData {
 name?: string;
 phone?: string | null;
 profileImage?: string | null;
 dob?: string | null;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export const updateProfile = async (data: UpdateProfileData): Promise<UserProfile> => {
  try {
    const response = await api.patch(USER_AUTH_ENDPOINTS.updateProfile, data);
    if (!response.data?.success) {
      throw new Error(response.data?.message || AUTH_MESSAGES.PROFILE_UPDATE_FAILED);
    }
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, AUTH_MESSAGES.PROFILE_UPDATE_FAILED);
  }
};

export const getCurrentUser = async (): Promise<UserProfile> => {
  try {
    const response = await api.get(USER_AUTH_ENDPOINTS.getUser);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, AUTH_MESSAGES.FETCH_USER_FAILED);
  }
};

export const getUserWallet = async (): Promise<WalletData> => {
  try {
    const response = await api.get(USER_AUTH_ENDPOINTS.getUserWallet);
    return response.data.data.wallet;
  } catch (error) {
    handleAxiosError(error, AUTH_MESSAGES.FETCH_USER_FAILED);
  }
};

export const getUserContent = async (): Promise<any> => {
  try {
    const response = await api.get(USER_AUTH_ENDPOINTS.getProfileContent);
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, AUTH_MESSAGES.FETCH_USER_FAILED);
  }
};

export const changePassword = async (data: ChangePasswordRequest): Promise<UserResponseDTO> => {
  try {
    const response = await api.put(USER_AUTH_ENDPOINTS.changePassword, data);
    return response.data.data.userResponse; 
  } catch (error) {
    throw handleAxiosError(error, ERROR_MESSAGES.FAILED_CHANGING_PASSWORD);
  }
};

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'olx-clone1');
  try {
    const response = await axios.post(VENDOR_ENDPOINTS.imageUpload, formData);
    if (!response.data.secure_url) {
    throw new Error('Image upload failed');
  }
  return response.data.secure_url;
  } catch (error:unknown) {
    throw new Error(String(error));
  }
};

export interface WalletTransactionsResponse {
  transactions: Transaction[];
  total: number;
  creditCount: number;
  debitCount: number;
  totalCredit: number;
  totalDebit: number;
}

export const getUserWalletTransactions = async ({
  page,
  limit,
  filter,
}: {
  page: number;
  limit: number;
  filter: 'all' | 'credit' | 'debit';
}): Promise<WalletTransactionsResponse> => {
  try {
    const response = await api.get(USER_ENDPOINTS.getUserWalletTransactions, {
      params: { page, limit, filter },
    });
    return response.data.data;  
  } catch (error) {
    handleAxiosError(error, ERROR_MESSAGES.FETCH_WALLET_TRANSACTIONS_FAILED);
  }
};

export const redeemPoints = async (amount:number): Promise<Wallet> => {
  try {
    const response = await api.put(USER_ENDPOINTS.redeemPoints, {amount});
    return response.data.data;  
  } catch (error) {
    handleAxiosError(error, ERROR_MESSAGES.FETCH_WALLET_TRANSACTIONS_FAILED);
  }
};


export const sendOtpPhone = async (phone: string): Promise<void> => {
  try {
    const response = await api.post(USER_ENDPOINTS.sendOtpPhone, { phone });
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to send OTP');
    }
  } catch (error) {
    handleAxiosError(error, 'Failed to send OTP');
  }
};

export const verifyOtpPhone = async (phone: string, otp: string): Promise<void> => {
  try {
    const response = await api.post(USER_ENDPOINTS.verifyOtpPhone, { phone, otp });
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Invalid OTP');
    }
  } catch (error) {
    handleAxiosError(error, 'Invalid OTP');
  }
};