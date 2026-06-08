export interface Contract {
  id: string;
  name: string;
  proposalId: string;
  contractType: "nda" | "msa" | "sow";
  status: string;
  version: number;
  content?: string | null;
  shareToken?: string | null;
  signedBy?: string | null;
  signedAt?: string | null;
  isAiGenerated?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContractAgentRun {
  id: string;
  agentName: string;
  status: string;
  content?: string | null;
  error?: string | null;
  contractId?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  order: number;
}

export interface ContractJob {
  id: string;
  status: string;
  proposalId: string;
  agentRuns: ContractAgentRun[];
}
