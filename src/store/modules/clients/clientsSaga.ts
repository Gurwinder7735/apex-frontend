import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/axiosInstance";
import type { ApiResponse } from "@/types/api.types";
import type { Client, ClientDetail, Contact, ClientStats, Activity } from "@/types/models/Client";
import {
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
} from "./clientsSlice";
import type { ClientsQuery, ClientCreatePayload, ClientUpdatePayload, ContactCreatePayload, ContactUpdatePayload } from "./clientsTypes";

function* fetchClientsWorker(action: { type: string; payload: ClientsQuery }) {
  try {
    const response: { data: Client[]; total?: number } = yield call(apiRequest, {
      url: API_ENDPOINTS.clients.list,
      method: "GET",
      params: action.payload,
    });
    const items = Array.isArray(response) ? response : response.data ?? [];
    yield put(fetchClientsSuccess({ items, total: items.length }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch clients";
    yield put(fetchClientsFailure(message));
  }
}

function* createClientWorker(action: { type: string; payload: ClientCreatePayload }) {
  try {
    const response: ApiResponse<Client> = yield call(apiRequest, {
      url: API_ENDPOINTS.clients.create,
      method: "POST",
      data: action.payload,
    });
    yield put(createClientSuccess(response.data));
    notification.success({ message: "Client created", description: `${response.data.companyName} has been added.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to create client";
    yield put(createClientFailure(message));
    notification.error({ message: "Create failed", description: message });
  }
}

function* updateClientWorker(action: { type: string; payload: ClientUpdatePayload }) {
  try {
    const response: ApiResponse<Client> = yield call(apiRequest, {
      url: API_ENDPOINTS.clients.update(action.payload.id),
      method: "PUT",
      data: action.payload.data,
    });
    yield put(updateClientSuccess(response.data));
    notification.success({ message: "Client updated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update client";
    yield put(updateClientFailure(message));
    notification.error({ message: "Update failed", description: message });
  }
}

function* deleteClientWorker(action: { type: string; payload: string }) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.clients.delete(action.payload),
      method: "DELETE",
    });
    yield put(deleteClientSuccess(action.payload));
    notification.success({ message: "Client removed" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete client";
    yield put(deleteClientFailure(message));
    notification.error({ message: "Delete failed", description: message });
  }
}

function* fetchClientDetailWorker(action: { type: string; payload: string }) {
  try {
    const response: ApiResponse<ClientDetail> = yield call(apiRequest, {
      url: API_ENDPOINTS.clients.detail(action.payload),
      method: "GET",
    });
    yield put(fetchClientDetailSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch client details";
    yield put(fetchClientDetailFailure(message));
  }
}

function* addContactWorker(action: { type: string; payload: ContactCreatePayload }) {
  try {
    const response: ApiResponse<Contact> = yield call(apiRequest, {
      url: API_ENDPOINTS.clients.addContact(action.payload.clientId),
      method: "POST",
      data: { fullName: action.payload.fullName, designation: action.payload.designation, email: action.payload.email, phone: action.payload.phone, linkedinProfile: action.payload.linkedinProfile, notes: action.payload.notes, isPrimary: action.payload.isPrimary },
    });
    yield put(addContactSuccess(response.data));
    notification.success({ message: "Contact added" });
  } catch (error) {
    notification.error({ message: "Failed to add contact", description: error instanceof Error ? error.message : "" });
  }
}

function* updateContactWorker(action: { type: string; payload: ContactUpdatePayload }) {
  try {
    const response: ApiResponse<Contact> = yield call(apiRequest, {
      url: API_ENDPOINTS.clients.updateContact(action.payload.clientId, action.payload.contactId),
      method: "PUT",
      data: action.payload.data,
    });
    yield put(updateContactSuccess(response.data));
    notification.success({ message: "Contact updated" });
  } catch (error) {
    notification.error({ message: "Failed to update contact", description: error instanceof Error ? error.message : "" });
  }
}

function* removeContactWorker(action: { type: string; payload: { clientId: string; contactId: string } }) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.clients.removeContact(action.payload.clientId, action.payload.contactId),
      method: "DELETE",
    });
    yield put(removeContactSuccess(action.payload.contactId));
    notification.success({ message: "Contact removed" });
  } catch (error) {
    notification.error({ message: "Failed to remove contact", description: error instanceof Error ? error.message : "" });
  }
}

function* fetchStatsWorker() {
  try {
    const response: ApiResponse<ClientStats> = yield call(apiRequest, {
      url: API_ENDPOINTS.clients.stats,
      method: "GET",
    });
    yield put(fetchStatsSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    yield put(fetchStatsFailure(message));
  }
}

export function* clientsSaga() {
  yield takeLatest(fetchClientsRequest.type, fetchClientsWorker);
  yield takeLatest(createClientRequest.type, createClientWorker);
  yield takeLatest(updateClientRequest.type, updateClientWorker);
  yield takeLatest(deleteClientRequest.type, deleteClientWorker);
  yield takeLatest(fetchClientDetailRequest.type, fetchClientDetailWorker);
  yield takeLatest(addContactRequest.type, addContactWorker);
  yield takeLatest(updateContactRequest.type, updateContactWorker);
  yield takeLatest(removeContactRequest.type, removeContactWorker);
  yield takeLatest(fetchStatsRequest.type, fetchStatsWorker);
}
