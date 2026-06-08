import type { RootState } from "@/store";

export const selectDocuments = (state: RootState) => state.documents.items;
export const selectDocumentsMeta = (state: RootState) => ({
  total: state.documents.total,
  isLoading: state.documents.isLoading,
  error: state.documents.error,
});
export const selectDocumentsStats = (state: RootState) => state.documents.stats;
export const selectDocumentDetail = (state: RootState) => state.documents.detail;
export const selectDocumentActivities = (state: RootState) => state.documents.activities;
