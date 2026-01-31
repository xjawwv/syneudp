export enum DatabaseEngine {
  MYSQL = "mysql",
  POSTGRESQL = "postgresql",
}

export enum InstanceStatus {
  PROVISIONING = "provisioning",
  RUNNING = "running",
  SUSPENDED = "suspended",
  TERMINATED = "terminated",
  ERROR = "error",
}

export enum DepositStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  REJECTED = "rejected",
}

export enum LedgerType {
  DEPOSIT = "deposit",
  USAGE_CHARGE = "usage_charge",
  REFUND = "refund",
}

export interface User {
  id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LedgerEntry {
  id: string;
  walletId: string;
  type: LedgerType;
  amount: number;
  description: string;
  referenceId: string | null;
  createdAt: Date;
}

export interface Deposit {
  id: string;
  userId: string;
  amount: number;
  status: DepositStatus;
  createdAt: Date;
  confirmedAt: Date | null;
}

export interface Product {
  id: string;
  name: string;
  engine: DatabaseEngine;
  tier: string;
  ratePerHour: number;
  description: string;
  createdAt: Date;
}

export interface Instance {
  id: string;
  userId: string;
  productId: string;
  engine: DatabaseEngine;
  status: InstanceStatus;
  dbName: string;
  dbUser: string;
  dbPasswordEncrypted: string;
  host: string;
  port: number;
  createdAt: Date;
  updatedAt: Date;
  terminatedAt: Date | null;
}

export interface AllowedIP {
  id: string;
  instanceId: string;
  ip: string;
  createdAt: Date;
}

export interface UsageRecord {
  id: string;
  instanceId: string;
  startTime: Date;
  endTime: Date;
  durationSeconds: number;
  ratePerHour: number;
  amount: number;
  createdAt: Date;
}

export interface AgentProvisionRequest {
  engine: DatabaseEngine;
  dbName: string;
  dbUser: string;
}

export interface AgentProvisionResponse {
  success: boolean;
  password?: string;
  error?: string;
}

export interface AgentActionRequest {
  engine: DatabaseEngine;
  dbName: string;
  dbUser: string;
}

export interface AgentRotatePasswordResponse {
  success: boolean;
  newPassword?: string;
  error?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
