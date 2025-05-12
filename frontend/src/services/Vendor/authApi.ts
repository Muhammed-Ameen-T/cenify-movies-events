import axios from "axios";
import {API_BASE_URL, VENDOR_ENDPOINTS,ADMIN_ENDPOINTS } from "../../constants/apiEndPoint";
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const registerVendor = async (data: {
  email: string;
}): Promise<{ id: string; email: string; accountType: string }> => {
  const response = await api.post(VENDOR_ENDPOINTS.resendOtp, data);
  return response.data;
};

export const verifyVendorOtp = async (data: {
  name: string;
  email: string;
  password: string; 
  phone?: string;
  accountType: "theater" | "event";
  otp: string;
}): Promise<{
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string; name: string; phone: number; profileImage: string; role: string };
}> => {
  const response = await api.post(VENDOR_ENDPOINTS.verifyOtp, data);
  return response.data.data;
};

export const resendVendorOtp = async (data: { email: string }): Promise<void> => {
  await api.post(VENDOR_ENDPOINTS.resendOtp, data);
};

// export const uploadToCloudinary = async (file: File): Promise<string> => {
//   const formData = new FormData();
//   formData.append("file", file);
//   formData.append("upload_preset", "olx-clone1");
//   const response = await axios.post(
//     VENDOR_ENDPOINTS.imageUpload,
//     formData
//   );
//   return response.data.secure_url;
// };


export const loginTheater = async (data: {
  email: string;
  password: string;
}): Promise<{ id: string; email: string; accountType: 'theater' | 'event' }> => {
  try {
    const response = await api.post(VENDOR_ENDPOINTS.login, data,{withCredentials:true});
    return response.data;
  } catch (error) {
    // Handle Axios errors
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.message || 'Login failed');
    }
    throw new Error('An unexpected error occurred');
  }
};

export const requestPasswordReset = async ({ email }: { email: string }) => {
  const response = await api.post(ADMIN_ENDPOINTS.forgotPassSendOtp, { email });
  return response.data;
};

export const verifyResetOtp = async ({ email, otp }: { email: string; otp: string }) => {
  const response = await api.post(ADMIN_ENDPOINTS.forgotPassVerifyOtp, { email, otp });
  return response.data;
};

export const updatePassword = async ({
  email,
  password,
  confirmPassword,
}: {
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await api.post(ADMIN_ENDPOINTS.forgotPassUpdate, {
    email,
    password,
    confirmPassword,
  });
  return response.data;
};


export default api; 