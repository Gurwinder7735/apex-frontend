export interface AgentRun {
  id: string;
  agentName: string;
  status: "pending" | "running" | "completed" | "failed";
  outputFile?: string | null;
  content?: string | null;
  error?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  order: number;
}

export interface ProposalJob {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  inputText: string;
  template?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  proposalId?: string | null;
  agentRuns: AgentRun[];
}

export interface SSEData {
  type: string;
  jobId: string;
  data?: Record<string, unknown>;
}
