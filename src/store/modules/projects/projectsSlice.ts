import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { Project, ProjectDetail, ProjectMilestone, ProjectDeliverable, ProjectRisk, ProjectActivity, ProjectStats } from "@/types/models/Project";
import type { ProjectsState, ProjectsQuery, ProjectCreatePayload, ProjectUpdatePayload } from "./projectsTypes";

const initialState: ProjectsState = {
  items: [],
  total: 0,
  isLoading: false,
  error: null,
  stats: null,
  detail: null,
  milestones: [],
  deliverables: [],
  risks: [],
  activities: [],
};

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    fetchProjectsRequest: (state, _action: PayloadAction<ProjectsQuery>) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (state, action: PayloadAction<{ items: Project[]; total: number }>) => {
      state.isLoading = false;
      state.items = action.payload.items;
      state.total = action.payload.total;
    },
    fetchProjectsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    createProjectRequest: (_state, _action: PayloadAction<ProjectCreatePayload>) => {},
    createProjectSuccess: (state, action: PayloadAction<Project>) => {
      state.items.unshift(action.payload);
      state.total += 1;
    },
    createProjectFailure: (_state, _action: PayloadAction<string>) => {},
    updateProjectRequest: (_state, _action: PayloadAction<ProjectUpdatePayload>) => {},
    updateProjectSuccess: (state, action: PayloadAction<Project>) => {
      const idx = state.items.findIndex((p) => p.id === action.payload.id);
      if (idx !== -1) state.items[idx] = action.payload;
      if (state.detail?.project.id === action.payload.id) {
        state.detail.project = action.payload;
      }
    },
    updateProjectFailure: (_state, _action: PayloadAction<string>) => {},
    deleteProjectRequest: (_state, _action: PayloadAction<string>) => {},
    deleteProjectSuccess: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((p) => p.id !== action.payload);
      state.total -= 1;
    },
    deleteProjectFailure: (_state, _action: PayloadAction<string>) => {},
    fetchProjectDetailRequest: (state, _action: PayloadAction<string>) => {
      state.isLoading = true;
    },
    fetchProjectDetailSuccess: (state, action: PayloadAction<ProjectDetail>) => {
      state.isLoading = false;
      state.detail = action.payload;
      state.milestones = action.payload.milestones;
      state.deliverables = action.payload.deliverables;
      state.risks = action.payload.risks;
      state.activities = action.payload.activities;
    },
    fetchProjectDetailFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    addMilestoneRequest: (_state, _action: PayloadAction<{ projectId: string; name: string; targetDate?: string }>) => {},
    addMilestoneSuccess: (state, action: PayloadAction<ProjectMilestone>) => {
      state.milestones.unshift(action.payload);
      if (state.detail) state.detail.milestones.unshift(action.payload);
    },
    updateMilestoneRequest: (_state, _action: PayloadAction<{ projectId: string; milestoneId: string; data: Partial<ProjectMilestone> }>) => {},
    updateMilestoneSuccess: (state, action: PayloadAction<ProjectMilestone>) => {
      const idx = state.milestones.findIndex((m) => m.id === action.payload.id);
      if (idx !== -1) state.milestones[idx] = action.payload;
    },
    deleteMilestoneRequest: (_state, _action: PayloadAction<{ projectId: string; milestoneId: string }>) => {},
    deleteMilestoneSuccess: (state, action: PayloadAction<string>) => {
      state.milestones = state.milestones.filter((m) => m.id !== action.payload);
    },
    addDeliverableRequest: (_state, _action: PayloadAction<{ projectId: string; name: string }>) => {},
    addDeliverableSuccess: (state, action: PayloadAction<ProjectDeliverable>) => {
      state.deliverables.unshift(action.payload);
      if (state.detail) state.detail.deliverables.unshift(action.payload);
    },
    updateDeliverableRequest: (_state, _action: PayloadAction<{ projectId: string; deliverableId: string; data: Partial<ProjectDeliverable> }>) => {},
    updateDeliverableSuccess: (state, action: PayloadAction<ProjectDeliverable>) => {
      const idx = state.deliverables.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) state.deliverables[idx] = action.payload;
    },
    deleteDeliverableRequest: (_state, _action: PayloadAction<{ projectId: string; deliverableId: string }>) => {},
    deleteDeliverableSuccess: (state, action: PayloadAction<string>) => {
      state.deliverables = state.deliverables.filter((d) => d.id !== action.payload);
    },
    addRiskRequest: (_state, _action: PayloadAction<{ projectId: string; title: string; severity: string; notes?: string }>) => {},
    addRiskSuccess: (state, action: PayloadAction<ProjectRisk>) => {
      state.risks.unshift(action.payload);
      if (state.detail) state.detail.risks.unshift(action.payload);
    },
    updateRiskRequest: (_state, _action: PayloadAction<{ projectId: string; riskId: string; data: Partial<ProjectRisk> }>) => {},
    updateRiskSuccess: (state, action: PayloadAction<ProjectRisk>) => {
      const idx = state.risks.findIndex((r) => r.id === action.payload.id);
      if (idx !== -1) state.risks[idx] = action.payload;
    },
    deleteRiskRequest: (_state, _action: PayloadAction<{ projectId: string; riskId: string }>) => {},
    deleteRiskSuccess: (state, action: PayloadAction<string>) => {
      state.risks = state.risks.filter((r) => r.id !== action.payload);
    },
    fetchStatsRequest: (_state) => {},
    fetchStatsSuccess: (state, action: PayloadAction<ProjectStats>) => {
      state.stats = action.payload;
    },
    fetchStatsFailure: (_state, _action: PayloadAction<string>) => {},
    clearProjectDetail: (state) => {
      state.detail = null;
      state.milestones = [];
      state.deliverables = [];
      state.risks = [];
      state.activities = [];
    },
    clearError: (state) => { state.error = null; },
  },
});

export const {
  fetchProjectsRequest, fetchProjectsSuccess, fetchProjectsFailure,
  createProjectRequest, createProjectSuccess, createProjectFailure,
  updateProjectRequest, updateProjectSuccess, updateProjectFailure,
  deleteProjectRequest, deleteProjectSuccess, deleteProjectFailure,
  fetchProjectDetailRequest, fetchProjectDetailSuccess, fetchProjectDetailFailure,
  addMilestoneRequest, addMilestoneSuccess, updateMilestoneRequest, updateMilestoneSuccess,
  deleteMilestoneRequest, deleteMilestoneSuccess,
  addDeliverableRequest, addDeliverableSuccess, updateDeliverableRequest, updateDeliverableSuccess,
  deleteDeliverableRequest, deleteDeliverableSuccess,
  addRiskRequest, addRiskSuccess, updateRiskRequest, updateRiskSuccess,
  deleteRiskRequest, deleteRiskSuccess,
  fetchStatsRequest, fetchStatsSuccess, fetchStatsFailure,
  clearProjectDetail, clearError,
} = projectsSlice.actions;

export default projectsSlice.reducer;
