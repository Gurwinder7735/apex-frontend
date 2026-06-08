import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Document, DocumentDetail, DocumentStats, DocumentActivity } from "@/types/models/Document";
import type { DocumentsState, DocumentsQuery, DocumentCreatePayload } from "./documentsTypes";

const initialState: DocumentsState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  stats: null,
  detail: null,
  activities: [],
};

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    fetchDocumentsRequest: (state, _action: PayloadAction<DocumentsQuery>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchDocumentsSuccess: (state, action: PayloadAction<{ items: Document[]; total: number }>) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
    fetchDocumentsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    uploadDocumentRequest: (_state, _action: PayloadAction<DocumentCreatePayload>) => {},
    uploadDocumentSuccess: (state, action: PayloadAction<Document>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    uploadDocumentFailure: (_state, _action: PayloadAction<string>) => {},
    updateDocumentRequest: (_state, _action: PayloadAction<{ id: string; data: Partial<DocumentCreatePayload> }>) => {},
    updateDocumentSuccess: (state, action: PayloadAction<Document>) => {
      const idx = state.items.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.detail?.document.id === action.payload.id) {
        state.detail.document = action.payload;
      }
    },
    updateDocumentFailure: (_state, _action: PayloadAction<string>) => {},
    deleteDocumentRequest: (_state, _action: PayloadAction<string>) => {},
    deleteDocumentSuccess: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((d) => d.id !== action.payload);
      state.total -= 1;
    },
    deleteDocumentFailure: (_state, _action: PayloadAction<string>) => {},
    fetchDocumentDetailRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    fetchDocumentDetailSuccess: (state, action: PayloadAction<DocumentDetail>) => {
      state.isLoading = false;
      state.detail = action.payload;
      state.activities = action.payload.activities;
    },
    fetchDocumentDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    replaceFileRequest: (_state, _action: PayloadAction<{ id: string; file: File }>) => {},
    fetchStatsRequest: (_state) => {},
    fetchStatsSuccess: (state, action: PayloadAction<DocumentStats>) => {
      state.stats = action.payload;
    },
    fetchStatsFailure: (_state, _action: PayloadAction<string>) => {},
    clearDocumentDetail: (state) => {
      state.detail = null;
      state.activities = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchDocumentsRequest,
  fetchDocumentsSuccess,
  fetchDocumentsFailure,
  uploadDocumentRequest,
  uploadDocumentSuccess,
  uploadDocumentFailure,
  updateDocumentRequest,
  updateDocumentSuccess,
  updateDocumentFailure,
  deleteDocumentRequest,
  deleteDocumentSuccess,
  deleteDocumentFailure,
  fetchDocumentDetailRequest,
  fetchDocumentDetailSuccess,
  fetchDocumentDetailFailure,
  replaceFileRequest,
  fetchStatsRequest,
  fetchStatsSuccess,
  fetchStatsFailure,
  clearDocumentDetail,
  clearError,
} = documentsSlice.actions;

export default documentsSlice.reducer;
