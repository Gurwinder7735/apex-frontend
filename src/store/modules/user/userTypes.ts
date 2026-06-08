import type { User } from "@/types/models/User";

export interface UserState {
  users: User[];
  isLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
}

export interface UsersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}
