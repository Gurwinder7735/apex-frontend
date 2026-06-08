import type { Proposal, ProposalVersion, ProposalActivity, ProposalDetail, ProposalStats, SummaryInfo, ScopeInfo, TimelineInfo, PricingInfo } from "@/types/models/Proposal";

export interface ProposalsState {
  items: Proposal[];
  total: number;
  isLoading: boolean;
  error: string | null;
  stats: ProposalStats | null;
  detail: ProposalDetail | null;
  versions: ProposalVersion[];
  activities: ProposalActivity[];
}

export interface ProposalsQuery {
  search?: string;
  clientId?: string;
  status?: string;
  skip?: number;
  limit?: number;
}

export interface ProposalCreatePayload {
  name: string;
  clientId?: string;
  projectName?: string;
  summary?: SummaryInfo | null;
  scope?: ScopeInfo | null;
  timeline?: TimelineInfo | null;
  pricing?: PricingInfo | null;
  assumptions?: string[];
  risks?: string[];
}

export interface ProposalUpdatePayload {
  id: string;
  data: Partial<ProposalCreatePayload & { status: string }>;
}
