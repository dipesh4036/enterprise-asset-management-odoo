import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import { env } from "./config/env";
import { API_PREFIX } from "./config/constants";
import { errorMiddleware, notFoundMiddleware } from "./middleware/error.middleware";
import logger from "./utils/logger";
import routes from "./routes/index";

// ─── Express App Setup ─────────────────────────────────────

const app = express();

// ─── Security Middleware ───────────────────────────────────

// Helmet — security headers
app.use(helmet());

// CORS — allow frontend origin
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Rate Limiter — prevent abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later.",
    data: null,
    errors: null,
    timestamp: new Date().toISOString(),
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// ─── Body Parsing ──────────────────────────────────────────

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// ─── Request Logging ───────────────────────────────────────

if (env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ─── Health Check ──────────────────────────────────────────

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
  });
});

// ─── API Routes ────────────────────────────────────────────

app.use(API_PREFIX, routes);

// ─── Error Handling ────────────────────────────────────────

app.use(notFoundMiddleware);
app.use(errorMiddleware);

// ─── Start Server ──────────────────────────────────────────

app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on http://localhost:${env.PORT}`);
  logger.info(`📡 API available at http://localhost:${env.PORT}${API_PREFIX}`);
  logger.info(`🌍 Environment: ${env.NODE_ENV}`);
});

export default app;
