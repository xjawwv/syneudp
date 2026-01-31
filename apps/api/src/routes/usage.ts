import { Router, Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();
    const instances = await prisma.instance.findMany({
      where: { userId: req.userId },
      select: { id: true },
    });
    const instanceIds = instances.map((i: (typeof instances)[number]) => i.id);
    const usageRecords = await prisma.usageRecord.findMany({
      where: {
        instanceId: { in: instanceIds },
        startTime: { gte: start },
        endTime: { lte: end },
      },
      include: { instance: { select: { dbName: true, engine: true } } },
      orderBy: { startTime: "desc" },
    });
    const totalAmount = usageRecords.reduce((sum: number, r: (typeof usageRecords)[number]) => sum + Number(r.amount), 0);
    res.json({
      success: true,
      data: {
        records: usageRecords.map((r: (typeof usageRecords)[number]) => ({
          id: r.id,
          instanceId: r.instanceId,
          dbName: r.instance.dbName,
          engine: r.instance.engine,
          startTime: r.startTime,
          endTime: r.endTime,
          durationSeconds: r.durationSeconds,
          ratePerHour: Number(r.ratePerHour),
          amount: Number(r.amount),
        })),
        totalAmount,
        startDate: start,
        endDate: end,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to get usage" });
  }
});

export default router;
