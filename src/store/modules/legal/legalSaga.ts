import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/axiosInstance";
import type { ApiResponse } from "@/types/api.types";
import type { LegalDocument, LegalDetail, LegalStats } from "@/types/models/Legal";
import {
  fetchLegalRequest, fetchLegalSuccess, fetchLegalFailure,
  createLegalRequest, createLegalSuccess, createLegalFailure,
  updateLegalRequest, updateLegalSuccess, updateLegalFailure,
  deleteLegalRequest, deleteLegalSuccess, deleteLegalFailure,
  fetchLegalDetailRequest, fetchLegalDetailSuccess, fetchLegalDetailFailure,
  uploadLegalVersionRequest, uploadLegalVersionSuccess, uploadLegalVersionFailure,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
} from "./legalSlice";
import type { LegalQuery, LegalCreatePayload, LegalUpdatePayload } from "./legalTypes";


function* fetchLegalWorker(action: { type: string; payload: LegalQuery }) {
  try {
    const response: { data: LegalDocument[]; total?: number } = yield call(apiRequest, {
      url: API_ENDPOINTS.legal.list, method: "GET", params: action.payload,
    });
    const items = Array.isArray(response) ? response : response.data ?? [];
    yield put(fetchLegalSuccess({ items, total: items.length }));
  } catch (error) {
    yield put(fetchLegalFailure(error instanceof Error ? error.message : "Failed to fetch legal documents"));
  }
}

function* createLegalWorker(action: { type: string; payload: LegalCreatePayload }) {
  try {
    const formData = new FormData();
    formData.append("name", action.payload.name);
    if (action.payload.clientId) formData.append("client_id", action.payload.clientId);
    if (action.payload.proposalId) formData.append("proposal_id", action.payload.proposalId);
    if (action.payload.documentType) formData.append("document_type", action.payload.documentType);
    if (action.payload.status) formData.append("status", action.payload.status);
    if (action.payload.sentDate) formData.append("sent_date", action.payload.sentDate);
    if (action.payload.signedDate) formData.append("signed_date", action.payload.signedDate);
    if (action.payload.expiryDate) formData.append("expiry_date", action.payload.expiryDate);
    if (action.payload.file) formData.append("file", action.payload.file);

    const response: ApiResponse<LegalDocument> = yield call(apiRequest, {
      url: API_ENDPOINTS.legal.create,
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    yield put(createLegalSuccess(response.data));
    notification.success({ message: "Legal document created" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create legal document";
    yield put(createLegalFailure(msg));
    notification.error({ message: "Create failed", description: msg });
  }
}

function* updateLegalWorker(action: { type: string; payload: LegalUpdatePayload }) {
  try {
    const response: ApiResponse<LegalDocument> = yield call(apiRequest, {
      url: API_ENDPOINTS.legal.update(action.payload.id), method: "PUT", data: action.payload.data,
    });
    yield put(updateLegalSuccess(response.data));
    notification.success({ message: "Legal document updated" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update legal document";
    yield put(updateLegalFailure(msg));
    notification.error({ message: "Update failed", description: msg });
  }
}

function* deleteLegalWorker(action: { type: string; payload: string }) {
  try {
    yield call(apiRequest, { url: API_ENDPOINTS.legal.delete(action.payload), method: "DELETE" });
    yield put(deleteLegalSuccess(action.payload));
    notification.success({ message: "Legal document deleted" });
  } catch (error) {
    yield put(deleteLegalFailure(error instanceof Error ? error.message : "Delete failed"));
  }
}

function* fetchLegalDetailWorker(action: { type: string; payload: string }) {
  try {
    const response: ApiResponse<LegalDetail> = yield call(apiRequest, {
      url: API_ENDPOINTS.legal.detail(action.payload), method: "GET",
    });
    yield put(fetchLegalDetailSuccess(response.data));
  } catch (error) {
    yield put(fetchLegalDetailFailure(error instanceof Error ? error.message : "Failed to fetch details"));
  }
}

function* uploadVersionWorker(action: { type: string; payload: { legalId: string; file: File; notes?: string } }) {
  try {
    const formData = new FormData();
    formData.append("file", action.payload.file);
    if (action.payload.notes) formData.append("notes", action.payload.notes);

    const response: ApiResponse<LegalDocument> = yield call(apiRequest, {
      url: API_ENDPOINTS.legal.uploadVersion(action.payload.legalId),
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    yield put(uploadLegalVersionSuccess(response.data));
    notification.success({ message: "New version uploaded" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to upload version";
    yield put(uploadLegalVersionFailure(msg));
    notification.error({ message: "Upload failed", description: msg });
  }
}

function* fetchStatsWorker() {
  try {
    const response: ApiResponse<LegalStats> = yield call(apiRequest, {
      url: API_ENDPOINTS.legal.stats, method: "GET",
    });
    yield put(fetchStatsSuccess(response.data));
  } catch (error) {
    yield put(fetchStatsFailure(error instanceof Error ? error.message : "Failed to fetch stats"));
  }
}

export function* legalSaga() {
  yield takeLatest(fetchLegalRequest.type, fetchLegalWorker);
  yield takeLatest(createLegalRequest.type, createLegalWorker);
  yield takeLatest(updateLegalRequest.type, updateLegalWorker);
  yield takeLatest(deleteLegalRequest.type, deleteLegalWorker);
  yield takeLatest(fetchLegalDetailRequest.type, fetchLegalDetailWorker);
  yield takeLatest(uploadLegalVersionRequest.type, uploadVersionWorker);
  yield takeLatest(fetchStatsRequest.type, fetchStatsWorker);
}
