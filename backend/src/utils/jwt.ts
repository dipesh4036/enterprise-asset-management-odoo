import jwt from "jsonwebtoken";
import { env } from "../config/env";

// ─── JWT Utilities ─────────────────────────────────────────

interface TokenPayload {
  userId: string;
  role: string;
}

export function signToken(userId: string, role: string): string {
  const payload = { userId, role };
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as TokenPayload;
}
