import type { Client, Contact, Activity, ClientDetail } from "@/types/models/Client";

export interface ClientsState {
  items: Client[];
  total: number;
  isLoading: boolean;
  error: string | null;
  stats: {
    totalClients: number;
    activeClients: number;
    recentlyAdded: number;
    newThisMonth: number;
  } | null;
  detail: ClientDetail | null;
  contacts: Contact[];
  activities: Activity[];
}

export interface ClientsQuery {
  search?: string;
  status?: string;
  source?: string;
  country?: string;
  industry?: string;
  skip?: number;
  limit?: number;
}

export interface ClientCreatePayload {
  companyName: string;
  email?: string;
  phone?: string;
  website?: string;
  industry?: string;
  country?: string;
  timezone?: string;
  sourceType?: string;
  referredBy?: string;
  internalNotes?: string;
  status?: string;
}

export interface ClientUpdatePayload {
  id: string;
  data: Partial<ClientCreatePayload>;
}

export interface ContactCreatePayload {
  clientId: string;
  fullName: string;
  designation?: string;
  email?: string;
  phone?: string;
  linkedinProfile?: string;
  notes?: string;
  isPrimary?: boolean;
}

export interface ContactUpdatePayload {
  clientId: string;
  contactId: string;
  data: Partial<ContactCreatePayload>;
}
