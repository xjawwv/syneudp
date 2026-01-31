"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiGet, apiPost, apiPut } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

interface Instance {
  id: string;
  engine: string;
  status: string;
  dbName: string;
  dbUser: string;
  password: string;
  host: string;
  port: number;
  ratePerHour: number;
  productName: string;
  allowedIPs: string[];
  createdAt: string;
  terminatedAt: string | null;
}

export default function InstanceDetailPage() {
  const { id } = useParams();
  const { session } = useAuth();
  const router = useRouter();
  const [instance, setInstance] = useState<Instance | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newIP, setNewIP] = useState("");

  useEffect(() => {
    if (session?.access_token && id) {
      loadInstance();
    }
  }, [session, id]);

  async function loadInstance() {
    const token = session!.access_token;
    const res = await apiGet<Instance>(`/instances/${id}`, token);
    if (res.success && res.data) {
      setInstance(res.data);
    }
    setLoading(false);
  }

  async function handleAction(action: string) {
    setActionLoading(action);
    setError("");
    setSuccess("");
    const token = session!.access_token;
    const res = await apiPost(`/instances/${id}/${action}`, token);
    if (res.success) {
      setSuccess(`Instance ${action}d successfully`);
      loadInstance();
    } else {
      setError(res.error || `Failed to ${action} instance`);
    }
    setActionLoading(null);
  }

  async function handleRotatePassword() {
    setActionLoading("rotate");
    setError("");
    setSuccess("");
    const token = session!.access_token;
    const res = await apiPost<{ password: string }>(
      `/instances/${id}/rotate-password`,
      token
    );
    if (res.success) {
      setSuccess("Password rotated successfully");
      loadInstance();
    } else {
      setError(res.error || "Failed to rotate password");
    }
    setActionLoading(null);
  }

  async function handleAddIP() {
    if (!newIP) return;
    const token = session!.access_token;
    const updatedIPs = [...(instance?.allowedIPs || []), newIP];
    const res = await apiPut(`/instances/${id}/allowed-ips`, token, {
      allowedIPs: updatedIPs,
    });
    if (res.success) {
      setNewIP("");
      loadInstance();
    } else {
      setError(res.error || "Failed to add IP");
    }
  }

  async function handleRemoveIP(ip: string) {
    const token = session!.access_token;
    const updatedIPs = instance?.allowedIPs.filter((i) => i !== ip) || [];
    const res = await apiPut(`/instances/${id}/allowed-ips`, token, {
      allowedIPs: updatedIPs,
    });
    if (res.success) {
      loadInstance();
    } else {
      setError(res.error || "Failed to remove IP");
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!instance) {
    return (
      <div className="text-center p-12">
        <p className="text-gray-500">Instance not found</p>
        <Link
          href="/dashboard/infrastructure/database"
          className="text-primary-600 hover:underline mt-2 inline-block"
        >
          Back to instances
        </Link>
      </div>
    );
  }

  const isTerminated = instance.status === "terminated";
  const isRunning = instance.status === "running";
  const isSuspended = instance.status === "suspended";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/infrastructure/database"
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{instance.dbName}</h1>
            <p className="text-gray-500">
              {instance.engine} - {instance.productName}
            </p>
          </div>
        </div>
        <span
          className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${
            isRunning
              ? "bg-green-100 text-green-700"
              : isSuspended
              ? "bg-yellow-100 text-yellow-700"
              : isTerminated
              ? "bg-gray-100 text-gray-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {instance.status}
        </span>
      </div>

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

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Connection Details</h2>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-500">Host</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                  {instance.host}
                </code>
                <button
                  onClick={() => copyToClipboard(instance.host)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Port</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                  {instance.port}
                </code>
                <button
                  onClick={() => copyToClipboard(String(instance.port))}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Database</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                  {instance.dbName}
                </code>
                <button
                  onClick={() => copyToClipboard(instance.dbName)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Username</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                  {instance.dbUser}
                </code>
                <button
                  onClick={() => copyToClipboard(instance.dbUser)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Password</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-gray-100 px-3 py-2 rounded text-sm">
                  {showPassword ? instance.password : "••••••••••••"}
                </code>
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showPassword ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
                <button
                  onClick={() => copyToClipboard(instance.password)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Instance Actions</h2>
            <div className="space-y-3">
              {isRunning && (
                <button
                  onClick={() => handleAction("suspend")}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-yellow-300 text-yellow-700 rounded-lg hover:bg-yellow-50 transition-colors disabled:opacity-50"
                >
                  {actionLoading === "suspend" ? "Suspending..." : "Suspend Instance"}
                </button>
              )}
              {isSuspended && (
                <button
                  onClick={() => handleAction("resume")}
                  disabled={actionLoading !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
                >
                  {actionLoading === "resume" ? "Resuming..." : "Resume Instance"}
                </button>
              )}
              {!isTerminated && (
                <>
                  <button
                    onClick={handleRotatePassword}
                    disabled={actionLoading !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === "rotate" ? "Rotating..." : "Rotate Password"}
                  </button>
                  <button
                    onClick={() => handleAction("terminate")}
                    disabled={actionLoading !== null}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {actionLoading === "terminate" ? "Terminating..." : "Terminate Instance"}
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="font-semibold text-gray-800 mb-4">Allowed IPs</h2>
            <p className="text-sm text-gray-500 mb-4">
              IP restrictions are stored but not enforced at network level in MVP.
            </p>
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="Enter IP address"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <button
                onClick={handleAddIP}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add
              </button>
            </div>
            {instance.allowedIPs.length === 0 ? (
              <p className="text-sm text-gray-500">No IP restrictions</p>
            ) : (
              <div className="space-y-2">
                {instance.allowedIPs.map((ip) => (
                  <div
                    key={ip}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                  >
                    <code className="text-sm">{ip}</code>
                    <button
                      onClick={() => handleRemoveIP(ip)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Instance Information</h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm text-gray-500">Created</label>
            <p className="font-medium text-gray-800">
              {new Date(instance.createdAt).toLocaleString()}
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Hourly Rate</label>
            <p className="font-medium text-gray-800">
              {formatCurrency(instance.ratePerHour)}/hour
            </p>
          </div>
          {instance.terminatedAt && (
            <div>
              <label className="text-sm text-gray-500">Terminated</label>
              <p className="font-medium text-gray-800">
                {new Date(instance.terminatedAt).toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
