import type { User } from "../types/index.js";
import db from "../db.js";

const userToDTO = (user: typeof db.User): User => {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
};

export { userToDTO };
