import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Client, ClientDetail, Contact, Activity } from "@/types/models/Client";
import type { ClientsState, ClientsQuery, ClientCreatePayload, ClientUpdatePayload, ContactCreatePayload, ContactUpdatePayload } from "./clientsTypes";

const initialState: ClientsState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  stats: null,
  detail: null,
  contacts: [],
  activities: [],
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    fetchClientsRequest: (state, _action: PayloadAction<ClientsQuery>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchClientsSuccess: (state, action: PayloadAction<{ items: Client[]; total: number }>) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
    fetchClientsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createClientRequest: (_state, _action: PayloadAction<ClientCreatePayload>) => {},
    createClientSuccess: (state, action: PayloadAction<Client>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    createClientFailure: (_state, _action: PayloadAction<string>) => {},
    updateClientRequest: (_state, _action: PayloadAction<ClientUpdatePayload>) => {},
    updateClientSuccess: (state, action: PayloadAction<Client>) => {
      const idx = state.items.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.detail?.client.id === action.payload.id) {
        state.detail.client = action.payload;
      }
    },
    updateClientFailure: (_state, _action: PayloadAction<string>) => {},
    deleteClientRequest: (_state, _action: PayloadAction<string>) => {},
    deleteClientSuccess: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((c) => c.id !== action.payload);
      state.total -= 1;
    },
    deleteClientFailure: (_state, _action: PayloadAction<string>) => {},
    fetchClientDetailRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    fetchClientDetailSuccess: (state, action: PayloadAction<ClientDetail>) => {
      state.isLoading = false;
      state.detail = action.payload;
      state.contacts = action.payload.contacts;
      state.activities = action.payload.activities;
    },
    fetchClientDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addContactRequest: (_state, _action: PayloadAction<ContactCreatePayload>) => {},
    addContactSuccess: (state, action: PayloadAction<Contact>) => {
      state.contacts.push(action.payload);
      if (state.detail) state.detail.contacts.push(action.payload);
    },
    updateContactRequest: (_state, _action: PayloadAction<ContactUpdatePayload>) => {},
    updateContactSuccess: (state, action: PayloadAction<Contact>) => {
      const idx = state.contacts.findIndex((c) => c.id === action.payload.id);
      if (idx !== -1) state.contacts[idx] = action.payload;
    },
    removeContactRequest: (_state, _action: PayloadAction<{ clientId: string; contactId: string }>) => {},
    removeContactSuccess: (state, action: PayloadAction<string>) => {
      state.contacts = state.contacts.filter((c) => c.id !== action.payload);
      if (state.detail) state.detail.contacts = state.contacts;
    },
    fetchStatsRequest: (_state) => {},
    fetchStatsSuccess: (state, action: PayloadAction<ClientsState["stats"]>) => {
      state.stats = action.payload;
    },
    fetchStatsFailure: (_state, _action: PayloadAction<string>) => {},
    clearClientDetail: (state) => {
      state.detail = null;
      state.contacts = [];
      state.activities = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  fetchClientsRequest,
  fetchClientsSuccess,
  fetchClientsFailure,
  createClientRequest,
  createClientSuccess,
  createClientFailure,
  updateClientRequest,
  updateClientSuccess,
  updateClientFailure,
  deleteClientRequest,
  deleteClientSuccess,
  deleteClientFailure,
  fetchClientDetailRequest,
  fetchClientDetailSuccess,
  fetchClientDetailFailure,
  addContactRequest,
  addContactSuccess,
  updateContactRequest,
  updateContactSuccess,
  removeContactRequest,
  removeContactSuccess,
  fetchStatsRequest,
  fetchStatsSuccess,
  fetchStatsFailure,
  clearClientDetail,
  clearError,
} = clientsSlice.actions;

export default clientsSlice.reducer;
