export interface User {
  name: string;
  role: "Requester" | "Validator";
  email?: string;
}

export interface VacationRequest {
  startDate: string;
  endDate: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  comments?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface CreateVacationRequest {
  userEmail: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateVacationRequest {
  userEmail: string;
  startDate: string;
  endDate: string;
  reason?: string;
  comments?: string;
  status: "Pending" | "Approved" | "Rejected";
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
