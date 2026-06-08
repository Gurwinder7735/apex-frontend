import type { RootState } from "@/store";

export const selectClients = (state: RootState) => state.clients.items;
export const selectClientsMeta = (state: RootState) => ({
  total: state.clients.total,
  isLoading: state.clients.isLoading,
  error: state.clients.error,
});
export const selectClientsStats = (state: RootState) => state.clients.stats;
export const selectClientDetail = (state: RootState) => state.clients.detail;
export const selectClientContacts = (state: RootState) => state.clients.contacts;
export const selectClientActivities = (state: RootState) => state.clients.activities;
