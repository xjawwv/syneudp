import "dotenv/config";
import express from "express";
import cors from "cors";
import { authMiddleware, adminMiddleware } from "./middleware/auth.js";
import { errorHandler } from "./middleware/error.js";
import healthRouter from "./routes/health.js";
import userRouter from "./routes/user.js";
import walletRouter from "./routes/wallet.js";
import ledgerRouter from "./routes/ledger.js";
import depositsRouter from "./routes/deposits.js";
import productsRouter from "./routes/products.js";
import instancesRouter from "./routes/instances.js";
import usageRouter from "./routes/usage.js";
import adminRouter from "./routes/admin.js";
import { startBillingWorker, scheduleBillingJob } from "./jobs/billing.js";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/v1/health", healthRouter);

app.use("/api/v1/me", authMiddleware, userRouter);
app.use("/api/v1/wallet", authMiddleware, walletRouter);
app.use("/api/v1/ledger", authMiddleware, ledgerRouter);
app.use("/api/v1/deposits", authMiddleware, depositsRouter);
app.use("/api/v1/products", authMiddleware, productsRouter);
app.use("/api/v1/instances", authMiddleware, instancesRouter);
app.use("/api/v1/usage", authMiddleware, usageRouter);
app.use("/api/v1/admin", authMiddleware, adminMiddleware, adminRouter);

app.use(errorHandler);

const PORT = parseInt(process.env.PORT || "4000");

app.listen(PORT, async () => {
  console.log(`API running on port ${PORT}`);
  startBillingWorker();
  await scheduleBillingJob();
  console.log("Billing scheduler started");
});
