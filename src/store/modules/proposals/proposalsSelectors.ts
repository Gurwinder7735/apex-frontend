import type { RootState } from "@/store";

export const selectProposals = (state: RootState) => state.proposals.items;
export const selectProposalsMeta = (state: RootState) => ({
  total: state.proposals.total, isLoading: state.proposals.isLoading, error: state.proposals.error,
});
export const selectProposalsStats = (state: RootState) => state.proposals.stats;
export const selectProposalDetail = (state: RootState) => state.proposals.detail;
export const selectProposalVersions = (state: RootState) => state.proposals.versions;
export const selectProposalActivities = (state: RootState) => state.proposals.activities;
