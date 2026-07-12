import { Request, Response, NextFunction } from "express";
import { z } from "zod/v4";
interface ValidationSchemas {
    body?: z.ZodType;
    query?: z.ZodType;
    params?: z.ZodType;
}
export declare function validate(schemas: ValidationSchemas): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=validate.middleware.d.ts.map