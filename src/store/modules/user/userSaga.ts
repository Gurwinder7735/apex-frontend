import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { apiRequest } from "@/lib/api/axiosInstance";
import {
  fetchUsersFailure,
  fetchUsersRequest,
  fetchUsersSuccess,
  updateUserRolesFailure,
  updateUserRolesRequest,
  updateUserRolesSuccess,
  deleteUserFailure,
  deleteUserRequest,
  deleteUserSuccess,
} from "./userSlice";
import type { UsersQuery } from "./userTypes";
import type { User } from "@/types/models/User";
import type { ApiResponse } from "@/types/api.types";

const USERS_API = "/api/v1/users";

function* fetchUsersWorker(action: { type: string; payload: UsersQuery }) {
  try {
    const { page = 1, pageSize = 10, search } = action.payload;
    const params: Record<string, unknown> = { skip: (page - 1) * pageSize, limit: pageSize };
    if (search) {
      params.search = search;
    }
    const response: ApiResponse<User[]> = yield call(apiRequest, {
      url: USERS_API,
      method: "GET",
      params,
    });
    yield put(fetchUsersSuccess({ users: response.data, total: response.data.length }));
  } catch (error) {
    yield put(fetchUsersFailure());
    notification.error({ message: "Failed to fetch users" });
  }
}

function* updateUserRolesWorker(action: { type: string; payload: { userId: string; roles: string[] } }) {
  try {
    const { userId, roles } = action.payload;
    const response: ApiResponse<User> = yield call(apiRequest, {
      url: `${USERS_API}/${userId}/roles`,
      method: "PUT",
      data: { roles },
    });
    yield put(updateUserRolesSuccess(response.data));
    notification.success({ message: "Roles updated successfully" });
  } catch (error) {
    yield put(updateUserRolesFailure());
    notification.error({ message: "Failed to update roles" });
  }
}

function* deleteUserWorker(action: { type: string; payload: string }) {
  try {
    yield call(apiRequest, {
      url: `${USERS_API}/${action.payload}`,
      method: "DELETE",
    });
    yield put(deleteUserSuccess(action.payload));
    notification.success({ message: "User deleted successfully" });
  } catch (error) {
    yield put(deleteUserFailure());
    notification.error({ message: "Failed to delete user" });
  }
}

export function* userSaga() {
  yield takeLatest(fetchUsersRequest.type, fetchUsersWorker);
  yield takeLatest(updateUserRolesRequest.type, updateUserRolesWorker);
  yield takeLatest(deleteUserRequest.type, deleteUserWorker);
}
