export interface Client {
  id: string;
  companyName: string;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  industry?: string | null;
  country?: string | null;
  timezone?: string | null;
  sourceType: string;
  referredBy?: string | null;
  internalNotes?: string | null;
  status: string;
  logoUrl?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
  contactCount: number;
}

export interface Contact {
  id: string;
  clientId: string;
  fullName: string;
  designation?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedinProfile?: string | null;
  notes?: string | null;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Activity {
  id: string;
  clientId: string;
  action: string;
  description: string;
  userId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ClientDetail {
  client: Client;
  contacts: Contact[];
  activities: Activity[];
}

export interface ClientStats {
  totalClients: number;
  activeClients: number;
  recentlyAdded: number;
  newThisMonth: number;
}
