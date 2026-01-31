import { Router, Request, Response } from "express";
import prisma from "../lib/prisma.js";

const router = Router();

router.get("/", async (_req: Request, res: Response): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      orderBy: [{ engine: "asc" }, { tier: "asc" }],
    });
    res.json({
      success: true,
      data: products.map((p) => ({
        id: p.id,
        name: p.name,
        engine: p.engine,
        tier: p.tier,
        ratePerHour: Number(p.ratePerHour),
        description: p.description,
      })),
    });
  } catch {
    res.status(500).json({ success: false, error: "Failed to get products" });
  }
});

export default router;
