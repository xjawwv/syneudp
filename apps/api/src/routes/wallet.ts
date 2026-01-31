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
    res.json({
      success: true,
      data: {
        id: wallet.id,
        balance: Number(wallet.balance),
        updatedAt: wallet.updatedAt,
      },
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to get wallet" });
  }
});

export default router;
