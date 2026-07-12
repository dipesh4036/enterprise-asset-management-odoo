import { Router } from "express";

const router = Router();

// Placeholder for Audit module
router.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Audit API placeholder",
    data: [],
  });
});

export default router;
