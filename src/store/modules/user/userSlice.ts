import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/models/User";
import type { UserState, UsersQuery } from "./userTypes";

const initialState: UserState = {
  users: [],
  isLoading: false,
  total: 0,
  page: 1,
  pageSize: 10,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    fetchUsersRequest: (state, _action: PayloadAction<UsersQuery>) => {
      state.isLoading = true;
    },
    fetchUsersSuccess: (
      state,
      action: PayloadAction<{ users: User[]; total: number }>,
    ) => {
      state.isLoading = false;
      state.users = action.payload.users;
      state.total = action.payload.total;
    },
    fetchUsersFailure: (state) => {
      state.isLoading = false;
    },
    updateUserRolesRequest: (
      state,
      _action: PayloadAction<{ userId: string; roles: string[] }>,
    ) => {
      state.isLoading = true;
    },
    updateUserRolesSuccess: (state, action: PayloadAction<User>) => {
      state.isLoading = false;
      state.users = state.users.map((u) =>
        u.id === action.payload.id ? action.payload : u,
      );
    },
    updateUserRolesFailure: (state) => {
      state.isLoading = false;
    },
    deleteUserRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    deleteUserSuccess: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.users = state.users.filter((u) => u.id !== action.payload);
    },
    deleteUserFailure: (state) => {
      state.isLoading = false;
    },
  },
});

export const {
  fetchUsersRequest,
  fetchUsersSuccess,
  fetchUsersFailure,
  updateUserRolesRequest,
  updateUserRolesSuccess,
  updateUserRolesFailure,
  deleteUserRequest,
  deleteUserSuccess,
  deleteUserFailure,
} = userSlice.actions;

export default userSlice.reducer;
