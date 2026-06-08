"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tag, Typography, Spin, Input, Checkbox, Button, Space, message } from "antd";
import { FileText, CheckCircle, XCircle, PenLine } from "lucide-react";
import axios from "axios";
import { MarkdownRenderer } from "@/components/features/ProposalIntelligence/MarkdownRenderer";

interface SharedProposal {
  id: string;
  name: string;
  clientName?: string | null;
  projectName?: string | null;
  status: string;
  version: number;
  isAiGenerated: boolean;
  aiContent?: Record<string, string> | null;
  signedBy?: string | null;
  signedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusLabels: Record<string, string> = {
  draft: "Draft", internal_review: "Internal Review", sent: "Sent",
  client_review: "Client Review", approved: "Approved", rejected: "Rejected", archived: "Archived",
};

const statusColors: Record<string, string> = {
  draft: "default", internal_review: "blue", sent: "purple",
  client_review: "orange", approved: "green", rejected: "red", archived: "default",
};

export default function SharedProposalPage() {
  const params = useParams();
  const token = params.token as string;
  const [proposal, setProposal] = useState<SharedProposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signName, setSignName] = useState("");
  const [agree, setAgree] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    const fetchProposal = async () => {
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await axios.get(`${baseURL}/api/v1/proposals/share/${token}`);
        const data = res.data.data;
        setProposal(data);
        if (data.signedBy) {
          setSigned(true);
          setSignName(data.signedBy);
        }
      } catch {
        setError("Proposal not found or link is invalid.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchProposal();
  }, [token]);

  const handleSign = async (action: "accept" | "reject") => {
    if (!signName.trim()) {
      message.error("Please enter your full name.");
      return;
    }
    if (action === "accept" && !agree) {
      message.error("Please agree to the terms before signing.");
      return;
    }
    setSigning(true);
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
      await axios.post(`${baseURL}/api/v1/proposals/share/${token}/sign`, {
        signedBy: signName.trim(),
        action,
      });
      if (action === "accept") {
        setSigned(true);
      } else {
        setDeclined(true);
      }
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err) && err.response?.data?.message
        ? err.response.data.message : "Something went wrong. Please try again.";
      message.error(msg);
    } finally {
      setSigning(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <Typography.Title level={4} className="!text-zinc-500">{error || "Proposal not found"}</Typography.Title>
        </div>
      </div>
    );
  }

  const proposalContent = proposal.aiContent?.["proposal.md"];

  return (
    <div className="min-h-screen bg-zinc-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-zinc-900 flex items-center justify-center">
              <div className="w-5 h-5 bg-white rounded-sm" />
            </div>
            <span className="text-sm font-semibold text-zinc-500">APEX</span>
          </div>
          <Space>
            {proposal.signedBy && (
              <Tag icon={<CheckCircle className="w-3 h-3" />} color="green" className="!rounded-full !px-3 !py-0.5">
                Signed
              </Tag>
            )}
            <Tag color={statusColors[proposal.status] || "default"} className="!rounded-full !px-3 !py-0.5">
              {statusLabels[proposal.status] || proposal.status}
            </Tag>
          </Space>
        </div>

        <div className="mb-8">
          <Typography.Title level={2} className="!mb-2">{proposal.name}</Typography.Title>
          <Typography.Text className="text-zinc-500">
            {proposal.clientName && <>{proposal.clientName} &middot; </>}
            {proposal.projectName && <>Project: {proposal.projectName} &middot; </>}
            v{proposal.version} &middot; {new Date(proposal.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Typography.Text>
        </div>

        {proposalContent ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-8 mb-8">
            <MarkdownRenderer content={proposalContent} />
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <Typography.Text className="text-zinc-500">No proposal content available.</Typography.Text>
          </div>
        )}

        {signed && proposal.signedBy ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-8">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <Typography.Title level={4} className="!text-green-800 !mb-1">Proposal Signed</Typography.Title>
            <Typography.Text className="text-green-700">
              Signed by <strong>{proposal.signedBy}</strong>
              {proposal.signedAt && <> on {new Date(proposal.signedAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}</>}
            </Typography.Text>
          </div>
        ) : declined ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <Typography.Title level={4} className="!text-red-800 !mb-1">Proposal Declined</Typography.Title>
            <Typography.Text className="text-red-700">
              Recorded as declined by <strong>{signName}</strong>.
            </Typography.Text>
          </div>
        ) : !proposal.signedBy ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <PenLine className="w-5 h-5 text-zinc-500" />
              <Typography.Text className="text-sm font-semibold text-zinc-700">Sign this Proposal</Typography.Text>
            </div>
            <div className="space-y-4">
              <div>
                <Typography.Text className="text-xs font-semibold text-zinc-400 uppercase tracking-wide block mb-1">Full Name</Typography.Text>
                <Input
                  placeholder="Enter your full legal name"
                  value={signName}
                  onChange={(e) => setSignName(e.target.value)}
                  className="max-w-sm"
                />
              </div>
              <Checkbox checked={agree} onChange={(e) => setAgree(e.target.checked)}>
                <Typography.Text className="text-sm text-zinc-600">
                  I have read and agree to the terms of this proposal
                </Typography.Text>
              </Checkbox>
              <Space>
                <Button type="primary" icon={<CheckCircle className="w-4 h-4" />} loading={signing} onClick={() => handleSign("accept")}>
                  Accept & Sign
                </Button>
                <Button danger icon={<XCircle className="w-4 h-4" />} loading={signing} onClick={() => handleSign("reject")}>
                  Decline
                </Button>
              </Space>
            </div>
          </div>
        ) : null}

        <div className="text-center text-xs text-zinc-400 pt-8 border-t border-zinc-200 mt-8">
          Powered by <span className="font-semibold text-zinc-500">APEX</span> &mdash; Proposal Studio
        </div>
      </div>
    </div>
  );
}
