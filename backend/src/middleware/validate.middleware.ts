import { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";
import { sendError } from "../utils/response";

// ─── Zod Request Validation Middleware ─────────────────────
// Validates req.body, req.query, or req.params against a Zod schema

interface ValidationSchemas {
  body?: z.ZodType;
  query?: z.ZodType;
  params?: z.ZodType;
}

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: Record<string, string[]> = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);
      if (!result.success) {
        errors.body = result.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`
        );
      } else {
        req.body = result.data;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);
      if (!result.success) {
        errors.query = result.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`
        );
      } else {
        req.query = result.data as any;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);
      if (!result.success) {
        errors.params = result.error.issues.map(
          (issue) => `${issue.path.join(".")}: ${issue.message}`
        );
      }
    }

    if (Object.keys(errors).length > 0) {
      sendError(res, "Validation failed", 400, errors);
      return;
    }

    next();
  };
}
