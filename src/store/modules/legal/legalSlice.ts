import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { LegalDocument, LegalDetail, LegalVersion, LegalActivity, LegalStats } from "@/types/models/Legal";
import type { LegalState, LegalQuery, LegalCreatePayload, LegalUpdatePayload } from "./legalTypes";

const initialState: LegalState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  stats: null,
  detail: null,
  versions: [],
  activities: [],
};

const legalSlice = createSlice({
  name: "legal",
  initialState,
  reducers: {
    fetchLegalRequest: (state, _action: PayloadAction<LegalQuery>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchLegalSuccess: (state, action: PayloadAction<{ items: LegalDocument[]; total: number }>) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
    fetchLegalFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createLegalRequest: (_state, _action: PayloadAction<LegalCreatePayload>) => {},
    createLegalSuccess: (state, action: PayloadAction<LegalDocument>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    createLegalFailure: (_state, _action: PayloadAction<string>) => {},
    updateLegalRequest: (_state, _action: PayloadAction<LegalUpdatePayload>) => {},
    updateLegalSuccess: (state, action: PayloadAction<LegalDocument>) => {
      const idx = state.items.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.detail?.legal.id === action.payload.id) {
        state.detail.legal = action.payload;
      }
    },
    updateLegalFailure: (_state, _action: PayloadAction<string>) => {},
    deleteLegalRequest: (_state, _action: PayloadAction<string>) => {},
    deleteLegalSuccess: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((d) => d.id !== action.payload);
      state.total -= 1;
    },
    deleteLegalFailure: (_state, _action: PayloadAction<string>) => {},
    fetchLegalDetailRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    fetchLegalDetailSuccess: (state, action: PayloadAction<LegalDetail>) => {
      state.isLoading = false;
      state.detail = action.payload;
      state.versions = action.payload.versions;
      state.activities = action.payload.activities;
    },
    fetchLegalDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    uploadLegalVersionRequest: (_state, _action: PayloadAction<{ legalId: string; file: File; notes?: string }>) => {},
    uploadLegalVersionSuccess: (state, action: PayloadAction<LegalDocument>) => {
      if (state.detail?.legal.id === action.payload.id) {
        state.detail.legal = action.payload;
      }
    },
    uploadLegalVersionFailure: (_state, _action: PayloadAction<string>) => {},
    fetchStatsRequest: (_state) => {},
    fetchStatsSuccess: (state, action: PayloadAction<LegalStats>) => {
      state.stats = action.payload;
    },
    fetchStatsFailure: (_state, _action: PayloadAction<string>) => {},
    clearLegalDetail: (state) => {
      state.detail = null;
      state.versions = [];
      state.activities = [];
    },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  fetchLegalRequest, fetchLegalSuccess, fetchLegalFailure,
  createLegalRequest, createLegalSuccess, createLegalFailure,
  updateLegalRequest, updateLegalSuccess, updateLegalFailure,
  deleteLegalRequest, deleteLegalSuccess, deleteLegalFailure,
  fetchLegalDetailRequest, fetchLegalDetailSuccess, fetchLegalDetailFailure,
  uploadLegalVersionRequest, uploadLegalVersionSuccess, uploadLegalVersionFailure,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
  clearLegalDetail, clearError,
} = legalSlice.actions;

export default legalSlice.reducer;
