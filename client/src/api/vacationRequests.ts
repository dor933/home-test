import apiClient from "./client";
import type {
  CreateVacationRequest,
  UpdateVacationRequest,
  VacationRequest,
  ApiResponse,
} from "../types";

export const vacationRequestsAPI = {
  async create(
    data: CreateVacationRequest
  ): Promise<ApiResponse<VacationRequest>> {
    const response = await apiClient.post<ApiResponse<VacationRequest>>(
      "/requests",
      data
    );
    return response.data;
  },

  async getAll(
    params: { userEmail?: string; status?: string } = {}
  ): Promise<ApiResponse<VacationRequest[]>> {
    const response = await apiClient.get<ApiResponse<VacationRequest[]>>(
      "/requests",
      { params }
    );
    return response.data;
  },

  async handleRequest(
    data: UpdateVacationRequest
  ): Promise<ApiResponse<VacationRequest>> {
    const response = await apiClient.post<ApiResponse<VacationRequest>>(
      `/requests/handle-request`,
      data
    );
    return response.data;
  },
};
