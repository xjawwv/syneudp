import { Router, Response } from "express";
import { AuthRequest } from "../middleware/auth.js";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { userId: req.userId },
    });
    if (!wallet) {
      res.status(404).json({ success: false, error: "Wallet not found" });
      return;
    }
    const ledger = await prisma.ledgerEntry.findMany({
      where: { walletId: wallet.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({
      success: true,
      data: ledger.map((entry) => ({
        id: entry.id,
        type: entry.type,
        amount: Number(entry.amount),
        description: entry.description,
        referenceId: entry.referenceId,
        createdAt: entry.createdAt,
      })),
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to get ledger" });
  }
});

export default router;
