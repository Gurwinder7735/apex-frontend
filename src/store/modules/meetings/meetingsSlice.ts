import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Meeting, MeetingDetail, MeetingDecision, MeetingActionItem, MeetingStats } from "@/types/models/Meeting";
import type { MeetingsState, MeetingsQuery, MeetingCreatePayload, MeetingUpdatePayload } from "./meetingsTypes";

const initialState: MeetingsState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  stats: null,
  detail: null,
  decisions: [],
  actionItems: [],
  activities: [],
};

const meetingsSlice = createSlice({
  name: "meetings",
  initialState,
  reducers: {
    fetchMeetingsRequest: (state, _action: PayloadAction<MeetingsQuery>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchMeetingsSuccess: (state, action: PayloadAction<{ items: Meeting[]; total: number }>) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
    fetchMeetingsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createMeetingRequest: (_state, _action: PayloadAction<MeetingCreatePayload>) => {},
    createMeetingSuccess: (state, action: PayloadAction<Meeting>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    createMeetingFailure: (_state, _action: PayloadAction<string>) => {},
    updateMeetingRequest: (_state, _action: PayloadAction<MeetingUpdatePayload>) => {},
    updateMeetingSuccess: (state, action: PayloadAction<Meeting>) => {
      const idx = state.items.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.detail?.meeting.id === action.payload.id) {
        state.detail.meeting = action.payload;
      }
    },
    updateMeetingFailure: (_state, _action: PayloadAction<string>) => {},
    deleteMeetingRequest: (_state, _action: PayloadAction<string>) => {},
    deleteMeetingSuccess: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((m) => m.id !== action.payload);
      state.total -= 1;
    },
    deleteMeetingFailure: (_state, _action: PayloadAction<string>) => {},
    fetchMeetingDetailRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    fetchMeetingDetailSuccess: (state, action: PayloadAction<MeetingDetail>) => {
      state.isLoading = false;
      state.detail = action.payload;
      state.decisions = action.payload.decisions;
      state.actionItems = action.payload.actionItems;
      state.activities = action.payload.activities;
    },
    fetchMeetingDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addDecisionRequest: (_state, _action: PayloadAction<{ meetingId: string; decision: string }>) => {},
    addDecisionSuccess: (state, action: PayloadAction<MeetingDecision>) => {
      state.decisions.unshift(action.payload);
      if (state.detail) state.detail.decisions.unshift(action.payload);
    },
    removeDecisionRequest: (_state, _action: PayloadAction<{ meetingId: string; decisionId: string }>) => {},
    removeDecisionSuccess: (state, action: PayloadAction<string>) => {
      state.decisions = state.decisions.filter((d) => d.id !== action.payload);
    },
    createActionItemRequest: (_state, _action: PayloadAction<{ meetingId: string; title: string; owner?: string; dueDate?: string }>) => {},
    createActionItemSuccess: (state, action: PayloadAction<MeetingActionItem>) => {
      state.actionItems.unshift(action.payload);
      if (state.detail) state.detail.actionItems.unshift(action.payload);
    },
    updateActionItemRequest: (_state, _action: PayloadAction<{ meetingId: string; itemId: string; data: Partial<MeetingActionItem> }>) => {},
    updateActionItemSuccess: (state, action: PayloadAction<MeetingActionItem>) => {
      const idx = state.actionItems.findIndex((a) => a.id === action.payload.id);
      if (idx !== -1) state.actionItems[idx] = action.payload;
    },
    deleteActionItemRequest: (_state, _action: PayloadAction<{ meetingId: string; itemId: string }>) => {},
    deleteActionItemSuccess: (state, action: PayloadAction<string>) => {
      state.actionItems = state.actionItems.filter((a) => a.id !== action.payload);
    },
    fetchStatsRequest: (_state) => {},
    fetchStatsSuccess: (state, action: PayloadAction<MeetingStats>) => {
      state.stats = action.payload;
    },
    fetchStatsFailure: (_state, _action: PayloadAction<string>) => {},
    clearMeetingDetail: (state) => {
      state.detail = null;
      state.decisions = [];
      state.actionItems = [];
      state.activities = [];
    },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  fetchMeetingsRequest, fetchMeetingsSuccess, fetchMeetingsFailure,
  createMeetingRequest, createMeetingSuccess, createMeetingFailure,
  updateMeetingRequest, updateMeetingSuccess, updateMeetingFailure,
  deleteMeetingRequest, deleteMeetingSuccess, deleteMeetingFailure,
  fetchMeetingDetailRequest, fetchMeetingDetailSuccess, fetchMeetingDetailFailure,
  addDecisionRequest, addDecisionSuccess, removeDecisionRequest, removeDecisionSuccess,
  createActionItemRequest, createActionItemSuccess,
  updateActionItemRequest, updateActionItemSuccess,
  deleteActionItemRequest, deleteActionItemSuccess,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
  clearMeetingDetail, clearError,
} = meetingsSlice.actions;

export default meetingsSlice.reducer;
