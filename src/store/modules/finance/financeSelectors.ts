import type { RootState } from "@/store";

export const selectFinanceStats = (state: RootState) => state.finance.stats;
export const selectFinanceRecords = (state: RootState) => state.finance.records;
export const selectFinanceInvoices = (state: RootState) => state.finance.invoices;
export const selectFinancePayments = (state: RootState) => state.finance.payments;
export const selectFinanceActivities = (state: RootState) => state.finance.activities;
export const selectClientFinanceSummary = (state: RootState) => state.finance.clientSummary;
export const selectFinanceLoading = (state: RootState) => state.finance.loading;
export const selectFinanceError = (state: RootState) => state.finance.error;
