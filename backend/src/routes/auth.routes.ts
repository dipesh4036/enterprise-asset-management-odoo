import { Router } from "express";
import { signup, login, getMe, logout } from "../controllers/auth.controller";
import { validate } from "../middleware/validate.middleware";
import { authMiddleware } from "../middleware/auth.middleware";
import { signupSchema, loginSchema } from "../validators/auth.validator";

const router = Router();

// ─── Public Auth Routes ────────────────────────────────────

router.post("/signup", validate({ body: signupSchema }), signup);
router.post("/login", validate({ body: loginSchema }), login);
router.post("/logout", logout);

// ─── Protected Auth Routes ──────────────────────────────────

router.get("/me", authMiddleware, getMe);

export default router;
