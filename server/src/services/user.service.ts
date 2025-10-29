import db from "../db.js";
import { userToDTO } from "../mappers/User.js";

export class UserService {
  private user: typeof db.User;

  constructor() {
    this.user = db.User;
  }

  async listRequesters() {
    const requesters = await db.User.findAll({
      attributes: ["id", "name", "email", "role"],
      order: [["name", "ASC"]],
      where: {
        role: "Requester",
      },
    });

    return requesters.map(userToDTO);
  }
}
