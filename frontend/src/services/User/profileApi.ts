// src/services/User/authApi.ts
import api from '../../config/axios.config';
import { AUTH_MESSAGES } from '../../constants/auth.messages';
import { USER_AUTH_ENDPOINTS, VENDOR_ENDPOINTS } from '../../constants/apiEndPoint';
import { handleAxiosError } from '../../utils/exios-error-handler';
import { UserProfile } from '../../types';
import axios from 'axios';

interface UpdateProfileData {
 name?: string;
 phone?: string | null;
 profileImage?: string | null;
 dob?: string | null;
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
        throw error;
    }
};

export const getCurrentUser = async (): Promise<UserProfile> => {
    try {
        const response = await api.get(USER_AUTH_ENDPOINTS.getUser);
        return response.data.data;
    } catch (error) {
        handleAxiosError(error, AUTH_MESSAGES.FETCH_USER_FAILED);
        throw error;
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
    } catch (error) {
        throw new Error('Failed to upload image to Cloudinary');
    }
};