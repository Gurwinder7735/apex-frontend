import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/axiosInstance";
import type { ApiResponse } from "@/types/api.types";
import type { Proposal, ProposalDetail, ProposalStats } from "@/types/models/Proposal";
import {
  fetchProposalsRequest, fetchProposalsSuccess, fetchProposalsFailure,
  createProposalRequest, createProposalSuccess, createProposalFailure,
  updateProposalRequest, updateProposalSuccess, updateProposalFailure,
  deleteProposalRequest, deleteProposalSuccess, deleteProposalFailure,
  fetchProposalDetailRequest, fetchProposalDetailSuccess, fetchProposalDetailFailure,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
} from "./proposalsSlice";
import type { ProposalsQuery, ProposalCreatePayload, ProposalUpdatePayload } from "./proposalsTypes";

function* fetchProposalsWorker(action: { type: string; payload: ProposalsQuery }) {
  try {
    const response: { data: Proposal[]; total?: number } = yield call(apiRequest, {
      url: API_ENDPOINTS.proposals.list, method: "GET", params: action.payload,
    });
    const items = Array.isArray(response) ? response : response.data ?? [];
    yield put(fetchProposalsSuccess({ items, total: items.length }));
  } catch (error) {
    yield put(fetchProposalsFailure(error instanceof Error ? error.message : "Failed to fetch proposals"));
  }
}

function* createProposalWorker(action: { type: string; payload: ProposalCreatePayload }) {
  try {
    const response: ApiResponse<Proposal> = yield call(apiRequest, {
      url: API_ENDPOINTS.proposals.create, method: "POST", data: action.payload,
    });
    yield put(createProposalSuccess(response.data));
    notification.success({ message: "Proposal created" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create proposal";
    yield put(createProposalFailure(msg));
    notification.error({ message: "Create failed", description: msg });
  }
}

function* updateProposalWorker(action: { type: string; payload: ProposalUpdatePayload }) {
  try {
    const response: ApiResponse<Proposal> = yield call(apiRequest, {
      url: API_ENDPOINTS.proposals.update(action.payload.id), method: "PUT", data: action.payload.data,
    });
    yield put(updateProposalSuccess(response.data));
    notification.success({ message: "Proposal updated" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update proposal";
    yield put(updateProposalFailure(msg));
    notification.error({ message: "Update failed", description: msg });
  }
}

function* deleteProposalWorker(action: { type: string; payload: string }) {
  try {
    yield call(apiRequest, { url: API_ENDPOINTS.proposals.delete(action.payload), method: "DELETE" });
    yield put(deleteProposalSuccess(action.payload));
    notification.success({ message: "Proposal deleted" });
  } catch (error) {
    yield put(deleteProposalFailure(error instanceof Error ? error.message : "Delete failed"));
  }
}

function* fetchProposalDetailWorker(action: { type: string; payload: string }) {
  try {
    const response: ApiResponse<ProposalDetail> = yield call(apiRequest, {
      url: API_ENDPOINTS.proposals.detail(action.payload), method: "GET",
    });
    yield put(fetchProposalDetailSuccess(response.data));
  } catch (error) {
    yield put(fetchProposalDetailFailure(error instanceof Error ? error.message : "Failed to fetch details"));
  }
}

function* fetchStatsWorker() {
  try {
    const response: ApiResponse<ProposalStats> = yield call(apiRequest, {
      url: API_ENDPOINTS.proposals.stats, method: "GET",
    });
    yield put(fetchStatsSuccess(response.data));
  } catch (error) {
    yield put(fetchStatsFailure(error instanceof Error ? error.message : "Failed to fetch stats"));
  }
}

export function* proposalsSaga() {
  yield takeLatest(fetchProposalsRequest.type, fetchProposalsWorker);
  yield takeLatest(createProposalRequest.type, createProposalWorker);
  yield takeLatest(updateProposalRequest.type, updateProposalWorker);
  yield takeLatest(deleteProposalRequest.type, deleteProposalWorker);
  yield takeLatest(fetchProposalDetailRequest.type, fetchProposalDetailWorker);
  yield takeLatest(fetchStatsRequest.type, fetchStatsWorker);
}
