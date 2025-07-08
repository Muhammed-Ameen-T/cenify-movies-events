import { USER_AUTH_ENDPOINTS } from "../../constants/apiEndPoint";
import api from "../../config/axios.config";
import { handleAxiosError } from "../../utils/exios-error-handler";
import { ERROR_MESSAGES } from "../../constants/auth.messages";

export const getUserMovies = async (params = { page: 1, limit: 8 }): Promise<any> => {
  try {
    const response = await api.get(USER_AUTH_ENDPOINTS.userMovies, { params });
    return response.data.data;
  } catch (error) {
    handleAxiosError(error, ERROR_MESSAGES.FETCH_USER_MOVIES_FAILED);
    return null;
  }
};

