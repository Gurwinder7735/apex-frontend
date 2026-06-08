import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { apiRequest } from "@/lib/api/axiosInstance";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
  fetchJobsRequest,
  fetchJobsSuccess,
  fetchJobsFailure,
  fetchJobDetailRequest,
  fetchJobDetailSuccess,
  fetchJobDetailFailure,
  fetchJobFileRequest,
} from "./proposalIntelligenceSlice";

function* fetchJobsWorker() {
  try {
    const response: { data: unknown } = yield call(apiRequest, {
      url: API_ENDPOINTS.proposalIntelligence.jobs,
      method: "GET",
    });
    yield put(fetchJobsSuccess((response as { data: unknown }).data as any));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch jobs";
    yield put(fetchJobsFailure(message));
  }
}

function* fetchJobDetailWorker(action: { type: string; payload: string }) {
  try {
    const response: { data: unknown } = yield call(apiRequest, {
      url: API_ENDPOINTS.proposalIntelligence.jobDetail(action.payload),
      method: "GET",
    });
    yield put(fetchJobDetailSuccess((response as { data: unknown }).data as any));
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch job detail";
    yield put(fetchJobDetailFailure(message));
  }
}

function* fetchJobFileWorker(action: { type: string; payload: { jobId: string; fileName: string } }) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.proposalIntelligence.jobFile(action.payload.jobId, action.payload.fileName),
      method: "GET",
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch file";
    notification.error({ message: "File fetch failed", description: message });
  }
}

export function* proposalIntelligenceSaga() {
  yield takeLatest(fetchJobsRequest.type, fetchJobsWorker);
  yield takeLatest(fetchJobDetailRequest.type, fetchJobDetailWorker);
  yield takeLatest(fetchJobFileRequest.type, fetchJobFileWorker);
}
