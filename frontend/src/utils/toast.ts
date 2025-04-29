// src/utils/toast.ts
import { toast } from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  id?: string;
}

export const showSuccessToast = (message: string, options: ToastOptions = {}) => {
  toast.success(message, {
    duration: options.duration || 3000,
    id: options.id,
  });
};

export const showErrorToast = (message: string, options: ToastOptions = {}) => {
  toast.error(message, {
    duration: options.duration || 4000,
    id: options.id,
  });
};

export const showWarningToast = (message: string, options: ToastOptions = {}) => {
  toast(message, {
    duration: options.duration || 3500,
    id: options.id,
    icon: '⚠️',
  });
};