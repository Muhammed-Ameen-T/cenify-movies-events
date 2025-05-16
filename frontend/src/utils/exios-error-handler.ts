import { AxiosError } from "axios";

export function handleAxiosError(error: unknown,  fallbackMessage: string): never {
  if (import.meta.env.VITE_DEV) {
    console.error("authApi error:", error);
  }

  // 🔹 Check if it's an AxiosError
  if (error instanceof AxiosError) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }

    // Handle network errors or unexpected Axios errors
    throw new Error(error.message || fallbackMessage);
  }

  // 🔹 Handle non-Axios errors gracefully
  throw new Error(fallbackMessage);
}
