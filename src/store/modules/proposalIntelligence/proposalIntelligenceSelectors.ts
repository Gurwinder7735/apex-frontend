import type { RootState } from "@/store/index";
import type { ProposalIntelligenceState } from "./proposalIntelligenceTypes";

export const selectProposalIntelligence = (state: RootState): ProposalIntelligenceState => state.proposalIntelligence;
export const selectJobs = (state: RootState) => selectProposalIntelligence(state).jobs;
export const selectCurrentJob = (state: RootState) => selectProposalIntelligence(state).currentJob;
export const selectAgentRuns = (state: RootState) => selectProposalIntelligence(state).currentAgentRuns;
export const selectAgentStream = (state: RootState) => selectProposalIntelligence(state).agentStream;
export const selectIsGenerating = (state: RootState) => selectProposalIntelligence(state).isGenerating;
