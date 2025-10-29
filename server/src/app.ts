import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import vacationRequestRoutes from "./routes/vacationRequest.routes.js";
import userRoutes from "./routes/user.routes.js";
import { Request, Response, NextFunction } from "express";

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/health", (_: Request, res: Response) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

app.use("/users", userRoutes);
app.use("/requests", vacationRequestRoutes);

// 404 handler
app.use((_: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  console.error("Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });
});

export default app;
