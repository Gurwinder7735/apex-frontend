import { call, put, takeLatest } from "redux-saga/effects";
import { notification } from "antd";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/axiosInstance";
import type { ApiResponse } from "@/types/api.types";
import type { Project, ProjectDetail, ProjectStats, ProjectMilestone, ProjectDeliverable, ProjectRisk } from "@/types/models/Project";
import {
  fetchProjectsRequest, fetchProjectsSuccess, fetchProjectsFailure,
  createProjectRequest, createProjectSuccess, createProjectFailure,
  updateProjectRequest, updateProjectSuccess, updateProjectFailure,
  deleteProjectRequest, deleteProjectSuccess, deleteProjectFailure,
  fetchProjectDetailRequest, fetchProjectDetailSuccess, fetchProjectDetailFailure,
  addMilestoneRequest, addMilestoneSuccess,
  updateMilestoneRequest, updateMilestoneSuccess,
  deleteMilestoneRequest, deleteMilestoneSuccess,
  addDeliverableRequest, addDeliverableSuccess,
  updateDeliverableRequest, updateDeliverableSuccess,
  deleteDeliverableRequest, deleteDeliverableSuccess,
  addRiskRequest, addRiskSuccess,
  updateRiskRequest, updateRiskSuccess,
  deleteRiskRequest, deleteRiskSuccess,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
} from "./projectsSlice";
import type { ProjectsQuery, ProjectCreatePayload, ProjectUpdatePayload } from "./projectsTypes";

function* fetchProjectsWorker(action: { type: string; payload: ProjectsQuery }) {
  try {
    const response: { data: Project[]; total?: number } = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.list, method: "GET", params: action.payload,
    });
    const items = Array.isArray(response) ? response : response.data ?? [];
    yield put(fetchProjectsSuccess({ items, total: items.length }));
  } catch (error) {
    yield put(fetchProjectsFailure(error instanceof Error ? error.message : "Failed to fetch projects"));
  }
}

function* createProjectWorker(action: { type: string; payload: ProjectCreatePayload }) {
  try {
    const response: ApiResponse<Project> = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.create, method: "POST", data: action.payload,
    });
    yield put(createProjectSuccess(response.data));
    notification.success({ message: "Project created" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to create project";
    yield put(createProjectFailure(msg));
    notification.error({ message: "Create failed", description: msg });
  }
}

function* updateProjectWorker(action: { type: string; payload: ProjectUpdatePayload }) {
  try {
    const response: ApiResponse<Project> = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.update(action.payload.id), method: "PUT", data: action.payload.data,
    });
    yield put(updateProjectSuccess(response.data));
    notification.success({ message: "Project updated" });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to update project";
    yield put(updateProjectFailure(msg));
    notification.error({ message: "Update failed", description: msg });
  }
}

function* deleteProjectWorker(action: { type: string; payload: string }) {
  try {
    yield call(apiRequest, { url: API_ENDPOINTS.projects.delete(action.payload), method: "DELETE" });
    yield put(deleteProjectSuccess(action.payload));
    notification.success({ message: "Project deleted" });
  } catch (error) {
    yield put(deleteProjectFailure(error instanceof Error ? error.message : "Delete failed"));
  }
}

function* fetchProjectDetailWorker(action: { type: string; payload: string }) {
  try {
    const response: ApiResponse<ProjectDetail> = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.detail(action.payload), method: "GET",
    });
    yield put(fetchProjectDetailSuccess(response.data));
  } catch (error) {
    yield put(fetchProjectDetailFailure(error instanceof Error ? error.message : "Failed to fetch details"));
  }
}

function* addMilestoneWorker(action: { type: string; payload: { projectId: string; name: string; targetDate?: string } }) {
  try {
    const response: ApiResponse<ProjectMilestone> = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.addMilestone(action.payload.projectId), method: "POST",
      data: { name: action.payload.name, target_date: action.payload.targetDate },
    });
    yield put(addMilestoneSuccess(response.data));
    notification.success({ message: "Milestone added" });
  } catch (error) {
    notification.error({ message: "Failed to add milestone", description: error instanceof Error ? error.message : "" });
  }
}

function* updateMilestoneWorker(action: { type: string; payload: { projectId: string; milestoneId: string; data: Partial<ProjectMilestone> } }) {
  try {
    const response: ApiResponse<ProjectMilestone> = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.updateMilestone(action.payload.projectId, action.payload.milestoneId), method: "PUT",
      data: action.payload.data,
    });
    yield put(updateMilestoneSuccess(response.data));
    notification.success({ message: "Milestone updated" });
  } catch (error) {
    notification.error({ message: "Failed to update milestone", description: error instanceof Error ? error.message : "" });
  }
}

