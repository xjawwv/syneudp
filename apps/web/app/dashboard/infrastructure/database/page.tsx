"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiGet, apiPost, apiDelete } from "@/lib/api";

import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";
import { StatusBadge } from "@/components/status-badge";

interface Instance {
  id: string;
  name: string | null;
  engine: string;
  status: string;
  dbName: string;
  host: string;
  port: number;
  ratePerHour: number;
  storageSize: number;
  productName: string;
  createdAt: string;
  terminatedAt: string | null;
}

export default function InstancesPage() {
  const { session } = useAuth();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [wallet, setWallet] = useState<{ balance: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<{id: string, action: string} | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    if (session?.access_token) {
      loadData();
    }
  }, [session]);

  async function loadData() {
    try {
      const token = session!.access_token;
      const [instancesRes, walletRes] = await Promise.all([
        apiGet<Instance[]>("/instances", token),
        apiGet<{ balance: number }>("/wallet", token)
      ]);

      if (instancesRes.success && instancesRes.data) {
        const statusOrder: Record<string, number> = {
          'running': 0,
          'provisioning': 1,
          'suspended': 2,
          'error': 3,
          'terminated': 4
        };
        const sorted = [...instancesRes.data].sort((a, b) => {
          const orderA = statusOrder[a.status.toLowerCase()] ?? 99;
          const orderB = statusOrder[b.status.toLowerCase()] ?? 99;
          if (orderA !== orderB) return orderA - orderB;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        setInstances(sorted);
      }
      if (walletRes.success && walletRes.data) {
        setWallet(walletRes.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }

  function calculateExpiryDate(instances: Instance[], balance: number) {
    const totalHourlyRate = instances
      .filter(i => i.status === 'running')
      .reduce((sum, i) => sum + (i.ratePerHour || 0), 0);

    // If no cost is being incurred but instances are running
    if (totalHourlyRate <= 0) {
        const runningCount = instances.filter(i => i.status === 'running').length;
        if (runningCount > 0) return "Unlimited";
        return "Auto-renew";
    }

    // If incurring cost but balance is empty
    if (balance <= 0) return "Balance Empty";

    const remainingHours = balance / totalHourlyRate;
    const expiryDate = new Date();
    expiryDate.setHours(expiryDate.getHours() + Math.floor(remainingHours));
    expiryDate.setMinutes(expiryDate.getMinutes() + Math.floor((remainingHours % 1) * 60));
    
    return expiryDate;
  }

  async function handleInstanceAction(e: React.MouseEvent, instanceId: string, action: string) {
    e.preventDefault();
    e.stopPropagation();
    
    setActionLoading({id: instanceId, action});
    setError("");
    setSuccess("");
    
    const token = session!.access_token;
    let res;
    
    if (action === 'delete') {
      res = await apiDelete<{ message?: string }>(`/instances/${instanceId}`, token);
    } else {
      res = await apiPost<{ password?: string }>(`/instances/${instanceId}/${action}`, token);
    }
    
    if (res.success) {
      if (action === 'rotate-password') {
        const data = res.data as { password?: string };
        if (data?.password) {
          setSuccess(`Password rotated! New password: ${data.password}`);
        }
      } else if (action === 'delete') {
        setSuccess("Instance deleted successfully");
      } else {
        setSuccess(`Instance ${action === 'suspend' ? 'suspended' : action + 'd'} successfully`);
      }
      loadData();
    } else {
      setError(res.error || `Failed to ${action} instance`);
    }
    setActionLoading(null);
    setOpenMenuId(null);
  }


  return (
    <div className="space-y-8">
      {/* Notifications */}
      <div className="fixed top-24 right-8 z-50 space-y-4 max-w-md pointer-events-none">
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-6 py-4 rounded-2xl shadow-xl animate-in slide-in-from-right pointer-events-auto flex items-center gap-3">
             <div className="bg-emerald-500 p-1 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <p className="font-bold text-sm tracking-tight">{success}</p>
             <button onClick={() => setSuccess("")} className="ml-auto text-emerald-400 hover:text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>
        )}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-2xl shadow-xl animate-in slide-in-from-right pointer-events-auto flex items-center gap-3">
             <div className="bg-rose-500 p-1 rounded-lg">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
             </div>
             <p className="font-bold text-sm tracking-tight">{error}</p>
             <button onClick={() => setError("")} className="ml-auto text-rose-400 hover:text-rose-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
             </button>
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Managed Databases</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your PostgreSQL, MySQL, and MariaDB databases</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadData()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>
          <Link
            href="/dashboard/infrastructure/database/new"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md active:scale-95 shadow-blue-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
            Create Database
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-gray-100 p-32 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-100 border-t-blue-600 mb-6"></div>
                <div className="absolute inset-0 flex items-center justify-center text-blue-600 font-bold text-xs uppercase tracking-widest animate-pulse">
                    SYNE
                </div>
            </div>
            <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Loading Databases...</p>
        </div>
      ) : instances.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
             {/* Table Header Placeholder */}
             <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_1fr_1fr] gap-4 px-8 py-5 bg-gray-50/30 border-b border-gray-100">
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em]">NAME</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">STATUS</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">USAGE</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">AUTO RENEWAL</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">PRICE</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">EXPIRY</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">ACTIONS</div>
            </div>
            
            <div className="py-32 px-8 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center mb-8 rotate-3 transition-transform hover:rotate-0">
                <svg
                    className="w-12 h-12 text-gray-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
                    />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                No databases found
              </h3>
              <p className="text-gray-500 mb-10 max-w-sm font-medium leading-relaxed">
                Create your first managed database to get started with PostgreSQL, MySQL, or Redis.
              </p>
              <Link
                href="/dashboard/infrastructure/database/new"
                className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 active:scale-95 group"
              >
                <div className="bg-blue-500 p-1 rounded-lg group-hover:bg-blue-400 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                    </svg>
                </div>
                Create Database
              </Link>
            </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-[400px]">
             {/* Table Header */}
             <div className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_1fr_1fr] gap-4 px-8 py-5 bg-gray-50/30 border-b border-gray-100">
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em]">NAME</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">STATUS</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">USAGE</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">AUTO RENEWAL</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">PRICE</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">EXPIRY</div>
                <div className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em] text-center">ACTIONS</div>
            </div>

            <div className="divide-y divide-gray-100">
              {instances.map((instance) => (
                <Link
                  key={instance.id}
                  href={`/dashboard/infrastructure/database/${instance.id}`}
                  className="grid grid-cols-[2fr_1fr_1fr_1.5fr_1fr_1fr_1fr] gap-4 px-8 py-6 items-center hover:bg-gray-50/40 transition-all group"
                >
                  {/* NAME */}
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                        instance.engine === 'mysql' ? 'bg-blue-50 text-blue-600' : 
                        instance.engine === 'postgresql' ? 'bg-indigo-50 text-indigo-600' :
                        'bg-rose-50 text-rose-600'
                    }`}>
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                        </svg>
                    </div>
                    <div>
                        <div className="font-bold text-gray-900 text-base group-hover:text-blue-600 transition-colors">
                            {instance.name || instance.dbName}
                        </div>
                        <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">
                            {instance.engine} {instance.name && <span className="text-gray-300 ml-1">({instance.dbName})</span>}
                        </div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="flex justify-center">
                    <StatusBadge status={instance.status} />
                  </div>

                  <div className="text-sm font-bold text-gray-700 text-center">
                    {instance.storageSize} GB
                  </div>

                  {/* AUTO RENEWAL */}
                  <div className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center justify-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    Active
                  </div>

                  {/* PRICE */}
                  <div className="text-sm font-black text-gray-900 text-center">
                    {formatCurrency(instance.ratePerHour)}<span className="text-gray-400 font-bold block text-[9px] uppercase tracking-tighter">Per Hour</span>
                  </div>

                  {/* EXPIRY */}
                  <div className="text-sm font-bold text-center">
                    {(() => {
                      if (instance.terminatedAt) return <span className="text-gray-400">{formatDate(instance.terminatedAt)}</span>;
                      
                      const result = calculateExpiryDate(instances, wallet?.balance || 0);
                      
                      if (result === "Unlimited") return <span className="text-emerald-600">Lifetime</span>;
                      if (result === "Balance Empty") return <span className="text-rose-500">Topup Required</span>;
                      if (result === "Auto-renew" || !result) return <span className="text-gray-400">Auto-renew</span>;
                      
                      const expiry = result as Date;
                      return (
                        <div className="flex flex-col items-center">
                          <span className="text-gray-900">{formatDate(expiry)}</span>
                          <span className="text-[9px] text-gray-400 font-medium uppercase">{expiry.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      );
                    })()}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-center relative">
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === instance.id ? null : instance.id);
                      }}
                      className={`p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center border-2 ${
                        openMenuId === instance.id 
                        ? 'bg-blue-50 border-blue-200 text-blue-600' 
                        : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200 hover:text-gray-600 shadow-sm'
                      }`}
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                            <path d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                    </button>

                    {openMenuId === instance.id && (
                      <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-[60] animate-in fade-in zoom-in-95 duration-100">
                        {instance.status === 'running' && (
                          <button
                            onClick={(e) => handleInstanceAction(e, instance.id, 'suspend')}
                            disabled={actionLoading?.id === instance.id}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-amber-600 hover:bg-amber-50 flex items-center gap-3 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {actionLoading?.id === instance.id && actionLoading?.action === 'suspend' ? 'Suspending...' : 'Suspend'}
                          </button>
                        )}
                        {instance.status === 'suspended' && (
                          <button
                            onClick={(e) => handleInstanceAction(e, instance.id, 'resume')}
                            disabled={actionLoading?.id === instance.id}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-emerald-600 hover:bg-emerald-50 flex items-center gap-3 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {actionLoading?.id === instance.id && actionLoading?.action === 'resume' ? 'Resuming...' : 'Resume'}
                          </button>
                        )}
                        {instance.status !== 'terminated' && (
                          <button
                            onClick={(e) => handleInstanceAction(e, instance.id, 'rotate-password')}
                            disabled={actionLoading?.id === instance.id}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                            {actionLoading?.id === instance.id && actionLoading?.action === 'rotate-password' ? 'Rotating...' : 'Rotate Password'}
                          </button>
                        )}
                        {instance.status !== 'terminated' && (
                          <button
                            onClick={(e) => handleInstanceAction(e, instance.id, 'terminate')}
                            disabled={actionLoading?.id === instance.id}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-3 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {actionLoading?.id === instance.id && actionLoading?.action === 'terminate' ? 'Terminating...' : 'Terminate'}
                          </button>
                        )}
                        {instance.status === 'terminated' && (
                          <button
                            onClick={(e) => handleInstanceAction(e, instance.id, 'delete')}
                            disabled={actionLoading?.id === instance.id}
                            className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            {actionLoading?.id === instance.id && actionLoading?.action === 'delete' ? 'Deleting...' : 'Delete Permanently'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
        </div>
      )}
    </div>
  );
}
