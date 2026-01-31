import { Router, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import prisma from "../lib/prisma.js";
import { encrypt, decrypt } from "../lib/encryption.js";
import * as agent from "../lib/agent.js";
import crypto from "crypto";

const router = Router();

const CreateInstanceSchema = z.object({
  productId: z.string().min(1),
  name: z.string({ required_error: "Database Name is required" }).min(1, "Database Name cannot be empty"),
  storageSize: z.number().min(1).default(1),
  allowedIPs: z.union([z.string(), z.array(z.string())]).optional(),
});

const AllowedIPsSchema = z.object({
  allowedIPs: z.union([z.string(), z.array(z.string())]),
});

function generateDbName(): string {
  return `db_${crypto.randomBytes(4).toString("hex")}`;
}

function generateDbUser(): string {
  return `user_${crypto.randomBytes(4).toString("hex")}`;
}

router.post(
  "/",
  validate(CreateInstanceSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { productId, name, storageSize, allowedIPs } = req.body;
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) {
        res.status(404).json({ success: false, error: "Product not found" });
        return;
      }
      
      // Calculate rate based on storage: Rp 5.500/GB/month / 730 hours
      const ratePerHour = storageSize * (5500 / 730);

      // Check wallet balance
      const user = await prisma.user.findUnique({
        where: { id: req.userId },
        include: { wallet: true },
      });

      if (!user?.wallet || Number(user.wallet.balance) < ratePerHour) {
        res.status(400).json({
          success: false,
          error: `Insufficient balance. Minimum balance required to rent per hour: Rp ${ratePerHour.toLocaleString('id-ID', { maximumFractionDigits: 2 })}`,
        });
        return;
      }
      
      // Process Allowed IPs (Comma supported)
      let ips: string[] = [];
      if (typeof allowedIPs === "string") {
        ips = allowedIPs.split(",").map((ip: string) => ip.trim()).filter((ip: string) => ip.length > 0);
      } else if (Array.isArray(allowedIPs)) {
        ips = allowedIPs;
      }

      const dbName = generateDbName();
      const dbUser = generateDbUser();
      const host = process.env.DB_HOST || "localhost";
      const port = product.engine === "mysql" ? 3306 : (product.engine === "postgresql" ? 5433 : 27017);
      const instance = await prisma.instance.create({
        data: {
          userId: req.userId!,
          productId,
          name, 
          engine: product.engine,
          status: "provisioning",
          storageSize,
          ratePerHour,
          dbName,
          dbUser,
          dbPasswordEncrypted: "",
          host,
          port,
          allowedIPs: ips.length > 0
            ? { create: ips.map((ip: string) => ({ ip })) }
            : undefined,
        },
      });
      const agentResponse = await agent.provisionDatabase(product.engine, dbName, dbUser);
      if (!agentResponse.success || !agentResponse.password) {
        await prisma.instance.update({
          where: { id: instance.id },
          data: { status: "error" },
        });
        res.status(500).json({ success: false, error: agentResponse.error || "Provisioning failed" });
        return;
      }
      const encryptedPassword = encrypt(agentResponse.password);
      await prisma.instance.update({
        where: { id: instance.id },
        data: { status: "running", dbPasswordEncrypted: encryptedPassword },
      });
      res.json({
        success: true,
        data: {
          id: instance.id,
          engine: instance.engine,
          status: "running",
          host,
          port,
          dbName,
          dbUser,
          password: agentResponse.password,
          createdAt: instance.createdAt,
        },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ success: false, error: message });
    }
  }
);

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instances = await prisma.instance.findMany({
      where: { userId: req.userId },
      include: { product: true },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      success: true,
      data: instances.map((i: (typeof instances)[number]) => ({
        id: i.id,
        name: i.name,
        engine: i.engine,
        status: i.status,
        dbName: i.dbName,
        host: i.host,
        port: i.port,
        ratePerHour: Number(i.ratePerHour),
        storageSize: i.storageSize,
        productName: i.product.name,
        createdAt: i.createdAt,
        terminatedAt: i.terminatedAt,
      })),
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to get instances" });
  }
});

