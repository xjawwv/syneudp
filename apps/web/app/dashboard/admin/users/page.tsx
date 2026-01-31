"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { apiGet } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface User {
  id: string;
  email: string;
  balance: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { session } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.access_token) {
      loadUsers();
    }
  }, [session]);

  async function loadUsers() {
    const token = session!.access_token;
    const res = await apiGet<User[]>("/admin/users", token);
    if (res.success && res.data) {
      setUsers(res.data);
    } else if (res.error) {
      setError(res.error);
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Users</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-800">
            All Users ({users.length})
          </h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User ID
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Balance
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-medium text-gray-800">
                      {user.email}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-500 font-mono">
                      {user.id}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className={`font-medium ${
                          user.balance < 0 ? "text-red-600" : "text-gray-800"
                        }`}
                      >
                        {formatCurrency(user.balance)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 text-right">
                      {new Date(user.createdAt).toLocaleDateString()}
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
