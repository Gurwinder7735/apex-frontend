import type { Document, DocumentActivity, DocumentDetail, DocumentStats } from "@/types/models/Document";

export interface DocumentsState {
  items: Document[];
  total: number;
  isLoading: boolean;
  error: string | null;
  stats: DocumentStats | null;
  detail: DocumentDetail | null;
  activities: DocumentActivity[];
}

export interface DocumentsQuery {
  search?: string;
  category?: string;
  clientId?: string;
  uploadedBy?: string;
  dateFrom?: string;
  dateTo?: string;
  skip?: number;
  limit?: number;
}

export interface DocumentCreatePayload {
  file: File;
  name: string;
  description?: string;
  category: string;
  clientId?: string;
  tags: string;
}
