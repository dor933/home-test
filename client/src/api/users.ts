import apiClient from "./client";
import type { User, ApiResponse } from "../types";

export const usersAPI = {
  async getRequesters(): Promise<ApiResponse<User[]>> {
    const response = await apiClient.get<ApiResponse<User[]>>(
      "/users/requesters"
    );
    return response.data;
  },
};
