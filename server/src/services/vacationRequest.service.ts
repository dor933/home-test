import db from "../db.js";
import type {
  CreateVacationRequestDTO,
  UpdateVacationRequestDTO,
} from "../types/index.js";
import { vacationRequestToDTO } from "../mappers/VacationRequest.js";
import { Op } from "sequelize";

export class VacationRequestService {
  private vacationRequest: typeof db.VacationRequest;
  private user: typeof db.User;

  constructor() {
    this.vacationRequest = db.VacationRequest;
    this.user = db.User;
  }

  async createRequest(data: CreateVacationRequestDTO) {
    // Validate that user exists
    const user = await this.user.findOne({ where: { email: data.userEmail } });
    if (!user) {
      throw new Error("User not found");
    }

    console.log("user", user);

    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (endDate < startDate) {
      throw new Error("End date must be after start date");
    }

    const existingRequest = await this.vacationRequest.findOne({
      where: {
        user_id: user.id,
        start_date: { [Op.eq]: startDate },
        end_date: { [Op.eq]: endDate },
      },
    });
    if (existingRequest) {
      throw new Error("Request already exists for this user in this date");
    }

    const request = await this.vacationRequest.create({
      user_id: user.id,
      start_date: data.startDate,
      end_date: data.endDate,
      reason: data.reason || null,
      status: "Pending",
    });

    return vacationRequestToDTO(request, user);
  }

  async getAllRequests(userEmail?: string, status?: string) {
    let where: any = {};
    if (userEmail) {
      const user = await this.user.findOne({ where: { email: userEmail } });
      if (!user) {
        throw new Error("User not found");
      }
      where.user_id = user.id;
    }
    if (status) {
      where.status = status;
    }
    const requests = await this.vacationRequest.findAll({
      where,
      include: [
        {
          model: this.user,
          as: "user",
          attributes: ["id", "name", "role", "email"],
        },
      ],
    });

    return requests.map((request: typeof db.VacationRequest) =>
      vacationRequestToDTO(request, request.user as typeof db.User)
    );
  }

  async handleRequest(data: UpdateVacationRequestDTO) {
    const user = await this.user.findOne({ where: { email: data.userEmail } });
    if (!user) {
      throw new Error("User not found");
    }
    const request = await this.vacationRequest.findOne({
      where: {
        user_id: user.id,
        //compare only the date, not the time
        start_date: {
          [Op.eq]: new Date(data.startDate).toISOString().split("T")[0],
        },
        end_date: {
          [Op.eq]: new Date(data.endDate).toISOString().split("T")[0],
        },
      },
      include: [
        {
          model: this.user,
          as: "user",
          attributes: ["id", "name", "role", "email"],
        },
      ],
    });

    if (!request) {
      throw new Error("Vacation request not found");
    }

    await this.vacationRequest.update(
      {
        reason: data.reason || null,
        comments: data.comments || null,
        status: data.status,
      },
      {
        where: {
          user_id: user.id,
          start_date: {
            [Op.eq]: new Date(data.startDate).toISOString().split("T")[0],
          },
          end_date: {
            [Op.eq]: new Date(data.endDate).toISOString().split("T")[0],
          },
        },
      }
    );

    // Reload the request to get updated values
    await request.reload();

    return vacationRequestToDTO(request, user);
  }

  async deleteRequest(id: string) {
    const deleted = await this.vacationRequest.destroy({ where: { id } });
    return deleted > 0;
  }
}
