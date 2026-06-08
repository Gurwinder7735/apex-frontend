import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { ProposalIntelligenceState } from "./proposalIntelligenceTypes";
import type { ProposalJob, AgentRun } from "@/types/models/ProposalIntelligence";

const initialState: ProposalIntelligenceState = {
  jobs: [],
  currentJob: null,
  currentAgentRuns: [],
  agentStream: {},
  isGenerating: false,
  error: null,
};

const proposalIntelligenceSlice = createSlice({
  name: "proposalIntelligence",
  initialState,
  reducers: {
    fetchJobsRequest(state) {
      state.error = null;
    },
    fetchJobsSuccess(state, action: PayloadAction<ProposalJob[]>) {
      state.jobs = action.payload;
    },
    fetchJobsFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    fetchJobDetailRequest(state, _action: PayloadAction<string>) {
      state.error = null;
    },
    fetchJobDetailSuccess(state, action: PayloadAction<ProposalJob>) {
      state.currentJob = action.payload;
      state.currentAgentRuns = action.payload.agentRuns;
      state.agentStream = {};
    },
    fetchJobDetailFailure(state, action: PayloadAction<string>) {
      state.error = action.payload;
    },
    setGenerating(state, action: PayloadAction<boolean>) {
      state.isGenerating = action.payload;
    },
    setCurrentJob(state, action: PayloadAction<ProposalJob | null>) {
      state.currentJob = action.payload;
      state.currentAgentRuns = action.payload?.agentRuns ?? [];
    },
    updateAgentRun(state, action: PayloadAction<{ agentName: string; status: string; content?: string }>) {
      const { agentName, status, content } = action.payload;
      const run = state.currentAgentRuns.find((r) => r.agentName === agentName);
      if (run) {
        run.status = status as AgentRun["status"];
        if (content) run.content = content;
      }
    },
    appendAgentToken(state, action: PayloadAction<{ agentName: string; token: string }>) {
      const { agentName, token } = action.payload;
      state.agentStream[agentName] = (state.agentStream[agentName] || "") + token;
    },
    clearGeneration(state) {
      state.currentJob = null;
      state.currentAgentRuns = [];
      state.agentStream = {};
      state.isGenerating = false;
      state.error = null;
    },
    fetchJobFileRequest(state, _action: PayloadAction<{ jobId: string; fileName: string }>) {
      state.error = null;
    },
  },
});

export const {
  fetchJobsRequest,
  fetchJobsSuccess,
  fetchJobsFailure,
  fetchJobDetailRequest,
  fetchJobDetailSuccess,
  fetchJobDetailFailure,
  setGenerating,
  setCurrentJob,
  updateAgentRun,
  appendAgentToken,
  clearGeneration,
  fetchJobFileRequest,
} = proposalIntelligenceSlice.actions;

export default proposalIntelligenceSlice.reducer;
