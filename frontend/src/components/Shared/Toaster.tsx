// src/components/Toast.tsx
import { Toaster } from 'react-hot-toast';

const Toast: React.FC = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        // Default styles for all toasts
        style: {
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          border: '1px solid',
          maxWidth: '400px',
        },
        // Success toast (green, for form submissions, OTP resend, etc.)
        success: {
          style: {
            background: '#f0fdf4',
            color: '#15803d',
            borderColor: '#4ade80',
          },
          iconTheme: {
            primary: '#15803d',
            secondary: '#f0fdf4',
          },
        },
        // Error toast (red, for API failures, validation errors)
        error: {
          style: {
            background: '#fef2f2',
            color: '#b91c1c',
            borderColor: '#f87171',
          },
          iconTheme: {
            primary: '#b91c1c',
            secondary: '#fef2f2',
          },
        },
        // Warning toast (yellow, for cautions or non-critical issues)
        warning: {
          style: {
            background: '#fefce8',
            color: '#a16207',
            borderColor: '#facc15',
          },
          iconTheme: {
            primary: '#a16207',
            secondary: '#fefce8',
          },
        },
      }}
    />
  );
};

export default Toast;