import type { RootState } from "@/store";

export const selectLeads = (state: RootState) => state.leads.items;
export const selectLeadsMeta = (state: RootState) => ({
  total: state.leads.total,
  isLoading: state.leads.isLoading,
  error: state.leads.error,
});
export const selectLeadsStats = (state: RootState) => state.leads.stats;
export const selectLeadDetail = (state: RootState) => state.leads.detail;
export const selectLeadActivities = (state: RootState) => state.leads.activities;
export const selectLeadMeetings = (state: RootState) => state.leads.meetings;
