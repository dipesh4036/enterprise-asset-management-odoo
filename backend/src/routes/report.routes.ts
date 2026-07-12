import { Router } from "express";

const router = Router();

// Placeholder for Reports module
router.get("/utilization", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Utilization reports placeholder",
    data: [],
  });
});

export default router;
