import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { apiRequest } from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { storage } from "@/lib/utils/storage";
import {
  loginFailure,
  loginRequest,
  loginSuccess,
  registerFailure,
  registerRequest,
  registerSuccess,
  logoutFailure,
  logoutRequest,
  logoutSuccess,
} from "./authSlice";
import type { LoginPayload, RegisterPayload, TokenWithUser } from "./authTypes";
import type { ApiResponse } from "@/types/api.types";

function setTokenCookie(token: string) {
  document.cookie = `access_token=${token}; path=/; max-age=604800; SameSite=Lax; Secure`;
}

function setRefreshTokenCookie(token: string) {
  document.cookie = `refresh_token=${token}; path=/; max-age=604800; SameSite=Lax; Secure`;
}

function clearTokenCookie() {
  document.cookie = "access_token=; path=/; max-age=0; SameSite=Lax";
  document.cookie = "refresh_token=; path=/; max-age=0; SameSite=Lax";
}

function* loginWorker(action: { type: string; payload: LoginPayload }) {
  try {
    const response: ApiResponse<TokenWithUser> = yield call(apiRequest, {
      url: API_ENDPOINTS.auth.login,
      method: "POST",
      data: action.payload,
      withCredentials: true,
    });
    const { accessToken, refreshToken, user } = response.data;
    storage.setAccessToken(accessToken);
    storage.setRefreshToken(refreshToken);
    setTokenCookie(accessToken);
    setRefreshTokenCookie(refreshToken);
    yield put(loginSuccess(response.data));
    notification.success({ message: "Login successful" });
  } catch (error: unknown) {
    const message =
      error instanceof Object && "response" in error
        ? String((error as { response: { data: { message: string } } }).response.data.message)
        : error instanceof Error
          ? error.message
          : "Login failed";
    yield put(loginFailure(message));
    notification.error({ message: "Login failed", description: message });
  }
}

function* registerWorker(action: { type: string; payload: RegisterPayload }) {
  try {
    const response: ApiResponse<TokenWithUser> = yield call(apiRequest, {
      url: API_ENDPOINTS.auth.register,
      method: "POST",
      data: action.payload,
      withCredentials: true,
    });
    const { accessToken, refreshToken, user } = response.data;
    storage.setAccessToken(accessToken);
    storage.setRefreshToken(refreshToken);
    setTokenCookie(accessToken);
    setRefreshTokenCookie(refreshToken);
    yield put(registerSuccess(response.data));
    notification.success({ message: "Account created successfully" });
  } catch (error: unknown) {
    const message =
      error instanceof Object && "response" in error
        ? String((error as { response: { data: { message: string } } }).response.data.message)
        : error instanceof Error
          ? error.message
          : "Registration failed";
    yield put(registerFailure(message));
    notification.error({ message: "Registration failed", description: message });
  }
}

function* logoutWorker() {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.auth.logout,
      method: "POST",
      withCredentials: true,
    });
    storage.clearAll();
    clearTokenCookie();
    yield put(logoutSuccess());
  } catch (_error) {
    storage.clearAll();
    clearTokenCookie();
    yield put(logoutSuccess());
  }
}

export function* authSaga() {
  yield takeLatest(loginRequest.type, loginWorker);
  yield takeLatest(registerRequest.type, registerWorker);
  yield takeLatest(logoutRequest.type, logoutWorker);
}
