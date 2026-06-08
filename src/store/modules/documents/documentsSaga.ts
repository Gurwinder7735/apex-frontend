import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/axiosInstance";
import type { ApiResponse } from "@/types/api.types";
import type { Document, DocumentDetail, DocumentStats, DocumentActivity } from "@/types/models/Document";
import {
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
} from "./documentsSlice";
import type { DocumentsQuery, DocumentCreatePayload } from "./documentsTypes";

function* fetchDocumentsWorker(action: { type: string; payload: DocumentsQuery }) {
  try {
    const response: { data: Document[]; total?: number } = yield call(apiRequest, {
      url: API_ENDPOINTS.documents.list,
      method: "GET",
      params: action.payload,
    });
    const items = Array.isArray(response) ? response : response.data ?? [];
    yield put(fetchDocumentsSuccess({ items, total: items.length }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch documents";
    yield put(fetchDocumentsFailure(message));
  }
}

function* uploadDocumentWorker(action: { type: string; payload: DocumentCreatePayload }) {
  try {
    const formData = new FormData();
    formData.append("file", action.payload.file);
    formData.append("name", action.payload.name);
    formData.append("category", action.payload.category);
    if (action.payload.description) formData.append("description", action.payload.description);
    if (action.payload.clientId) formData.append("client_id", action.payload.clientId);
    formData.append("tags", action.payload.tags);

    const response: ApiResponse<Document> = yield call(apiRequest, {
      url: API_ENDPOINTS.documents.upload,
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    yield put(uploadDocumentSuccess(response.data));
    notification.success({ message: "Document uploaded", description: `${response.data.name} has been uploaded.` });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upload document";
    yield put(uploadDocumentFailure(message));
    notification.error({ message: "Upload failed", description: message });
  }
}

function* updateDocumentWorker(action: { type: string; payload: { id: string; data: Partial<DocumentCreatePayload> } }) {
  try {
    const response: ApiResponse<Document> = yield call(apiRequest, {
      url: API_ENDPOINTS.documents.update(action.payload.id),
      method: "PUT",
      data: action.payload.data,
    });
    yield put(updateDocumentSuccess(response.data));
    notification.success({ message: "Document updated" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update document";
    yield put(updateDocumentFailure(message));
    notification.error({ message: "Update failed", description: message });
  }
}

function* deleteDocumentWorker(action: { type: string; payload: string }) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.documents.delete(action.payload),
      method: "DELETE",
    });
    yield put(deleteDocumentSuccess(action.payload));
    notification.success({ message: "Document deleted" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to delete document";
    yield put(deleteDocumentFailure(message));
    notification.error({ message: "Delete failed", description: message });
  }
}

function* fetchDocumentDetailWorker(action: { type: string; payload: string }) {
  try {
    const response: ApiResponse<DocumentDetail> = yield call(apiRequest, {
      url: API_ENDPOINTS.documents.detail(action.payload),
      method: "GET",
    });
    yield put(fetchDocumentDetailSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch document details";
    yield put(fetchDocumentDetailFailure(message));
  }
}

function* replaceFileWorker(action: { type: string; payload: { id: string; file: File } }) {
  try {
    const formData = new FormData();
    formData.append("file", action.payload.file);
    const response: ApiResponse<Document> = yield call(apiRequest, {
      url: API_ENDPOINTS.documents.replaceFile(action.payload.id),
      method: "POST",
      data: formData,
      headers: { "Content-Type": "multipart/form-data" },
    });
    yield put(updateDocumentSuccess(response.data));
    notification.success({ message: "File replaced" });
  } catch (error) {
    notification.error({ message: "Replace failed", description: error instanceof Error ? error.message : "" });
  }
}

function* fetchStatsWorker() {
  try {
    const response: ApiResponse<DocumentStats> = yield call(apiRequest, {
      url: API_ENDPOINTS.documents.stats,
      method: "GET",
    });
    yield put(fetchStatsSuccess(response.data));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch stats";
    yield put(fetchStatsFailure(message));
  }
}

export function* documentsSaga() {
  yield takeLatest(fetchDocumentsRequest.type, fetchDocumentsWorker);
  yield takeLatest(uploadDocumentRequest.type, uploadDocumentWorker);
  yield takeLatest(updateDocumentRequest.type, updateDocumentWorker);
  yield takeLatest(deleteDocumentRequest.type, deleteDocumentWorker);
  yield takeLatest(fetchDocumentDetailRequest.type, fetchDocumentDetailWorker);
  yield takeLatest(replaceFileRequest.type, replaceFileWorker);
  yield takeLatest(fetchStatsRequest.type, fetchStatsWorker);
}
