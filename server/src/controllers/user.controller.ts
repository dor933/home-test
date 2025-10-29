import { Request, Response } from "express";
import db from "../db.js";

export class UserController {
  async listRequesters(req: Request, res: Response): Promise<Response> {
    try {
      const requesters = await db.User.findAll({
        attributes: ["name", "email", "role"],
        order: [["name", "ASC"]],
        where: {
          role: "Requester",
        },
      });

      return res.json({
        success: true,
        data: requesters,
      });
    } catch (error: any) {
      console.error("Error fetching users:", error);
      return res.status(500).json({
        success: false,
        error: "Failed to fetch requesters",
      });
    }
  }
}
