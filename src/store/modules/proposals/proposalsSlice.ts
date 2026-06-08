import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Proposal, ProposalDetail, ProposalVersion, ProposalActivity, ProposalStats } from "@/types/models/Proposal";
import type { ProposalsState, ProposalsQuery, ProposalCreatePayload, ProposalUpdatePayload } from "./proposalsTypes";

const initialState: ProposalsState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  stats: null,
  detail: null,
  versions: [],
  activities: [],
};

const proposalsSlice = createSlice({
  name: "proposals",
  initialState,
  reducers: {
    fetchProposalsRequest: (state, _action: PayloadAction<ProposalsQuery>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProposalsSuccess: (state, action: PayloadAction<{ items: Proposal[]; total: number }>) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
    fetchProposalsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createProposalRequest: (_state, _action: PayloadAction<ProposalCreatePayload>) => {},
    createProposalSuccess: (state, action: PayloadAction<Proposal>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    createProposalFailure: (_state, _action: PayloadAction<string>) => {},
    updateProposalRequest: (_state, _action: PayloadAction<ProposalUpdatePayload>) => {},
    updateProposalSuccess: (state, action: PayloadAction<Proposal>) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.detail?.proposal.id === action.payload.id) {
        state.detail.proposal = action.payload;
      }
    },
    updateProposalFailure: (_state, _action: PayloadAction<string>) => {},
    deleteProposalRequest: (_state, _action: PayloadAction<string>) => {},
    deleteProposalSuccess: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      state.total -= 1;
    },
    deleteProposalFailure: (_state, _action: PayloadAction<string>) => {},
    fetchProposalDetailRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    fetchProposalDetailSuccess: (state, action: PayloadAction<ProposalDetail>) => {
      state.isLoading = false;
      state.detail = action.payload;
      state.versions = action.payload.versions;
      state.activities = action.payload.activities;
    },
    fetchProposalDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    fetchStatsRequest: (_state) => {},
    fetchStatsSuccess: (state, action: PayloadAction<ProposalStats>) => {
      state.stats = action.payload;
    },
    fetchStatsFailure: (_state, _action: PayloadAction<string>) => {},
    clearProposalDetail: (state) => {
      state.detail = null;
      state.versions = [];
      state.activities = [];
    },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  fetchProposalsRequest, fetchProposalsSuccess, fetchProposalsFailure,
  createProposalRequest, createProposalSuccess, createProposalFailure,
  updateProposalRequest, updateProposalSuccess, updateProposalFailure,
  deleteProposalRequest, deleteProposalSuccess, deleteProposalFailure,
  fetchProposalDetailRequest, fetchProposalDetailSuccess, fetchProposalDetailFailure,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
  clearProposalDetail, clearError,
} = proposalsSlice.actions;

export default proposalsSlice.reducer;
