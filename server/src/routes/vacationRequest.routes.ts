import { Router } from "express";
import { VacationRequestController } from "../controllers/vacationRequest.controller.js";

const router = Router();
const controller = new VacationRequestController();

// POST /requests - Submit a new vacation request
router.post("/", controller.create);

// GET /requests - Retrieve vacation requests
router.get("/", controller.list);

// PATCH /requests/:id - Approve or reject a request
router.post("/handle-request", controller.handleRequest);

export default router;
