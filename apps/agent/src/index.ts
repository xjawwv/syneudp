import "dotenv/config";
import express, { Request, Response, NextFunction } from "express";
import { z } from "zod";
import * as mysql from "./mysql.js";
import * as postgres from "./postgres.js";
import crypto from "crypto";

const app = express();
app.use(express.json());

const AGENT_TOKEN = process.env.AGENT_TOKEN || "";

function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.headers["x-agent-token"];
  if (!token || token !== AGENT_TOKEN) {
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }
  next();
}

app.use(authMiddleware);

const EngineSchema = z.enum(["mysql", "postgresql"]);

const ProvisionSchema = z.object({
  engine: EngineSchema,
  dbName: z.string().min(1).max(64),
  dbUser: z.string().min(1).max(32),
});

const ActionSchema = z.object({
  engine: EngineSchema,
  dbName: z.string().min(1).max(64),
  dbUser: z.string().min(1).max(32),
});

function generatePassword(length: number = 24): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.randomBytes(length);
  let password = "";
  for (let i = 0; i < length; i++) {
    password += chars[bytes[i] % chars.length];
  }
  return password;
}

app.post("/provision", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = ProvisionSchema.parse(req.body);
    const password = generatePassword();
    if (parsed.engine === "mysql") {
      await mysql.createDatabaseAndUser(parsed.dbName, parsed.dbUser, password);
    } else {
      await postgres.createDatabaseAndUser(parsed.dbName, parsed.dbUser, password);
    }
    res.json({ success: true, password });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});

app.post("/suspend", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = ActionSchema.parse(req.body);
    if (parsed.engine === "mysql") {
      await mysql.suspendUser(parsed.dbName, parsed.dbUser);
    } else {
      await postgres.suspendUser(parsed.dbName, parsed.dbUser);
    }
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});

app.post("/resume", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = ActionSchema.parse(req.body);
    if (parsed.engine === "mysql") {
      await mysql.resumeUser(parsed.dbName, parsed.dbUser);
    } else {
      await postgres.resumeUser(parsed.dbName, parsed.dbUser);
    }
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});

app.post("/terminate", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = ActionSchema.parse(req.body);
    if (parsed.engine === "mysql") {
      await mysql.terminateDatabase(parsed.dbName, parsed.dbUser);
    } else {
      await postgres.terminateDatabase(parsed.dbName, parsed.dbUser);
    }
    res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});

app.post("/rotate-password", async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = ActionSchema.parse(req.body);
    const newPassword = generatePassword();
    if (parsed.engine === "mysql") {
      await mysql.rotatePassword(parsed.dbUser, newPassword);
    } else {
      await postgres.rotatePassword(parsed.dbUser, newPassword);
    }
    res.json({ success: true, newPassword });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({ success: false, error: message });
  }
});

app.get("/health", (_req: Request, res: Response): void => {
  res.json({ status: "ok" });
});

const PORT = parseInt(process.env.PORT || "4001");
app.listen(PORT, () => {
  console.log(`Agent running on port ${PORT}`);
});
