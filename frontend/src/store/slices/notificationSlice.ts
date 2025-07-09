import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Notification } from '../../types';

interface NotificationState {
  currentNotification: Notification | null;
}

const initialState: NotificationState = {
  currentNotification: null,
};

const notificationSlice = createSlice({
  name: 'popupNotification',
  initialState,
  reducers: {
    showNotification(state, action: PayloadAction<Notification>) {
      state.currentNotification = action.payload;
    },
    clearNotification(state) {
      state.currentNotification = null;
    },
  },
});

export const { showNotification, clearNotification } = notificationSlice.actions;
export default notificationSlice.reducer;
