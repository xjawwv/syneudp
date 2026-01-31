"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiGet } from "@/lib/api";

interface UsageRecord {
  id: string;
  instanceId: string;
  dbName: string;
  engine: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  ratePerHour: number;
  amount: number;
}

interface UsageData {
  records: UsageRecord[];
  totalAmount: number;
  startDate: string;
  endDate: string;
}

export default function UsagePage() {
  const { session } = useAuth();
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split("T")[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  useEffect(() => {
    if (session?.access_token) {
      loadUsage();
    }
  }, [session, startDate, endDate]);

  async function loadUsage() {
    setLoading(true);
    const token = session!.access_token;
    const res = await apiGet<UsageData>(
      `/usage?startDate=${startDate}&endDate=${endDate}`,
      token
    );
    if (res.success && res.data) {
      setUsage(res.data);
    }
    setLoading(false);
  }

  function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Usage</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>
        </div>
      </div>

      {usage && (
        <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-200 text-sm font-medium">
                Total Usage Cost
              </p>
              <p className="text-3xl font-bold mt-1">
                ${usage.totalAmount.toFixed(2)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-primary-200 text-sm">
                {new Date(startDate).toLocaleDateString()} -{" "}
                {new Date(endDate).toLocaleDateString()}
              </p>
              <p className="text-primary-200 text-sm mt-1">
                {usage.records.length} records
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Usage Records</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : !usage || usage.records.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No usage records for this period
          </div>
        ) : (
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
                    Period
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Duration
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Rate
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {usage.records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {record.dbName}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {record.engine}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(record.startTime).toLocaleString()} -{" "}
                      {new Date(record.endTime).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 text-right">
                      {formatDuration(record.durationSeconds)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 text-right">
                      ${record.ratePerHour.toFixed(2)}/hr
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-800 text-right">
                      ${record.amount.toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
