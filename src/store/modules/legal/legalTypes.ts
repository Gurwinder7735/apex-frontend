import type { LegalDocument, LegalVersion, LegalActivity, LegalDetail, LegalStats } from "@/types/models/Legal";

export interface LegalState {
  items: LegalDocument[];
  total: number;
  isLoading: boolean;
  error: string | null;
  stats: LegalStats | null;
  detail: LegalDetail | null;
  versions: LegalVersion[];
  activities: LegalActivity[];
}

export interface LegalQuery {
  search?: string;
  clientId?: string;
  proposalId?: string;
  documentType?: string;
  status?: string;
  isArchived?: boolean;
  skip?: number;
  limit?: number;
}

export interface LegalCreatePayload {
  name: string;
  clientId?: string;
  proposalId?: string;
  documentType?: string;
  status?: string;
  sentDate?: string;
  signedDate?: string;
  expiryDate?: string;
  file?: File;
}

export interface LegalUpdatePayload {
  id: string;
  data: Partial<{
    name: string;
    clientId: string;
    proposalId: string;
    documentType: string;
    status: string;
    sentDate: string;
    signedDate: string;
    expiryDate: string;
    isArchived: boolean;
  }>;
}
