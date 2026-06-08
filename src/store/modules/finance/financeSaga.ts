import { call, put, takeLatest } from "redux-saga/effects";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { apiRequest } from "@/lib/api/axiosInstance";
import type { ApiResponse } from "@/types/api.types";
import type { FinancialRecord, Invoice, Payment, FinanceStats, ClientFinanceSummary, FinanceActivity } from "@/types/models/Finance";
import {
  fetchFinanceStatsRequest,
  fetchFinanceStatsSuccess,
  fetchFinanceStatsFailure,
  fetchFinancialRecordsRequest,
  fetchFinancialRecordsSuccess,
  fetchFinancialRecordsFailure,
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
  fetchFinanceActivitiesRequest,
  fetchFinanceActivitiesSuccess,
  fetchFinanceActivitiesFailure,
} from "./financeSlice";

function* handleFetchStats() {
  try {
    const response: ApiResponse<FinanceStats> = yield call(apiRequest, {
      url: API_ENDPOINTS.finance.stats, method: "GET",
    });
    yield put(fetchFinanceStatsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchFinanceStatsFailure(error.message));
  }
}

function* handleFetchRecords(action: any) {
  try {
    const response: ApiResponse<FinancialRecord[]> = yield call(apiRequest, {
      url: API_ENDPOINTS.finance.records, method: "GET", params: action.payload || {},
    });
    yield put(fetchFinancialRecordsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchFinancialRecordsFailure(error.message));
  }
}

function* handleFetchInvoices(action: any) {
  try {
    const response: ApiResponse<Invoice[]> = yield call(apiRequest, {
      url: API_ENDPOINTS.finance.invoices, method: "GET", params: action.payload || {},
    });
    yield put(fetchInvoicesSuccess(response.data));
  } catch (error: any) {
    yield put(fetchInvoicesFailure(error.message));
  }
}

function* handleCreateInvoice(action: any) {
  try {
    const response: ApiResponse<Invoice> = yield call(apiRequest, {
      url: API_ENDPOINTS.finance.invoices, method: "POST", data: action.payload,
    });
    yield put(createInvoiceSuccess(response.data));
  } catch (error: any) {
    yield put(createInvoiceFailure(error.message));
  }
}

function* handleUpdateInvoice(action: any) {
  try {
    const { id, data } = action.payload;
    const response: ApiResponse<Invoice> = yield call(apiRequest, {
      url: API_ENDPOINTS.finance.invoiceDetail(id), method: "PUT", data,
    });
    yield put(updateInvoiceSuccess(response.data));
  } catch (error: any) {
    yield put(updateInvoiceFailure(error.message));
  }
}

function* handleFetchPayments(action: any) {
  try {
    const response: ApiResponse<Payment[]> = yield call(apiRequest, {
      url: API_ENDPOINTS.finance.payments, method: "GET", params: action.payload || {},
    });
    yield put(fetchPaymentsSuccess(response.data));
  } catch (error: any) {
    yield put(fetchPaymentsFailure(error.message));
  }
}

function* handleCreatePayment(action: any) {
  try {
    const response: ApiResponse<Payment> = yield call(apiRequest, {
      url: API_ENDPOINTS.finance.payments, method: "POST", data: action.payload,
    });
    yield put(createPaymentSuccess(response.data));
  } catch (error: any) {
    yield put(createPaymentFailure(error.message));
  }
}

function* handleFetchClientSummary(action: any) {
  try {
    const response: ApiResponse<ClientFinanceSummary> = yield call(apiRequest, {
      url: API_ENDPOINTS.finance.clientSummary(action.payload), method: "GET",
    });
    yield put(fetchClientFinanceSummarySuccess(response.data));
  } catch (error: any) {
    yield put(fetchClientFinanceSummaryFailure(error.message));
  }
}

function* handleFetchActivities(action: any) {
  try {
    const params = action.payload ? { clientId: action.payload } : {};
    const response: ApiResponse<FinanceActivity[]> = yield call(apiRequest, {
      url: API_ENDPOINTS.finance.activities, method: "GET", params,
    });
    yield put(fetchFinanceActivitiesSuccess(response.data));
  } catch (error: any) {
    yield put(fetchFinanceActivitiesFailure(error.message));
  }
}

export function* financeSaga() {
  yield takeLatest(fetchFinanceStatsRequest.type, handleFetchStats);
  yield takeLatest(fetchFinancialRecordsRequest.type, handleFetchRecords);
  yield takeLatest(fetchInvoicesRequest.type, handleFetchInvoices);
  yield takeLatest(createInvoiceRequest.type, handleCreateInvoice);
  yield takeLatest(updateInvoiceRequest.type, handleUpdateInvoice);
  yield takeLatest(fetchPaymentsRequest.type, handleFetchPayments);
  yield takeLatest(createPaymentRequest.type, handleCreatePayment);
  yield takeLatest(fetchClientFinanceSummaryRequest.type, handleFetchClientSummary);
  yield takeLatest(fetchFinanceActivitiesRequest.type, handleFetchActivities);
}
