import type { RootState } from "@/store";

export const selectProjects = (state: RootState) => state.projects.items;
export const selectProjectsMeta = (state: RootState) => ({
  total: state.projects.total, isLoading: state.projects.isLoading, error: state.projects.error,
});
export const selectProjectsStats = (state: RootState) => state.projects.stats;
export const selectProjectDetail = (state: RootState) => state.projects.detail;
export const selectProjectMilestones = (state: RootState) => state.projects.milestones;
export const selectProjectDeliverables = (state: RootState) => state.projects.deliverables;
export const selectProjectRisks = (state: RootState) => state.projects.risks;
export const selectProjectActivities = (state: RootState) => state.projects.activities;
