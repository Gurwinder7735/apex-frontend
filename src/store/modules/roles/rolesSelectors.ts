import type { RootState } from "@/store";

export const selectRoles = (state: RootState) => state.roles.items;
export const selectRolesMeta = (state: RootState) => ({
  isLoading: state.roles.isLoading,
  error: state.roles.error,
});
