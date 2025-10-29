export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface User {
  name: string;
  role: "Requester" | "Validator";
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface VacationRequest {
  startDate: string;
  endDate: string;
  reason?: string;
  status: "Pending" | "Approved" | "Rejected";
  comments?: string;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
}

export interface CreateVacationRequestDTO {
  userEmail: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface UpdateVacationRequestDTO {
  userEmail: string;
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  reason?: string | null;
  comments?: string | null;
}
