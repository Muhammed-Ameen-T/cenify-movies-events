import api from "../../config/axios.config";
import { AUTH_MESSAGES } from "../../constants/auth.messages";
import { ADMIN_ENDPOINTS } from "../../constants/apiEndPoint"
import { handleAxiosError } from "../../utils/exios-error-handler";
import { AuthResponse } from "../../store/types/auth.type";
export const login = async (email: string,password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post(ADMIN_ENDPOINTS.login, { email,password });
      if (!response.data.success) {
        throw new Error(response.data.message || AUTH_MESSAGES.LOGIN_FAILED);
      }
  
      return response.data.data;
    } catch (error) {
      handleAxiosError(error, AUTH_MESSAGES.LOGIN_FAILED);
    }
};


// Common error handler
