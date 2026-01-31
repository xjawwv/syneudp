import { Router, Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import prisma from "../lib/prisma.js";

const router = Router();

const CreateDepositSchema = z.object({
  amount: z.number().positive(),
});

router.post(
  "/",
  validate(CreateDepositSchema),
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { amount } = req.body;
      const deposit = await prisma.deposit.create({
        data: {
          userId: req.userId!,
          amount,
          status: "pending",
        },
      });
      res.json({
        success: true,
        data: {
          id: deposit.id,
          amount: Number(deposit.amount),
          status: deposit.status,
          createdAt: deposit.createdAt,
        },
      });
    } catch {
      res.status(500).json({ success: false, error: "Failed to create deposit" });
    }
  }
);

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deposits = await prisma.deposit.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: "desc" },
    });
    res.json({
      success: true,
      data: deposits.map((d: (typeof deposits)[number]) => ({
        id: d.id,
        amount: Number(d.amount),
        status: d.status,
        createdAt: d.createdAt,
        confirmedAt: d.confirmedAt,
      })),
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to get deposits" });
  }
});

export default router;
