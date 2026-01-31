import { Router, Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";
import { PrismaClient } from "@prisma/client";

const router = Router();

// Type for transaction client
type TransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

router.post(
  "/deposits/:id/confirm",
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const deposit = await prisma.deposit.findUnique({
        where: { id },
      });
      if (!deposit) {
        res.status(404).json({ success: false, error: "Deposit not found" });
        return;
      }
      if (deposit.status !== "pending") {
        res.status(400).json({ success: false, error: "Deposit already processed" });
        return;
      }
      await prisma.$transaction(async (tx: TransactionClient) => {
        await tx.deposit.update({
          where: { id },
          data: { status: "confirmed", confirmedAt: new Date() },
        });
        const wallet = await tx.wallet.findUnique({
          where: { userId: deposit.userId },
        });
        if (!wallet) {
          throw new Error("Wallet not found");
        }
        await tx.wallet.update({
          where: { id: wallet.id },
          data: { balance: { increment: deposit.amount } },
        });
        await tx.ledgerEntry.create({
          data: {
            walletId: wallet.id,
            type: "deposit",
            amount: deposit.amount,
            description: "Deposit confirmed",
            referenceId: deposit.id,
          },
        });
      });
      res.json({ success: true, message: "Deposit confirmed" });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ success: false, error: message });
    }
  }
);

router.get("/deposits", async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const deposits = await prisma.deposit.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { email: true } } },
    });
    res.json({
      success: true,
      data: deposits.map((d: (typeof deposits)[number]) => ({
        id: d.id,
        userId: d.userId,
        userEmail: d.user.email,
        amount: Number(d.amount),
        status: d.status,
        createdAt: d.createdAt,
      })),
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to get deposits" });
  }
});

router.get("/users", async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { wallet: { select: { balance: true } } },
    });
    res.json({
      success: true,
      data: users.map((u: (typeof users)[number]) => ({
        id: u.id,
        email: u.email,
        balance: u.wallet ? Number(u.wallet.balance) : 0,
        createdAt: u.createdAt,
      })),
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to get users" });
  }
});

export default router;
