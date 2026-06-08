"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Spin } from "antd";
import { storage } from "@/lib/utils/storage";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export default function IntelligenceWorkspaceRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.jobId as string;
  useEffect(() => {
    const fetchAndRedirect = async () => {
      try {
        const token = storage.getAccessToken();
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const res = await fetch(`${API_BASE_URL}/api/v1/proposal-intelligence/jobs/${jobId}`, { headers });
        if (res.ok) {
          const json = await res.json();
          const proposalId = json.data?.proposalId as string | undefined;
          if (proposalId) {
            router.replace(`/proposals/${proposalId}`);
            return;
          }
        }
      } catch {
        // silent
      }
      router.replace("/proposals");
    };

    fetchAndRedirect();
  }, [jobId, router]);

  return (
    <div className="flex justify-center items-center py-32">
      <Spin size="large" />
    </div>
  );
}