router.get("/:id", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instance = await prisma.instance.findFirst({
      where: { id: req.params.id, userId: req.userId },
      include: { product: true, allowedIPs: true },
    });
    if (!instance) {
      res.status(404).json({ success: false, error: "Instance not found" });
      return;
    }
    let password = "";
    if (instance.dbPasswordEncrypted) {
      try {
        password = decrypt(instance.dbPasswordEncrypted);
      } catch {
        password = "";
      }
    }
    res.json({
      success: true,
      data: {
        id: instance.id,
        name: instance.name,
        engine: instance.engine,
        status: instance.status,
        dbName: instance.dbName,
        dbUser: instance.dbUser,
        password,
        host: instance.host,
        port: instance.port,
        ratePerHour: Number(instance.ratePerHour),
        storageSize: instance.storageSize,
        productName: instance.product.name,
        allowedIPs: instance.allowedIPs.map((ip: (typeof instance.allowedIPs)[number]) => ip.ip),
        createdAt: instance.createdAt,
        terminatedAt: instance.terminatedAt,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to get instance" });
  }
});

router.post("/:id/suspend", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instance = await prisma.instance.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!instance) {
      res.status(404).json({ success: false, error: "Instance not found" });
      return;
    }
    if (instance.status !== "running") {
      res.status(400).json({ success: false, error: "Instance is not running" });
      return;
    }
    const agentResponse = await agent.suspendDatabase(instance.engine, instance.dbName, instance.dbUser);
    if (!agentResponse.success) {
      res.status(500).json({ success: false, error: agentResponse.error || "Suspend failed" });
      return;
    }
    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: "suspended" },
    });
    res.json({ success: true, message: "Instance suspended" });
  } catch {
    res.status(500).json({ success: false, error: "Failed to suspend instance" });
  }
});

router.post("/:id/resume", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instance = await prisma.instance.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!instance) {
      res.status(404).json({ success: false, error: "Instance not found" });
      return;
    }
    if (instance.status !== "suspended") {
      res.status(400).json({ success: false, error: "Instance is not suspended" });
      return;
    }
    const agentResponse = await agent.resumeDatabase(instance.engine, instance.dbName, instance.dbUser);
    if (!agentResponse.success) {
      res.status(500).json({ success: false, error: agentResponse.error || "Resume failed" });
      return;
    }
    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: "running" },
    });
    res.json({ success: true, message: "Instance resumed" });
  } catch {
    res.status(500).json({ success: false, error: "Failed to resume instance" });
  }
});

router.post("/:id/terminate", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instance = await prisma.instance.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!instance) {
      res.status(404).json({ success: false, error: "Instance not found" });
      return;
    }
    if (instance.status === "terminated") {
      res.status(400).json({ success: false, error: "Instance already terminated" });
      return;
    }
    const agentResponse = await agent.terminateDatabase(instance.engine, instance.dbName, instance.dbUser);
    if (!agentResponse.success) {
      res.status(500).json({ success: false, error: agentResponse.error || "Terminate failed" });
      return;
    }
    await prisma.instance.update({
      where: { id: instance.id },
      data: { status: "terminated", terminatedAt: new Date() },
    });
    res.json({ success: true, message: "Instance terminated" });
  } catch {
    res.status(500).json({ success: false, error: "Failed to terminate instance" });
  }
});

router.post("/:id/rotate-password", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const instance = await prisma.instance.findFirst({
      where: { id: req.params.id, userId: req.userId },
    });
    if (!instance) {
      res.status(404).json({ success: false, error: "Instance not found" });
      return;
    }
    if (instance.status === "terminated") {
      res.status(400).json({ success: false, error: "Instance is terminated" });
      return;
    }
    const agentResponse = await agent.rotatePassword(instance.engine, instance.dbName, instance.dbUser);
    if (!agentResponse.success || !agentResponse.newPassword) {
      res.status(500).json({ success: false, error: agentResponse.error || "Rotate password failed" });
      return;
    }
    const encryptedPassword = encrypt(agentResponse.newPassword);
    await prisma.instance.update({
      where: { id: instance.id },
      data: { dbPasswordEncrypted: encryptedPassword },
    });
    res.json({ success: true, data: { password: agentResponse.newPassword } });
  } catch {
    res.status(500).json({ success: false, error: "Failed to rotate password" });
  }
});

router.put(
  "/:id/allowed-ips",
  validate(AllowedIPsSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const instance = await prisma.instance.findFirst({
        where: { id: req.params.id, userId: req.userId },
      });
      if (!instance) {
        res.status(404).json({ success: false, error: "Instance not found" });
        return;
      }

      let ips: string[] = [];
      if (typeof req.body.allowedIPs === "string") {
        ips = req.body.allowedIPs.split(",").map((ip: string) => ip.trim()).filter((ip: string) => ip.length > 0);
      } else if (Array.isArray(req.body.allowedIPs)) {
        ips = req.body.allowedIPs;
      }

      await prisma.allowedIP.deleteMany({ where: { instanceId: instance.id } });
      await prisma.allowedIP.createMany({
        data: ips.map((ip: string) => ({
          instanceId: instance.id,
          ip,
        })),
      });
      res.json({ success: true, message: "Allowed IPs updated" });
    } catch {
      res.status(500).json({ success: false, error: "Failed to update allowed IPs" });
    }
  }
);

export default router;
