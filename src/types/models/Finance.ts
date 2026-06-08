export interface FinancialRecord {
  id: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  proposalId?: string;
  title: string;
  description?: string;
  currency: string;
  totalAmount: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  dueDate?: string;
  status: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  clientId?: string;
  clientName?: string;
  projectId?: string;
  invoiceId?: string;
  amount: number;
  currency: string;
  paymentType: string;
  paymentDate: string;
  referenceNumber?: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceActivity {
  id: string;
  clientId?: string;
  action: string;
  description: string;
  performedBy?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface FinanceStats {
  totalRevenue: number;
  revenueThisMonth: number;
  pendingRevenue: number;
  overdueRevenue: number;
  totalPaid: number;
  totalPending: number;
}

export interface ClientFinanceSummary {
  clientId: string;
  clientName?: string;
  totalContractValue: number;
  totalReceived: number;
  remainingBalance: number;
  completionPercentage: number;
  invoices: Invoice[];
  payments: Payment[];
}

export interface InvoiceCreate {
  clientId?: string;
  projectId?: string;
  invoiceNumber: string;
  amount: number;
  currency?: string;
  dueDate?: string;
  status?: string;
  notes?: string;
}

export interface InvoiceUpdate {
  invoiceNumber?: string;
  amount?: number;
  currency?: string;
  dueDate?: string;
  status?: string;
  notes?: string;
}

export interface PaymentCreate {
  clientId?: string;
  projectId?: string;
  invoiceId?: string;
  amount: number;
  currency?: string;
  paymentType?: string;
  paymentDate?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface PaymentUpdate {
  amount?: number;
  currency?: string;
  paymentType?: string;
  paymentDate?: string;
  referenceNumber?: string;
  notes?: string;
}

export interface FinancialRecordCreate {
  clientId?: string;
  projectId?: string;
  proposalId?: string;
  title: string;
  description?: string;
  currency?: string;
  totalAmount: number;
}
