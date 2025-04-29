import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User, AuthState } from '../types/auth.type';

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  role:null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
    },
    updateToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
    },
    clearAuth: (state) => {
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAuth, updateToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;   