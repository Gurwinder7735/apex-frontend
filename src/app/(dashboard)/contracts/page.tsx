"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Select, Tag, Typography, Drawer, message } from "antd";
import { FileSignature, Sparkles, Loader2, FileText, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { AgentExecutionPanel } from "@/components/features/ProposalIntelligence/AgentExecutionPanel";
import { storage } from "@/lib/utils/storage";
import { APP_ROUTES } from "@/lib/constants/appConstants";
import type { Contract, ContractJob } from "@/types/models/Contract";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const typeLabels: Record<string, string> = { nda: "NDA", msa: "MSA", sow: "SOW" };
const typeColors: Record<string, string> = { nda: "blue", msa: "purple", sow: "green" };
const statusColors: Record<string, string> = {
  draft: "default", sent: "purple", signed: "green", declined: "red",
};
const statusLabels: Record<string, string> = {
  draft: "Draft", sent: "Sent", signed: "Signed", declined: "Declined",
};

interface ProposalOption {
  id: string;
  name: string;
  clientName?: string | null;
}

export default function ContractsPage() {
  const router = useRouter();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [genOpen, setGenOpen] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const [proposals, setProposals] = useState<ProposalOption[]>([]);
  const [selectedProposalId, setSelectedProposalId] = useState<string | undefined>();
  const [contractJob, setContractJob] = useState<ContractJob | null>(null);
  const [jobPolling, setJobPolling] = useState(false);

  // Filter state
  const [typeFilter, setTypeFilter] = useState<string | undefined>();
  const [statusFilter, setStatusFilter] = useState<string | undefined>();

  const fetchContracts = async () => {
    try {
      const token = storage.getAccessToken();
      const params = new URLSearchParams();
      if (typeFilter) params.set("contract_type", typeFilter);
      if (statusFilter) params.set("status", statusFilter);
      const res = await fetch(`${API_BASE_URL}/api/v1/contracts?${params}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setContracts(json.data || []);
      }
    } catch {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContracts();
  }, [typeFilter, statusFilter]);

  const openGenDrawer = async () => {
    setGenOpen(true);
    setSelectedProposalId(undefined);
    setContractJob(null);
    try {
      const token = storage.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/proposals?limit=100`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const json = await res.json();
        setProposals((json.data || []).map((p: { id: string; name: string; clientName?: string }) => ({
          id: p.id, name: p.name, clientName: p.clientName,
        })));
      }
    } catch {}
  };

  const handleGenerate = async () => {
    if (!selectedProposalId) return;
    setGenLoading(true);
    setContractJob(null);
    try {
      const token = storage.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/contracts/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ proposalId: selectedProposalId }),
      });
      if (!res.ok) throw new Error("Failed to start");
      const json = await res.json();
      const jobId = json.data?.jobId;
      if (jobId) {
        setJobPolling(true);
        pollJob(selectedProposalId);
      }
    } catch {
      message.error("Failed to start contract generation");
      setGenLoading(false);
    }
  };

  const pollJob = async (proposalId: string) => {
    const token = storage.getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/v1/contracts/jobs/by-proposal/${proposalId}`, { headers });
        if (!res.ok) { setJobPolling(false); setGenLoading(false); return; }
        const json = await res.json();
        const job = json.data as ContractJob;
        setContractJob(job);

        if (job.status === "running" || job.status === "pending") {
          setTimeout(poll, 3000);
        } else {
          setJobPolling(false);
          setGenLoading(false);
          if (job.status === "completed") {
            message.success("Contracts generated successfully");
            fetchContracts();
          } else {
            message.error("Contract generation failed");
          }
        }
      } catch {
        setJobPolling(false);
        setGenLoading(false);
      }
    };
    poll();
  };

  const initialAgents = [
    { agentName: "nda_agent", displayName: "NDA Agent", status: "pending" as const },
    { agentName: "msa_agent", displayName: "MSA Agent", status: "pending" as const },
    { agentName: "sow_agent", displayName: "SOW Agent", status: "pending" as const },
  ];

  const liveAgents = contractJob
    ? initialAgents.map((a) => {
        const run = contractJob.agentRuns.find((r) => r.agentName === a.agentName);
        return run ? { ...a, status: run.status as "pending" | "running" | "completed" | "failed" } : a;
      })
    : initialAgents;

  return (
    <div>
      <PageHeader
        title="Contracts"
        subtitle="Generate NDA, MSA, and SOW from your proposals."
      />

      <div className="mb-4 flex flex-wrap gap-3 items-center">
        <Select placeholder="Type" allowClear style={{ width: 150 }} onChange={(val) => setTypeFilter(val)}
          options={[
            { value: "nda", label: "NDA" }, { value: "msa", label: "MSA" }, { value: "sow", label: "SOW" },
          ]} />
        <Select placeholder="Status" allowClear style={{ width: 150 }} onChange={(val) => setStatusFilter(val)}
          options={[
            { value: "draft", label: "Draft" }, { value: "sent", label: "Sent" },
            { value: "signed", label: "Signed" }, { value: "declined", label: "Declined" },
          ]} />
        <div className="flex-1" />
        <Button type="primary" icon={<Sparkles className="w-4 h-4" />} onClick={openGenDrawer} className="!bg-indigo-600">
          Generate Contracts
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" /></div>
      ) : contracts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
          <FileSignature className="w-16 h-16 mb-4 text-zinc-300" />
          <Typography.Text className="text-lg font-medium text-zinc-500">No contracts yet</Typography.Text>
          <Typography.Text className="text-sm text-zinc-400 mb-4">Generate NDA, MSA, and SOW from your proposals.</Typography.Text>
          <Button type="primary" icon={<Sparkles className="w-4 h-4" />} onClick={openGenDrawer} className="!bg-indigo-600">
            Generate Contracts
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {contracts.map((contract) => (
            <Link key={contract.id} href={`${APP_ROUTES.contracts}/${contract.id}`} className="block group">
              <div className="bg-white rounded-xl border border-zinc-200 shadow-sm hover:shadow-md hover:border-zinc-300 transition-all p-4 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0 group-hover:bg-zinc-200 transition-colors">
                    <FileText className="w-5 h-5 text-zinc-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Tag color={typeColors[contract.contractType]} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none shrink-0 !m-0 uppercase">
                        {typeLabels[contract.contractType] || contract.contractType}
                      </Tag>
                      <Typography.Text className="text-sm font-semibold text-zinc-900 group-hover:text-blue-600 transition-colors truncate">
                        {contract.name}
                      </Typography.Text>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-zinc-500">
                      <Tag color={statusColors[contract.status] || "default"} className="!rounded-full !text-[10px] !px-2 !py-0 !leading-none">
                        {statusLabels[contract.status] || contract.status}
                      </Tag>
                      <span>v{contract.version}</span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <Drawer
        title="Generate Contracts from Proposal"
        width={520}
        open={genOpen}
        onClose={() => { if (!genLoading) { setGenOpen(false); setContractJob(null); } }}
        destroyOnClose
      >
        <div className="space-y-5">
          {contractJob && (contractJob.status === "running" || contractJob.status === "pending") ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                <Typography.Text className="font-medium text-zinc-700">Generating contracts...</Typography.Text>
              </div>
              <AgentExecutionPanel agents={liveAgents} currentStream={{}} />
            </div>
          ) : contractJob && contractJob.status === "completed" ? (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <Typography.Title level={4} className="!text-green-700">Contracts Generated</Typography.Title>
              <Typography.Text className="text-zinc-500">Close this drawer and view your contracts in the list.</Typography.Text>
            </div>
          ) : (
            <>
              <Typography.Text className="text-sm font-medium text-zinc-700 block">Select Proposal</Typography.Text>
              <Select
                value={selectedProposalId}
                onChange={setSelectedProposalId}
                placeholder="Choose a proposal..."
                showSearch
                style={{ width: "100%" }}
                filterOption={(input, option) => (option?.label ?? "").toLowerCase().includes(input.toLowerCase())}
                options={proposals.map((p) => ({ value: p.id, label: `${p.name}${p.clientName ? ` — ${p.clientName}` : ""}` }))}
              />
              <Typography.Text className="text-xs text-zinc-500 block -mt-2">
                This will generate three documents: NDA, MSA, and Statement of Work based on the proposal content.
              </Typography.Text>
              <div className="flex justify-end pt-2">
                <Button
                  type="primary"
                  icon={genLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  onClick={handleGenerate}
                  disabled={!selectedProposalId || genLoading}
                  className="!bg-indigo-600"
                >
                  {genLoading ? "Starting..." : "Generate"}
                </Button>
              </div>
            </>
          )}
        </div>
      </Drawer>
    </div>
  );
}
