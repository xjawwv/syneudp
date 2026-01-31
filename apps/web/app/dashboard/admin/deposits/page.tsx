"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiGet, apiPost } from "@/lib/api";

interface Deposit {
  id: string;
  userId: string;
  userEmail: string;
  amount: number;
  status: string;
  createdAt: string;
}

export default function AdminDepositsPage() {
  const { session } = useAuth();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (session?.access_token) {
      loadDeposits();
    }
  }, [session]);

  async function loadDeposits() {
    const token = session!.access_token;
    const res = await apiGet<Deposit[]>("/admin/deposits", token);
    if (res.success && res.data) {
      setDeposits(res.data);
    } else if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  }

  async function handleConfirm(id: string) {
    setActionLoading(id);
    setError("");
    setSuccess("");
    const token = session!.access_token;
    const res = await apiPost(`/admin/deposits/${id}/confirm`, token);
    if (res.success) {
      setSuccess("Deposit confirmed successfully");
      loadDeposits();
    } else {
      setError(res.error || "Failed to confirm deposit");
    }
    setActionLoading(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Manage Deposits</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">Pending Deposits</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : deposits.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No pending deposits
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Requested
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {deposits.map((deposit) => (
                  <tr key={deposit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-gray-800">
                        {deposit.userEmail}
                      </p>
                      <p className="text-xs text-gray-500">{deposit.userId}</p>
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-800">
                      ${deposit.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {new Date(deposit.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => handleConfirm(deposit.id)}
                        disabled={actionLoading === deposit.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {actionLoading === deposit.id
                          ? "Confirming..."
                          : "Confirm"}
                      </button>
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
