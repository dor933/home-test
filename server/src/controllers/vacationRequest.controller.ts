import type { Request, Response } from "express";
import { VacationRequestService } from "../services/vacationRequest.service.js";
import type { ApiResponse } from "../types/index.js";
import {
  createVacationRequestSchema,
  updateVacationRequestSchema,
} from "../utils/validation.js";

export class VacationRequestController {
  private service: VacationRequestService;

  constructor() {
    this.service = new VacationRequestService();
  }

  create = async (req: Request, res: Response) => {
    try {
      console.log("req.body in create", req.body);
      const validatedData = createVacationRequestSchema.parse(req.body);
      console.log("validatedData", validatedData);
      const request = await this.service.createRequest(validatedData);

      const response: ApiResponse = {
        success: true,
        data: request,
        message: "Vacation request created successfully",
      };

      res.status(201).json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: "Failed to create vacation request - " + error.message,
      };
      res.status(400).json(response);
    }
  };

  list = async (req: Request, res: Response) => {
    try {
      const { userEmail, status } = req.query;

      const requests = await this.service.getAllRequests(
        userEmail as string | undefined,
        status as string | undefined
      );

      const response: ApiResponse = {
        success: true,
        data: requests,
      };

      res.json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: error.message || "Failed to retrieve vacation requests",
      };
      res.status(500).json(response);
    }
  };

  handleRequest = async (req: Request, res: Response) => {
    try {
      const { userEmail, startDate, endDate, reason, comments, status } =
        req.body;
      const validatedData = updateVacationRequestSchema.parse({
        userEmail,
        startDate,
        endDate,
        reason,
        comments,
        status,
      });

      const request = await this.service.handleRequest(validatedData);

      const response: ApiResponse = {
        success: true,
        data: request,
        message: "Vacation request updated successfully",
      };

      res.json(response);
    } catch (error: any) {
      const response: ApiResponse = {
        success: false,
        error: "Failed to update vacation request - " + error.message,
      };
      res.status(400).json(response);
    }
  };
}
