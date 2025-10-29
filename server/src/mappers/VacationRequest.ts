import type { VacationRequest } from "../types/index.js";
import db from "../db.js";
import { userToDTO } from "./User.js";

const vacationRequestToDTO = (
  vacationRequest: typeof db.VacationRequest,
  user: typeof db.User
): VacationRequest => {
  return {
    startDate: vacationRequest.start_date,
    endDate: vacationRequest.end_date,
    reason: vacationRequest.reason,
    status: vacationRequest.status,
    comments: vacationRequest.comments,
    createdAt: vacationRequest.created_at,
    updatedAt: vacationRequest.updated_at,
    user: userToDTO(user),
  };
};

export { vacationRequestToDTO };
