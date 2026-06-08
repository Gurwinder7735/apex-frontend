"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button, Tag, Typography, Spin, Modal, Form, Input as AntInput, Select, message } from "antd";
import { ArrowLeft, FileText, Edit3, Save, Trash2, Copy, CheckCircle } from "lucide-react";
import { MarkdownRenderer } from "@/components/features/ProposalIntelligence/MarkdownRenderer";
import { storage } from "@/lib/utils/storage";
import { APP_ROUTES } from "@/lib/constants/appConstants";
import type { Contract } from "@/types/models/Contract";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

const typeLabels: Record<string, string> = { nda: "NDA", msa: "MSA", sow: "SOW" };
const typeColors: Record<string, string> = { nda: "blue", msa: "purple", sow: "green" };
const statusColors: Record<string, string> = {
  draft: "default", sent: "purple", signed: "green", declined: "red",
};
const statusLabels: Record<string, string> = {
  draft: "Draft", sent: "Sent", signed: "Signed", declined: "Declined",
};

export default function ContractDetailPage() {
  const params = useParams();
  const router = useRouter();
  const contractId = params.contractId as string;
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const token = storage.getAccessToken();
        const res = await fetch(`${API_BASE_URL}/api/v1/contracts/${contractId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          setContract(json.data);
        }
      } catch {} finally {
        setLoading(false);
      }
    };
    if (contractId) fetchContract();
  }, [contractId]);

  const handleSave = async () => {
    if (!contract) return;
    try {
      const token = storage.getAccessToken();
      const res = await fetch(`${API_BASE_URL}/api/v1/contracts/${contractId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ content: editContent }),
      });
      if (res.ok) {
        const json = await res.json();
        setContract(json.data);
        setEditing(false);
        message.success("Contract updated");
      }
    } catch {
      message.error("Failed to save");
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Delete contract",
      content: `Delete "${contract?.name}"?`,
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const token = storage.getAccessToken();
          await fetch(`${API_BASE_URL}/api/v1/contracts/${contractId}`, {
            method: "DELETE",
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          router.push(APP_ROUTES.contracts);
        } catch {}
      },
    });
  };

  const copyShareLink = () => {
    if (contract?.shareToken) {
      navigator.clipboard.writeText(`${window.location.origin}/contracts/share/${contract.shareToken}`);
      message.success("Share link copied");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center py-32"><Spin size="large" /></div>;
  }

  if (!contract) {
    return (
      <div className="flex justify-center items-center py-32">
        <Typography.Text className="text-zinc-500">Contract not found</Typography.Text>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Button type="text" icon={<ArrowLeft className="w-4 h-4" />} onClick={() => router.push(APP_ROUTES.contracts)} className="!text-zinc-500 hover:!text-zinc-900 !-ml-2 mb-2">
          Back to Contracts
        </Button>
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-xl bg-zinc-100 border border-zinc-200 flex items-center justify-center shrink-0">
              <FileText className="w-7 h-7 text-zinc-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag color={typeColors[contract.contractType]} className="!rounded-full !px-2 !py-0 !text-xs uppercase shrink-0">
                  {typeLabels[contract.contractType] || contract.contractType}
                </Tag>
                <Typography.Title level={3} className="!mb-0 !text-2xl !leading-tight">{contract.name}</Typography.Title>
                <Tag color={statusColors[contract.status] || "default"} className="!rounded-full !px-3 !py-0.5 !text-xs whitespace-nowrap shrink-0">
                  {statusLabels[contract.status] || contract.status}
                </Tag>
                <Tag className="!rounded-full !px-2 !py-0 !text-xs whitespace-nowrap shrink-0">v{contract.version}</Tag>
                {contract.signedBy && (
                  <Tag icon={<CheckCircle className="w-3 h-3" />} color="green" className="!rounded-full !px-2 !py-0 !text-xs whitespace-nowrap shrink-0 !inline-flex !items-center !gap-1">
                    <CheckCircle className="w-3 h-3" /> Signed by {contract.signedBy}
                  </Tag>
                )}
              </div>
              <Typography.Text className="text-zinc-500 text-sm block mt-1">
                Updated {new Date(contract.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </Typography.Text>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            {contract.shareToken && (
              <Button icon={<Copy className="w-4 h-4" />} onClick={copyShareLink}>Copy Share Link</Button>
            )}
            <Button icon={<Edit3 className="w-4 h-4" />} onClick={() => { setEditContent(contract.content || ""); setEditing(true); }}>Edit</Button>
            <Button danger icon={<Trash2 className="w-4 h-4" />} onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-zinc-200 p-6">
        {editing ? (
          <div>
            <AntInput.TextArea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={30} className="font-mono text-sm" />
            <div className="flex justify-end gap-2 mt-4">
              <Button onClick={() => setEditing(false)}>Cancel</Button>
              <Button type="primary" icon={<Save className="w-4 h-4" />} onClick={handleSave}>Save</Button>
            </div>
          </div>
        ) : contract.content ? (
          <MarkdownRenderer content={contract.content} />
        ) : (
          <Typography.Text className="text-zinc-400">No content</Typography.Text>
        )}
      </div>
    </div>
  );
}
