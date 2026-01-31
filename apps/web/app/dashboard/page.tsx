"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiGet } from "@/lib/api";
import WalletCard from "@/components/WalletCard";
import LedgerTable from "@/components/LedgerTable";

interface Instance {
  id: string;
  engine: string;
  status: string;
  dbName: string;
  productName: string;
  createdAt: string;
}

export default function DashboardPage() {
  const { session } = useAuth();
  const [wallet, setWallet] = useState<{ balance: number } | null>(null);
  const [ledger, setLedger] = useState<any[]>([]);
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.access_token) {
      loadData();
    }
  }, [session]);

  async function loadData() {
    const token = session!.access_token;
    const [walletRes, ledgerRes, instancesRes] = await Promise.all([
      apiGet<{ balance: number }>("/wallet", token),
      apiGet<any[]>("/ledger", token),
      apiGet<Instance[]>("/instances", token),
    ]);
    if (walletRes.success && walletRes.data) {
      setWallet(walletRes.data);
    }
    if (ledgerRes.success && ledgerRes.data) {
      setLedger(ledgerRes.data);
    }
    if (instancesRes.success && instancesRes.data) {
      setInstances(instancesRes.data);
    }
    setLoading(false);
  }

  const runningInstances = instances.filter((i) => i.status === "running").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Overview</h1>
        <Link
          href="/dashboard/instances/new"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-700 transition-colors"
        >
          Create Instance
        </Link>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <WalletCard balance={wallet?.balance || 0} loading={loading} />

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">
              Running Instances
            </span>
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
              />
            </svg>
          </div>
          {loading ? (
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-bold text-gray-800">
              {runningInstances}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-500 text-sm font-medium">
              Total Instances
            </span>
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          {loading ? (
            <div className="h-10 bg-gray-100 rounded animate-pulse"></div>
          ) : (
            <div className="text-3xl font-bold text-gray-800">
              {instances.length}
            </div>
          )}
        </div>
      </div>

      <LedgerTable entries={ledger.slice(0, 10)} loading={loading} />

      {instances.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Recent Instances</h3>
            <Link
              href="/dashboard/instances"
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Database
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Engine
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Plan
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {instances.slice(0, 5).map((instance) => (
                  <tr key={instance.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <Link
                        href={`/dashboard/instances/${instance.id}`}
                        className="text-primary-600 hover:underline font-medium"
                      >
                        {instance.dbName}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {instance.engine}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          instance.status === "running"
                            ? "bg-green-100 text-green-700"
                            : instance.status === "suspended"
                            ? "bg-yellow-100 text-yellow-700"
                            : instance.status === "terminated"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {instance.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {instance.productName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
