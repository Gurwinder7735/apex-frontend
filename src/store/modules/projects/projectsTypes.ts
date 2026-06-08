import type { Project, ProjectMilestone, ProjectDeliverable, ProjectRisk, ProjectActivity, ProjectDetail, ProjectStats } from "@/types/models/Project";

export interface ProjectsState {
  items: Project[];
  total: number;
  isLoading: boolean;
  error: string | null;
  stats: ProjectStats | null;
  detail: ProjectDetail | null;
  milestones: ProjectMilestone[];
  deliverables: ProjectDeliverable[];
  risks: ProjectRisk[];
  activities: ProjectActivity[];
}

export interface ProjectsQuery {
  search?: string;
  clientId?: string;
  status?: string;
  health?: string;
  projectManager?: string;
  skip?: number;
  limit?: number;
}

export interface ProjectCreatePayload {
  name: string;
  clientId?: string;
  proposalId?: string;
  description?: string;
  status?: string;
  health?: string;
  projectManager?: string;
  startDate?: string;
  targetDate?: string;
}

export interface ProjectUpdatePayload {
  id: string;
  data: Partial<ProjectCreatePayload>;
}
