import type { RootState } from "@/store";

export const selectUserProfile = (state: RootState) => state.user.users;
export const selectUsers = (state: RootState) => state.user.users;
export const selectUsersMeta = (state: RootState) => ({
  isLoading: state.user.isLoading,
  total: state.user.total,
  page: state.user.page,
  pageSize: state.user.pageSize,
});
