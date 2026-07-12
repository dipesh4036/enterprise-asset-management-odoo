"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const v4_1 = require("zod/v4");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// ─── Validate all env variables on startup ─────────────────
const envSchema = v4_1.z.object({
    DATABASE_URL: v4_1.z.string().min(1, "DATABASE_URL is required"),
    JWT_SECRET: v4_1.z.string().min(8, "JWT_SECRET must be at least 8 characters"),
    JWT_EXPIRES_IN: v4_1.z.string().default("7d"),
    PORT: v4_1.z.coerce.number().default(5000),
    NODE_ENV: v4_1.z.enum(["development", "production", "test"]).default("development"),
    FRONTEND_URL: v4_1.z.string().url().default("http://localhost:3000"),
});
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
    console.error("❌ Invalid environment variables:");
    console.error(parsed.error.format());
    process.exit(1);
}
exports.env = parsed.data;
//# sourceMappingURL=env.js.map