function* deleteMilestoneWorker(action: { type: string; payload: { projectId: string; milestoneId: string } }) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.projects.deleteMilestone(action.payload.projectId, action.payload.milestoneId), method: "DELETE",
    });
    yield put(deleteMilestoneSuccess(action.payload.milestoneId));
  } catch (error) {
    notification.error({ message: "Failed to remove milestone" });
  }
}

function* addDeliverableWorker(action: { type: string; payload: { projectId: string; name: string } }) {
  try {
    const response: ApiResponse<ProjectDeliverable> = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.addDeliverable(action.payload.projectId), method: "POST",
      data: { name: action.payload.name },
    });
    yield put(addDeliverableSuccess(response.data));
    notification.success({ message: "Deliverable added" });
  } catch (error) {
    notification.error({ message: "Failed to add deliverable", description: error instanceof Error ? error.message : "" });
  }
}

function* updateDeliverableWorker(action: { type: string; payload: { projectId: string; deliverableId: string; data: Partial<ProjectDeliverable> } }) {
  try {
    const response: ApiResponse<ProjectDeliverable> = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.updateDeliverable(action.payload.projectId, action.payload.deliverableId), method: "PUT",
      data: action.payload.data,
    });
    yield put(updateDeliverableSuccess(response.data));
  } catch (error) {
    notification.error({ message: "Failed to update deliverable" });
  }
}

function* deleteDeliverableWorker(action: { type: string; payload: { projectId: string; deliverableId: string } }) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.projects.deleteDeliverable(action.payload.projectId, action.payload.deliverableId), method: "DELETE",
    });
    yield put(deleteDeliverableSuccess(action.payload.deliverableId));
  } catch (error) {
    notification.error({ message: "Failed to remove deliverable" });
  }
}

function* addRiskWorker(action: { type: string; payload: { projectId: string; title: string; severity: string; notes?: string } }) {
  try {
    const response: ApiResponse<ProjectRisk> = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.addRisk(action.payload.projectId), method: "POST",
      data: { title: action.payload.title, severity: action.payload.severity, notes: action.payload.notes },
    });
    yield put(addRiskSuccess(response.data));
    notification.success({ message: "Risk added" });
  } catch (error) {
    notification.error({ message: "Failed to add risk", description: error instanceof Error ? error.message : "" });
  }
}

function* updateRiskWorker(action: { type: string; payload: { projectId: string; riskId: string; data: Partial<ProjectRisk> } }) {
  try {
    const response: ApiResponse<ProjectRisk> = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.updateRisk(action.payload.projectId, action.payload.riskId), method: "PUT",
      data: action.payload.data,
    });
    yield put(updateRiskSuccess(response.data));
    notification.success({ message: "Risk updated" });
  } catch (error) {
    notification.error({ message: "Failed to update risk" });
  }
}

function* deleteRiskWorker(action: { type: string; payload: { projectId: string; riskId: string } }) {
  try {
    yield call(apiRequest, {
      url: API_ENDPOINTS.projects.deleteRisk(action.payload.projectId, action.payload.riskId), method: "DELETE",
    });
    yield put(deleteRiskSuccess(action.payload.riskId));
  } catch (error) {
    notification.error({ message: "Failed to remove risk" });
  }
}

function* fetchStatsWorker() {
  try {
    const response: ApiResponse<ProjectStats> = yield call(apiRequest, {
      url: API_ENDPOINTS.projects.stats, method: "GET",
    });
    yield put(fetchStatsSuccess(response.data));
  } catch (error) {
    yield put(fetchStatsFailure(error instanceof Error ? error.message : "Failed to fetch stats"));
  }
}

export function* projectsSaga() {
  yield takeLatest(fetchProjectsRequest.type, fetchProjectsWorker);
  yield takeLatest(createProjectRequest.type, createProjectWorker);
  yield takeLatest(updateProjectRequest.type, updateProjectWorker);
  yield takeLatest(deleteProjectRequest.type, deleteProjectWorker);
  yield takeLatest(fetchProjectDetailRequest.type, fetchProjectDetailWorker);
  yield takeLatest(addMilestoneRequest.type, addMilestoneWorker);
  yield takeLatest(updateMilestoneRequest.type, updateMilestoneWorker);
  yield takeLatest(deleteMilestoneRequest.type, deleteMilestoneWorker);
  yield takeLatest(addDeliverableRequest.type, addDeliverableWorker);
  yield takeLatest(updateDeliverableRequest.type, updateDeliverableWorker);
  yield takeLatest(deleteDeliverableRequest.type, deleteDeliverableWorker);
  yield takeLatest(addRiskRequest.type, addRiskWorker);
  yield takeLatest(updateRiskRequest.type, updateRiskWorker);
  yield takeLatest(deleteRiskRequest.type, deleteRiskWorker);
  yield takeLatest(fetchStatsRequest.type, fetchStatsWorker);
}
