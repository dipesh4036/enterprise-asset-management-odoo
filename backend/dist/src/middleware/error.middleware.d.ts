import { Request, Response, NextFunction } from "express";
interface AppError extends Error {
    statusCode?: number;
    isOperational?: boolean;
}
export declare function errorMiddleware(err: AppError, _req: Request, res: Response, _next: NextFunction): void;
export declare function notFoundMiddleware(req: Request, res: Response, _next: NextFunction): void;
type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function asyncHandler(fn: AsyncHandler): (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=error.middleware.d.ts.map