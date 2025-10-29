import { z } from "zod";

export const createVacationRequestSchema = z
  .object({
    userEmail: z.string().email("User email must be a valid email"),
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
    endDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
    reason: z.string().optional(),
  })
  .refine(
    (data) => {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      return end >= start;
    },
    {
      message: "End date must be on or after start date",
    }
  );

export const updateVacationRequestSchema = z.object({
  userEmail: z.string().email("User email must be a valid email"),
  startDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Start date must be in YYYY-MM-DD format"),
  endDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "End date must be in YYYY-MM-DD format"),
  reason: z.string().optional(),
  comments: z.string().optional(),
  status: z.enum(["Pending", "Approved", "Rejected"]),
});

export const queryParamsSchema = z.object({
  userEmail: z.string().email().optional(),
  status: z.enum(["Pending", "Approved", "Rejected"]).optional(),
});
