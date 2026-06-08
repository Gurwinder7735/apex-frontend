export interface Project {
  id: string;
  name: string;
  clientId?: string | null;
  clientName?: string | null;
  proposalId?: string | null;
  description?: string | null;
  status: string;
  health: string;
  projectManager?: string | null;
  startDate?: string | null;
  targetDate?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectMilestone {
  id: string;
  projectId: string;
  name: string;
  targetDate?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectDeliverable {
  id: string;
  projectId: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRisk {
  id: string;
  projectId: string;
  title: string;
  severity: string;
  status: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectActivity {
  id: string;
  projectId: string;
  action: string;
  description: string;
  performedBy?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ProjectDetail {
  project: Project;
  milestones: ProjectMilestone[];
  deliverables: ProjectDeliverable[];
  risks: ProjectRisk[];
  activities: ProjectActivity[];
}

export interface ProjectStats {
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  upcomingMilestones: number;
  byStatus: Record<string, number>;
}
