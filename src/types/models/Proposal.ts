export interface SummaryInfo {
  clientProblem?: string | null;
  businessGoals?: string | null;
  projectVision?: string | null;
}

export interface ScopeInfo {
  includedFeatures: string[];
  excludedFeatures: string[];
  deliverables: string[];
}

export interface TimelinePhase {
  name: string;
  duration: string;
}

export interface TimelineInfo {
  phases: TimelinePhase[];
}

export interface PricingInfo {
  type: string;
  cost: number;
  currency: string;
  paymentTerms?: string | null;
}

export interface Proposal {
  id: string;
  name: string;
  clientId?: string | null;
  clientName?: string | null;
  projectName?: string | null;
  status: string;
  version: number;
  summary?: SummaryInfo | null;
  scope?: ScopeInfo | null;
  timeline?: TimelineInfo | null;
  pricing?: PricingInfo | null;
  assumptions: string[];
  risks: string[];
  shareToken?: string | null;
  createdBy?: string | null;
  isAiGenerated?: boolean;
  proposalJobId?: string | null;
  signedBy?: string | null;
  signedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProposalVersion {
  id: string;
  proposalId: string;
  versionNumber: number;
  snapshot: Record<string, unknown>;
  createdBy?: string | null;
  createdAt: string;
}

export interface ProposalActivity {
  id: string;
  proposalId: string;
  action: string;
  description: string;
  performedBy?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ProposalDetail {
  proposal: Proposal;
  versions: ProposalVersion[];
  activities: ProposalActivity[];
}

export interface ProposalStats {
  totalProposals: number;
  draftCount: number;
  sentCount: number;
  approvedCount: number;
  rejectedCount: number;
  byStatus: Record<string, number>;
}
