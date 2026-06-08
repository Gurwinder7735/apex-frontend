import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AuthState, LoginPayload, RegisterPayload, TokenWithUser } from "./authTypes";
import type { User } from "@/types/models/User";

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginRequest: (state, _action: PayloadAction<LoginPayload>) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<TokenWithUser>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },
    registerRequest: (state, _action: PayloadAction<RegisterPayload>) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<TokenWithUser>) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.token = action.payload.accessToken;
      state.user = action.payload.user;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    logoutRequest: (state) => {
      state.isLoading = true;
    },
    logoutSuccess: () => initialState,
    logoutFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    hydrateAuth: (state, action: PayloadAction<{ token: string; user: User } | null>) => {
      if (action.payload) {
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      }
    },
    updateUserProfile: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  loginRequest,
  loginSuccess,
  loginFailure,
  registerRequest,
  registerSuccess,
  registerFailure,
  logoutRequest,
  logoutSuccess,
  logoutFailure,
  hydrateAuth,
  updateUserProfile,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
