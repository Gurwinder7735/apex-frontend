import type { RootState } from "@/store";

export const selectMeetings = (state: RootState) => state.meetings.items;
export const selectMeetingsMeta = (state: RootState) => ({
  total: state.meetings.total, isLoading: state.meetings.isLoading, error: state.meetings.error,
});
export const selectMeetingsStats = (state: RootState) => state.meetings.stats;
export const selectMeetingDetail = (state: RootState) => state.meetings.detail;
export const selectMeetingDecisions = (state: RootState) => state.meetings.decisions;
export const selectMeetingActionItems = (state: RootState) => state.meetings.actionItems;
export const selectMeetingActivities = (state: RootState) => state.meetings.activities;
