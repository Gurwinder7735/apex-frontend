import type { ProposalJob, AgentRun } from "@/types/models/ProposalIntelligence";

export interface ProposalIntelligenceState {
  jobs: ProposalJob[];
  currentJob: ProposalJob | null;
  currentAgentRuns: AgentRun[];
  agentStream: Record<string, string>;
  isGenerating: boolean;
  error: string | null;
}

export interface FileContentResponse {
  fileName: string;
  content: string;
}
