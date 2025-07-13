// src/config/socket.config.ts
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000', {
  path: '/socket.io',
  withCredentials: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  console.log(`Socket connected: ${socket.id}`);
});

socket.on('connect_error', (error) => {
  console.error('Socket connect_error:', error.message, error);
});

socket.on('disconnect', (reason) => {
  console.log(`Socket disconnected: ${reason}`);
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

socket.onAny((event, ...args) => {
  console.log(`Received socket event: ${event}`, args);
});

export { socket };
// const api = axios.create({
//   baseURL: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api`,
//   withCredentials: true,
// });

// api.interceptors.request.use((config) => {
//   if (socket.id) {
//     config.headers['x-socket-id'] = socket.id;
//   }
//   return config;
// });
