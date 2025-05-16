import api from "../../config/axios.config";
import { AUTH_MESSAGES } from "../../constants/auth.messages";
import { USER_AUTH_ENDPOINTS } from "../../constants/apiEndPoint"
import { AuthResponse } from "../../store/types/auth.type";
import { handleAxiosError } from "../../utils/exios-error-handler";
// export interface AuthResponse {
//   accessToken: string;
//   user: {
//     id: string;
//     name: string;
//     email: string;
//     phone: number;
//     profileImage: string | null;
//     role:string | null;
//   };
// }

export const sendOtp = async (email: string): Promise<void> => {
  try {
    const response = await api.post(USER_AUTH_ENDPOINTS.sendOtp, { email });

    if (response.data?.success !== true) {
      throw new Error(response.data?.message || AUTH_MESSAGES.OTP_FAILED);
    }
  } catch (error) {
    handleAxiosError(error, AUTH_MESSAGES.OTP_FAILED);
  }
};
export const getCurrentUser = async (): Promise<any> => {
  try {
    console.log("🚀 ~ getCurrentUser ~ response:")
    const response = await api.get(USER_AUTH_ENDPOINTS.getUser);
    console.log("🚀 ~ getCurrentUser ~ response:", response)
    return response.data.data;
  } catch (error) {
    console.log("Error fetching current user:", error);
    handleAxiosError(error, AUTH_MESSAGES.OTP_FAILED);
  }
};

export const verifyOtp = async (
  name:string,
  email: string,
  otp: string,
  password:string,
): Promise<AuthResponse> => {
  try {
    console.log(name,email,otp,password)
    const response = await api.post(USER_AUTH_ENDPOINTS.verifyOtp, {name, email, otp, password });

    if (!response.data.success) {
      throw new Error(response.data.message || AUTH_MESSAGES.OTP_FAILED);
    }

    return response.data.data;
  } catch (error) {
    handleAxiosError(error, AUTH_MESSAGES.INVALID_OTP);
  }
};

export const googleLogin = async (idToken: string): Promise<AuthResponse> => {
  try {
    const response = await api.post(USER_AUTH_ENDPOINTS.googleLogin, { idToken });

    if (!response.data.success) {
      throw new Error(response.data.message || AUTH_MESSAGES.LOGIN_FAILED);
    }

    return response.data.data;
  } catch (error) {
    handleAxiosError(error, AUTH_MESSAGES.LOGIN_FAILED);
  }
};

export const refreshToken = async (): Promise<{ accessToken: string }> => {
  try {
    const response = await api.post(USER_AUTH_ENDPOINTS.refreshToken);

    if (!response.data.success) {
      throw new Error(response.data.message || AUTH_MESSAGES.REFRESH_FAILED);
    }

    return response.data.data;
  } catch (error) {
    handleAxiosError(error, AUTH_MESSAGES.REFRESH_FAILED);
  }
};

export const login = async (email: string,password: string): Promise<AuthResponse> => {
  try {
    const response = await api.post(USER_AUTH_ENDPOINTS.login, { email,password });
    if (!response.data.success) {
      throw new Error(response.data.message || AUTH_MESSAGES.LOGIN_FAILED);
    }

    return response.data.data;
  } catch (error) {
    handleAxiosError(error, AUTH_MESSAGES.LOGIN_FAILED);
  }
};