import { Request, Response, NextFunction } from "express";
import { getSupabase } from "../lib/supabase.js";
import prisma from "../lib/prisma.js";

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  const token = authHeader.substring(7);
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.auth.getUser(token);
    if (error || !data.user) {
      res.status(401).json({ success: false, error: "Invalid token" });
      return;
    }
    let user = await prisma.user.findUnique({
      where: { id: data.user.id },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: data.user.id,
          email: data.user.email || "",
          wallet: {
            create: {
              balance: 0,
            },
          },
        },
      });
    }
    req.userId = user.id;
    req.userEmail = user.email;
    next();
  } catch {
    res.status(401).json({ success: false, error: "Authentication failed" });
  }
}

export function adminMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  if (!req.userEmail || !adminEmails.includes(req.userEmail)) {
    res.status(403).json({ success: false, error: "Forbidden" });
    return;
  }
  next();
}
