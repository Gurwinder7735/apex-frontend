import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/axiosInstance";
import type { ApiResponse } from "@/types/api.types";
import type { Meeting, MeetingDetail, MeetingStats, MeetingDecision, MeetingActionItem } from "@/types/models/Meeting";
import {
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
} from "./meetingsSlice";
import type { MeetingsQuery, MeetingCreatePayload, MeetingUpdatePayload } from "./meetingsTypes";

function* fetchMeetingsWorker(action: { type: string; payload: MeetingsQuery }) {
  try {
    const response: { data: Meeting[]; total?: number } = yield call(apiRequest, {
      url: API_ENDPOINTS.meetings.list, method: "GET", params: action.payload,
    });
    const items = Array.isArray(response) ? response : response.data ?? [];
    yield put(fetchMeetingsSuccess({ items, total: items.length }));
  } catch (error) {
    yield put(fetchMeetingsFailure(error instanceof Error ? error.message : "Failed to fetch meetings"));
  }
}

function* createMeetingWorker(action: { type: string; payload: MeetingCreatePayload }) {
  try {
    const response: ApiResponse<Meeting> = yield call(apiRequest, {
      url: API_ENDPOINTS.meetings.create, method: "POST", data: action.payload,
    });
    yield put(createMeetingSuccess(response.data));
    notification.success({ message: "Meeting created" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create meeting";
    yield put(createMeetingFailure(msg));
    notification.error({ message: "Create failed", description: msg });
  }
}

function* updateMeetingWorker(action: { type: string; payload: MeetingUpdatePayload }) {
  try {
    const response: ApiResponse<Meeting> = yield call(apiRequest, {
      url: API_ENDPOINTS.meetings.update(action.payload.id), method: "PUT", data: action.payload.data,
    });
    yield put(updateMeetingSuccess(response.data));
    notification.success({ message: "Meeting updated" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update meeting";
    yield put(updateMeetingFailure(msg));
    notification.error({ message: "Update failed", description: msg });
  }
}

function* deleteMeetingWorker(action: { type: string; payload: string }) {
  try {
    yield call(apiRequest, { url: API_ENDPOINTS.meetings.delete(action.payload), method: "DELETE" });
    yield put(deleteMeetingSuccess(action.payload));
    notification.success({ message: "Meeting deleted" });
  } catch (error) {
    yield put(deleteMeetingFailure(error instanceof Error ? error.message : "Delete failed"));
  }
}

function* fetchMeetingDetailWorker(action: { type: string; payload: string }) {
  try {
    const response: ApiResponse<MeetingDetail> = yield call(apiRequest, {
      url: API_ENDPOINTS.meetings.detail(action.payload), method: "GET",
    });
    yield put(fetchMeetingDetailSuccess(response.data));
  } catch (error) {
    yield put(fetchMeetingDetailFailure(error instanceof Error ? error.message : "Failed to fetch details"));
  }
}

function* addDecisionWorker(action: { type: string; payload: { meetingId: string; decision: string } }) {
  try {
    const response: ApiResponse<MeetingDecision> = yield call(apiRequest, {
      url: API_ENDPOINTS.meetings.addDecision(action.payload.meetingId), method: "POST",
      data: { decision: action.payload.decision },
    });
    yield put(addDecisionSuccess(response.data));
    notification.success({ message: "Decision added" });
  } catch (error) {
    notification.error({ message: "Failed to add decision", description: error instanceof Error ? error.message : "" });
  }
}

function* removeDecisionWorker(action: { type: string; payload: { meetingId: string; decisionId: string } }) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.meetings.removeDecision(action.payload.meetingId, action.payload.decisionId), method: "DELETE",
    });
    yield put(removeDecisionSuccess(action.payload.decisionId));
  } catch (error) {
    notification.error({ message: "Failed to remove decision" });
  }
}

function* createActionItemWorker(action: { type: string; payload: { meetingId: string; title: string; owner?: string; dueDate?: string } }) {
  try {
    const response: ApiResponse<MeetingActionItem> = yield call(apiRequest, {
      url: API_ENDPOINTS.meetings.createActionItem(action.payload.meetingId), method: "POST",
      data: { title: action.payload.title, owner: action.payload.owner, due_date: action.payload.dueDate },
    });
    yield put(createActionItemSuccess(response.data));
    notification.success({ message: "Action item created" });
  } catch (error) {
    notification.error({ message: "Failed to create action item", description: error instanceof Error ? error.message : "" });
  }
}

function* updateActionItemWorker(action: { type: string; payload: { meetingId: string; itemId: string; data: Partial<MeetingActionItem> } }) {
  try {
    const response: ApiResponse<MeetingActionItem> = yield call(apiRequest, {
      url: API_ENDPOINTS.meetings.updateActionItem(action.payload.meetingId, action.payload.itemId), method: "PUT",
      data: action.payload.data,
    });
    yield put(updateActionItemSuccess(response.data));
    notification.success({ message: "Action item updated" });
  } catch (error) {
    notification.error({ message: "Failed to update action item", description: error instanceof Error ? error.message : "" });
  }
}

function* deleteActionItemWorker(action: { type: string; payload: { meetingId: string; itemId: string } }) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.meetings.deleteActionItem(action.payload.meetingId, action.payload.itemId), method: "DELETE",
    });
    yield put(deleteActionItemSuccess(action.payload.itemId));
    notification.success({ message: "Action item removed" });
  } catch (error) {
    notification.error({ message: "Failed to remove action item" });
  }
}

function* fetchStatsWorker() {
  try {
    const response: ApiResponse<MeetingStats> = yield call(apiRequest, {
      url: API_ENDPOINTS.meetings.stats, method: "GET",
    });
    yield put(fetchStatsSuccess(response.data));
  } catch (error) {
    yield put(fetchStatsFailure(error instanceof Error ? error.message : "Failed to fetch stats"));
  }
}

export function* meetingsSaga() {
  yield takeLatest(fetchMeetingsRequest.type, fetchMeetingsWorker);
  yield takeLatest(createMeetingRequest.type, createMeetingWorker);
  yield takeLatest(updateMeetingRequest.type, updateMeetingWorker);
  yield takeLatest(deleteMeetingRequest.type, deleteMeetingWorker);
  yield takeLatest(fetchMeetingDetailRequest.type, fetchMeetingDetailWorker);
  yield takeLatest(addDecisionRequest.type, addDecisionWorker);
  yield takeLatest(removeDecisionRequest.type, removeDecisionWorker);
  yield takeLatest(createActionItemRequest.type, createActionItemWorker);
  yield takeLatest(updateActionItemRequest.type, updateActionItemWorker);
  yield takeLatest(deleteActionItemRequest.type, deleteActionItemWorker);
  yield takeLatest(fetchStatsRequest.type, fetchStatsWorker);
}
