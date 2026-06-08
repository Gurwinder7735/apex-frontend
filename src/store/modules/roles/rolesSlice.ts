import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Role, RolesState, RoleCreatePayload, RoleUpdatePayload } from "./rolesTypes";

const initialState: RolesState = {
  items: [],
  isLoading: false,
  error: null,
};

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    fetchRolesRequest: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchRolesSuccess: (state, action: PayloadAction<Role[]>) => {
      state.isLoading = false;
      state.items = action.payload;
    },
    fetchRolesFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createRoleRequest: (_state, _action: PayloadAction<RoleCreatePayload>) => {},
    createRoleSuccess: (state, action: PayloadAction<Role>) => {
      state.items.push(action.payload);
    },
    createRoleFailure: (_state, _action: PayloadAction<string>) => {},
    updateRoleRequest: (_state, _action: PayloadAction<RoleUpdatePayload>) => {},
    updateRoleSuccess: (state, action: PayloadAction<Role>) => {
      const idx = state.items.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
    updateRoleFailure: (_state, _action: PayloadAction<string>) => {},
    deleteRoleRequest: (_state, _action: PayloadAction<string>) => {},
    deleteRoleSuccess: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((r) => r.id !== action.payload);
    },
    deleteRoleFailure: (_state, _action: PayloadAction<string>) => {},
    clearRolesError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchRolesRequest, fetchRolesSuccess, fetchRolesFailure,
  createRoleRequest, createRoleSuccess, createRoleFailure,
  updateRoleRequest, updateRoleSuccess, updateRoleFailure,
  deleteRoleRequest, deleteRoleSuccess, deleteRoleFailure,
  clearRolesError,
} = rolesSlice.actions;

export default rolesSlice.reducer;
