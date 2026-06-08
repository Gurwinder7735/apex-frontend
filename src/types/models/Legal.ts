export interface LegalDocument {
  id: string;
  name: string;
  clientId?: string | null;
  clientName?: string | null;
  proposalId?: string | null;
  documentType: string;
  status: string;
  fileUrl?: string | null;
  fileType?: string | null;
  fileSize: number;
  signatureStatus?: string | null;
  signedBy?: string | null;
  signedAt?: string | null;
  sentDate?: string | null;
  signedDate?: string | null;
  expiryDate?: string | null;
  currentVersion: number;
  isArchived: boolean;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LegalVersion {
  id: string;
  legalDocumentId: string;
  versionNumber: number;
  fileUrl: string;
  fileType?: string | null;
  fileSize: number;
  notes?: string | null;
  uploadedBy?: string | null;
  createdAt: string;
}

export interface LegalActivity {
  id: string;
  legalDocumentId: string;
  action: string;
  description: string;
  performedBy?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface LegalDetail {
  legal: LegalDocument;
  versions: LegalVersion[];
  activities: LegalActivity[];
}

export interface LegalStats {
  totalNdas: number;
  activeContracts: number;
  pendingSignatures: number;
  expiredAgreements: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
}
