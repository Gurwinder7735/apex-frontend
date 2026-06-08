export interface Document {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  clientId?: string | null;
  clientName?: string | null;
  tags: string[];
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy?: string | null;
  uploadedByName?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentActivity {
  id: string;
  documentId: string;
  action: string;
  description: string;
  performedBy?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface DocumentDetail {
  document: Document;
  activities: DocumentActivity[];
}

export interface DocumentStats {
  totalDocuments: number;
  addedThisMonth: number;
  recentUploads: number;
  byCategory: Record<string, number>;
}
