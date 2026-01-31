import { Request, Response, NextFunction } from "express";

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error("Error:", error.message);
  res.status(500).json({
    success: false,
    error: "Internal server error",
  });
}
