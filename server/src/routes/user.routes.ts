import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";

const router = Router();
const controller = new UserController();

// GET /users - Retrieve all users
router.get("/requesters", controller.listRequesters);

export default router;
