export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: unknown;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error?: unknown;
}

export interface PaginatedResponse<T> {
  success: true;
  message: string;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
