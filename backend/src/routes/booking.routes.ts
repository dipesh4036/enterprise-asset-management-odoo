import { Router } from "express";
import {
  getBookings,
  createBooking,
  cancelBooking,
  rescheduleBooking,
} from "../controllers/booking.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { createBookingSchema, rescheduleBookingSchema } from "../validators/booking.validator";

const router = Router();

// Apply auth middleware
router.use(authMiddleware);

// ─── Resource Booking Routes ────────────────────────────────
router.get("/", getBookings);

router.post(
  "/",
  validate({ body: createBookingSchema }),
  createBooking
);

router.patch(
  "/:id/cancel",
  cancelBooking
);

router.patch(
  "/:id/reschedule",
  validate({ body: rescheduleBookingSchema }),
  rescheduleBooking
);

export default router;
