import { Redis } from "ioredis";

// Create Redis instance with BullMQ-compatible options
const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: null, // Required by BullMQ
});

export default redis;
