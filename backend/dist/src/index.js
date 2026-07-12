"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const morgan_1 = __importDefault(require("morgan"));
const env_1 = require("./config/env");
const constants_1 = require("./config/constants");
const error_middleware_1 = require("./middleware/error.middleware");
const logger_1 = __importDefault(require("./utils/logger"));
const index_1 = __importDefault(require("./routes/index"));
// ─── Express App Setup ─────────────────────────────────────
const app = (0, express_1.default)();
// ─── Security Middleware ───────────────────────────────────
// Helmet — security headers
app.use((0, helmet_1.default)());
// CORS — allow frontend origin
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
// Rate Limiter — prevent abuse
const limiter = (0, express_rate_limit_1.default)({
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
app.use(express_1.default.json({ limit: "10mb" }));
// Parse URL-encoded bodies
app.use(express_1.default.urlencoded({ extended: true }));
// ─── Request Logging ───────────────────────────────────────
if (env_1.env.NODE_ENV === "development") {
    app.use((0, morgan_1.default)("dev"));
}
// ─── Health Check ──────────────────────────────────────────
app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        environment: env_1.env.NODE_ENV,
    });
});
// ─── API Routes ────────────────────────────────────────────
app.use(constants_1.API_PREFIX, index_1.default);
// ─── Error Handling ────────────────────────────────────────
app.use(error_middleware_1.notFoundMiddleware);
app.use(error_middleware_1.errorMiddleware);
// ─── Start Server ──────────────────────────────────────────
app.listen(env_1.env.PORT, () => {
    logger_1.default.info(`🚀 Server running on http://localhost:${env_1.env.PORT}`);
    logger_1.default.info(`📡 API available at http://localhost:${env_1.env.PORT}${constants_1.API_PREFIX}`);
    logger_1.default.info(`🌍 Environment: ${env_1.env.NODE_ENV}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map