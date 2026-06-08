import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/axiosInstance";
import type { ApiResponse } from "@/types/api.types";
import type { Role } from "./rolesTypes";
import {
  fetchRolesRequest, fetchRolesSuccess, fetchRolesFailure,
  createRoleRequest, createRoleSuccess, createRoleFailure,
  updateRoleRequest, updateRoleSuccess, updateRoleFailure,
  deleteRoleRequest, deleteRoleSuccess, deleteRoleFailure,
} from "./rolesSlice";
import type { RoleCreatePayload, RoleUpdatePayload } from "./rolesTypes";

function* fetchRolesWorker() {
  try {
    const response: ApiResponse<Role[]> = yield call(apiRequest, {
      url: API_ENDPOINTS.roles.list,
      method: "GET",
    });
    yield put(fetchRolesSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch roles";
    yield put(fetchRolesFailure(message));
  }
}

function* createRoleWorker(action: { type: string; payload: RoleCreatePayload }) {
  try {
    const response: ApiResponse<Role> = yield call(apiRequest, {
      url: API_ENDPOINTS.roles.create,
      method: "POST",
      data: action.payload,
    });
    yield put(createRoleSuccess(response.data));
    notification.success({ message: "Role created" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create role";
    yield put(createRoleFailure(message));
    notification.error({ message: "Create failed", description: message });
  }
}

function* updateRoleWorker(action: { type: string; payload: RoleUpdatePayload }) {
  try {
    const response: ApiResponse<Role> = yield call(apiRequest, {
      url: API_ENDPOINTS.roles.update(action.payload.id),
      method: "PUT",
      data: action.payload.data,
    });
    yield put(updateRoleSuccess(response.data));
    notification.success({ message: "Role updated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update role";
    yield put(updateRoleFailure(message));
    notification.error({ message: "Update failed", description: message });
  }
}

function* deleteRoleWorker(action: { type: string; payload: string }) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.roles.delete(action.payload),
      method: "DELETE",
    });
    yield put(deleteRoleSuccess(action.payload));
    notification.success({ message: "Role deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete role";
    yield put(deleteRoleFailure(message));
    notification.error({ message: "Delete failed", description: message });
  }
}

export function* rolesSaga() {
  yield takeLatest(fetchRolesRequest.type, fetchRolesWorker);
  yield takeLatest(createRoleRequest.type, createRoleWorker);
  yield takeLatest(updateRoleRequest.type, updateRoleWorker);
  yield takeLatest(deleteRoleRequest.type, deleteRoleWorker);
}
