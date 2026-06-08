import type { RootState } from "@/store";

export const selectLegal = (state: RootState) => state.legal.items;
export const selectLegalMeta = (state: RootState) => ({
  total: state.legal.total, isLoading: state.legal.isLoading, error: state.legal.error,
});
export const selectLegalStats = (state: RootState) => state.legal.stats;
export const selectLegalDetail = (state: RootState) => state.legal.detail;
export const selectLegalVersions = (state: RootState) => state.legal.versions;
export const selectLegalActivities = (state: RootState) => state.legal.activities;
