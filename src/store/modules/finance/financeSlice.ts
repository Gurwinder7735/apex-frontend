import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { FinancialRecord, Invoice, Payment, FinanceActivity, FinanceStats, ClientFinanceSummary } from "@/types/models/Finance";

interface FinanceState {
  records: FinancialRecord[];
  invoices: Invoice[];
  payments: Payment[];
  activities: FinanceActivity[];
  stats: FinanceStats | null;
  clientSummary: ClientFinanceSummary | null;
  loading: boolean;
  recordsLoading: boolean;
  invoicesLoading: boolean;
  paymentsLoading: boolean;
  error: string | null;
}

const initialState: FinanceState = {
  records: [],
  invoices: [],
  payments: [],
  activities: [],
  stats: null,
  clientSummary: null,
  loading: false,
  recordsLoading: false,
  invoicesLoading: false,
  paymentsLoading: false,
  error: null,
};

type RecordsQuery = { clientId?: string; projectId?: string };
type InvoicesQuery = { clientId?: string; projectId?: string; status?: string; skip?: number; limit?: number };
type PaymentsQuery = { clientId?: string; projectId?: string; skip?: number; limit?: number };

const financeSlice = createSlice({
  name: "finance",
  initialState,
  reducers: {
    fetchFinanceStatsRequest(state, _action: PayloadAction<void>) { state.loading = true; state.error = null; },
    fetchFinanceStatsSuccess(state, action: PayloadAction<FinanceStats>) { state.loading = false; state.stats = action.payload; },
    fetchFinanceStatsFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    fetchFinancialRecordsRequest(state, _action: PayloadAction<RecordsQuery | undefined>) { state.recordsLoading = true; state.error = null; },
    fetchFinancialRecordsSuccess(state, action: PayloadAction<FinancialRecord[]>) { state.recordsLoading = false; state.records = action.payload; },
    fetchFinancialRecordsFailure(state, action: PayloadAction<string>) { state.recordsLoading = false; state.error = action.payload; },

    createFinancialRecordRequest(state, _action: PayloadAction<{ title: string; totalAmount: number; clientId?: string; description?: string; currency?: string }>) { state.loading = true; state.error = null; },
    createFinancialRecordSuccess(state, action: PayloadAction<FinancialRecord>) { state.loading = false; state.records.unshift(action.payload); },
    createFinancialRecordFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    updateFinancialRecordRequest(state, _action: PayloadAction<{ id: string; data: Partial<FinancialRecord> }>) { state.loading = true; state.error = null; },
    updateFinancialRecordSuccess(state, action: PayloadAction<FinancialRecord>) { state.loading = false; const idx = state.records.findIndex((r) => r.id === action.payload.id); if (idx >= 0) state.records[idx] = action.payload; },
    updateFinancialRecordFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    fetchInvoicesRequest(state, _action: PayloadAction<InvoicesQuery | undefined>) { state.invoicesLoading = true; state.error = null; },
    fetchInvoicesSuccess(state, action: PayloadAction<Invoice[]>) { state.invoicesLoading = false; state.invoices = action.payload; },
    fetchInvoicesFailure(state, action: PayloadAction<string>) { state.invoicesLoading = false; state.error = action.payload; },

    createInvoiceRequest(state, _action: PayloadAction<{ invoiceNumber: string; amount: number; clientId?: string; currency?: string; dueDate?: string; status?: string; notes?: string }>) { state.loading = true; state.error = null; },
    createInvoiceSuccess(state, action: PayloadAction<Invoice>) { state.loading = false; state.invoices.unshift(action.payload); },
    createInvoiceFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    updateInvoiceRequest(state, _action: PayloadAction<{ id: string; data: { status?: string; amount?: number; dueDate?: string; notes?: string } }>) { state.loading = true; state.error = null; },
    updateInvoiceSuccess(state, action: PayloadAction<Invoice>) { state.loading = false; const idx = state.invoices.findIndex((i) => i.id === action.payload.id); if (idx >= 0) state.invoices[idx] = action.payload; },
    updateInvoiceFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    fetchPaymentsRequest(state, _action: PayloadAction<PaymentsQuery | undefined>) { state.paymentsLoading = true; state.error = null; },
    fetchPaymentsSuccess(state, action: PayloadAction<Payment[]>) { state.paymentsLoading = false; state.payments = action.payload; },
    fetchPaymentsFailure(state, action: PayloadAction<string>) { state.paymentsLoading = false; state.error = action.payload; },

    createPaymentRequest(state, _action: PayloadAction<{ amount: number; clientId?: string; invoiceId?: string; currency?: string; paymentType?: string; paymentDate?: string; referenceNumber?: string; notes?: string }>) { state.loading = true; state.error = null; },
    createPaymentSuccess(state, action: PayloadAction<Payment>) { state.loading = false; state.payments.unshift(action.payload); },
    createPaymentFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },

    fetchClientFinanceSummaryRequest(state, _action: PayloadAction<string>) { state.loading = true; state.error = null; },
    fetchClientFinanceSummarySuccess(state, action: PayloadAction<ClientFinanceSummary>) { state.loading = false; state.clientSummary = action.payload; },
    fetchClientFinanceSummaryFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },
    clearClientFinanceSummary(state) { state.clientSummary = null; },

    fetchFinanceActivitiesRequest(state, _action: PayloadAction<string | undefined>) { state.loading = true; state.error = null; },
    fetchFinanceActivitiesSuccess(state, action: PayloadAction<FinanceActivity[]>) { state.loading = false; state.activities = action.payload; },
    fetchFinanceActivitiesFailure(state, action: PayloadAction<string>) { state.loading = false; state.error = action.payload; },
  },
});

export const {
  fetchFinanceStatsRequest,
  fetchFinanceStatsSuccess,
  fetchFinanceStatsFailure,
  fetchFinancialRecordsRequest,
  fetchFinancialRecordsSuccess,
  fetchFinancialRecordsFailure,
  createFinancialRecordRequest,
  createFinancialRecordSuccess,
  createFinancialRecordFailure,
  updateFinancialRecordRequest,
  updateFinancialRecordSuccess,
  updateFinancialRecordFailure,
  fetchInvoicesRequest,
  fetchInvoicesSuccess,
  fetchInvoicesFailure,
  createInvoiceRequest,
  createInvoiceSuccess,
  createInvoiceFailure,
  updateInvoiceRequest,
  updateInvoiceSuccess,
  updateInvoiceFailure,
  fetchPaymentsRequest,
  fetchPaymentsSuccess,
  fetchPaymentsFailure,
  createPaymentRequest,
  createPaymentSuccess,
  createPaymentFailure,
  fetchClientFinanceSummaryRequest,
  fetchClientFinanceSummarySuccess,
  fetchClientFinanceSummaryFailure,
  clearClientFinanceSummary,
  fetchFinanceActivitiesRequest,
  fetchFinanceActivitiesSuccess,
  fetchFinanceActivitiesFailure,
} = financeSlice.actions;

export default financeSlice.reducer;
