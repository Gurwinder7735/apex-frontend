"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Tag, Typography, Spin, Input, Checkbox, Button, Space, message } from "antd";
import { FileText, CheckCircle, XCircle, PenLine } from "lucide-react";
import axios from "axios";
import { MarkdownRenderer } from "@/components/features/ProposalIntelligence/MarkdownRenderer";

interface SharedContract {
  id: string;
  name: string;
  contractType: string;
  status: string;
  version: number;
  content?: string | null;
  signedBy?: string | null;
  signedAt?: string | null;
}

const typeLabels: Record<string, string> = { nda: "NDA", msa: "MSA", sow: "SOW" };
const typeColors: Record<string, string> = { nda: "blue", msa: "purple", sow: "green" };
const statusLabels: Record<string, string> = {
  draft: "Draft", sent: "Sent", signed: "Signed", declined: "Declined",
};
const statusColors: Record<string, string> = {
  draft: "default", sent: "purple", signed: "green", declined: "red",
};

export default function SharedContractPage() {
  const params = useParams();
  const token = params.token as string;
  const [contract, setContract] = useState<SharedContract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [signName, setSignName] = useState("");
  const [agree, setAgree] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [declined, setDeclined] = useState(false);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
        const res = await axios.get(`${baseURL}/api/v1/contracts/share/${token}`);
        const data = res.data.data;
        setContract(data);
        if (data.signedBy) {
          setSigned(true);
          setSignName(data.signedBy);
        }
      } catch {
        setError("Contract not found or link is invalid.");
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchContract();
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
      await axios.post(`${baseURL}/api/v1/contracts/share/${token}/sign`, {
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

  if (error || !contract) {
    return (
      <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <FileText className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
          <Typography.Title level={4} className="!text-zinc-500">{error || "Contract not found"}</Typography.Title>
        </div>
      </div>
    );
  }

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
            {contract.signedBy && (
              <Tag icon={<CheckCircle className="w-3 h-3" />} color="green" className="!rounded-full !px-3 !py-0.5">
                Signed
              </Tag>
            )}
            <Tag color={statusColors[contract.status] || "default"} className="!rounded-full !px-3 !py-0.5">
              {statusLabels[contract.status] || contract.status}
            </Tag>
          </Space>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Tag color={typeColors[contract.contractType]} className="!rounded-full !px-2 !py-0 uppercase">
              {typeLabels[contract.contractType] || contract.contractType}
            </Tag>
            <Typography.Title level={2} className="!mb-0">{contract.name}</Typography.Title>
          </div>
          <Typography.Text className="text-zinc-500">
            v{contract.version} &middot; {new Date(contract.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </Typography.Text>
        </div>

        {contract.content ? (
          <div className="bg-white rounded-xl border border-zinc-200 p-8 mb-8">
            <MarkdownRenderer content={contract.content} />
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <Typography.Text className="text-zinc-500">No content available.</Typography.Text>
          </div>
        )}

        {signed && contract.signedBy ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center mb-8">
            <CheckCircle className="w-10 h-10 text-green-600 mx-auto mb-3" />
            <Typography.Title level={4} className="!text-green-800 !mb-1">Contract Signed</Typography.Title>
            <Typography.Text className="text-green-700">
              Signed by <strong>{contract.signedBy}</strong>
              {contract.signedAt && <> on {new Date(contract.signedAt).toLocaleDateString("en-US", {
                year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
              })}</>}
            </Typography.Text>
          </div>
        ) : declined ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center mb-8">
            <XCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <Typography.Title level={4} className="!text-red-800 !mb-1">Contract Declined</Typography.Title>
            <Typography.Text className="text-red-700">
              Recorded as declined by <strong>{signName}</strong>.
            </Typography.Text>
          </div>
        ) : !contract.signedBy ? (
          <div className="bg-white border border-zinc-200 rounded-xl p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <PenLine className="w-5 h-5 text-zinc-500" />
              <Typography.Text className="text-sm font-semibold text-zinc-700">Sign this Contract</Typography.Text>
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
                  I have read and agree to the terms of this contract
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
          Powered by <span className="font-semibold text-zinc-500">APEX</span> &mdash; Contract Studio
        </div>
      </div>
    </div>
  );
}
