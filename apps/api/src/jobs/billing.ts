import { Worker, Queue, Job } from "bullmq";
import prisma from "../lib/prisma.js";
import { Prisma } from "@prisma/client";
import * as agent from "../lib/agent.js";
import redis from "../lib/redis.js";

const QUEUE_NAME = "billing";
const JOB_NAME = "process-billing";

export const billingQueue = new Queue(QUEUE_NAME, { connection: redis });

async function processBilling(): Promise<void> {
  const now = new Date();
  const instances = await prisma.instance.findMany({
    where: { status: "running" },
    include: { product: true, user: { include: { wallet: true } } },
  });
  for (const instance of instances) {
    const lastBilledAt = instance.lastBilledAt;
    const durationMs = now.getTime() - lastBilledAt.getTime();
    const durationSeconds = Math.floor(durationMs / 1000);
    if (durationSeconds < 60) continue;
    const ratePerHour = Number(instance.ratePerHour);
    const amount = (durationSeconds / 3600) * ratePerHour;
    const wallet = instance.user.wallet;
    if (!wallet) continue;
    const usageId = `usage_${instance.id}_${lastBilledAt.getTime()}`;
    const existingUsage = await prisma.usageRecord.findFirst({
      where: { instanceId: instance.id, startTime: lastBilledAt },
    });
    if (existingUsage) continue;
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.usageRecord.create({
        data: {
          instanceId: instance.id,
          startTime: lastBilledAt,
          endTime: now,
          durationSeconds,
          ratePerHour,
          amount,
        },
      });
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } },
      });
      await tx.ledgerEntry.create({
        data: {
          walletId: wallet.id,
          type: "usage_charge",
          amount: -amount,
          description: `Usage charge for ${instance.dbName}`,
          referenceId: usageId,
        },
      });
      await tx.instance.update({
        where: { id: instance.id },
        data: { lastBilledAt: now },
      });
    });
    const updatedWallet = await prisma.wallet.findUnique({
      where: { id: wallet.id },
    });
    if (updatedWallet && Number(updatedWallet.balance) < 0) {
      await agent.suspendDatabase(instance.engine, instance.dbName, instance.dbUser);
      await prisma.instance.update({
        where: { id: instance.id },
        data: { status: "suspended" },
      });
    }
  }
}

export function startBillingWorker(): Worker {
  const worker = new Worker(
    QUEUE_NAME,
    async () => {
      await processBilling();
    },
    { connection: redis }
  );
  worker.on("completed", () => {
    console.log("Billing job completed");
  });
  worker.on("failed", (job: Job | undefined, err: Error) => {
    console.error("Billing job failed:", err.message);
  });
  return worker;
}

export async function scheduleBillingJob(): Promise<void> {
  await billingQueue.add(
    JOB_NAME,
    {},
    {
      repeat: { every: 5 * 60 * 1000 },
      removeOnComplete: true,
      removeOnFail: 100,
    }
  );
}
