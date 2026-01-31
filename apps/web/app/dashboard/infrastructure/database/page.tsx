"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { apiGet } from "@/lib/api";

import { formatCurrency } from "@/lib/currency";

interface Instance {
  id: string;
  engine: string;
  status: string;
  dbName: string;
  host: string;
  port: number;
  ratePerHour: number;
  productName: string;
  createdAt: string;
  terminatedAt: string | null;
}

export default function InstancesPage() {
  const { session } = useAuth();
  const [instances, setInstances] = useState<Instance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.access_token) {
      loadInstances();
    }
  }, [session]);

  async function loadInstances() {
    try {
      const token = session!.access_token;
      const res = await apiGet<Instance[]>("/instances", token);
      if (res.success && res.data) {
        setInstances(res.data);
      }
    } catch (error) {
      console.error("Failed to load instances:", error);
    } finally {
      setLoading(false);
    }
  }

  function getStatusColor(status: string) {
    switch (status) {
      case "running":
        return "bg-green-50 text-green-600";
      case "suspended":
        return "bg-amber-50 text-amber-600";
      case "terminated":
        return "bg-gray-50 text-gray-500";
      case "provisioning":
        return "bg-blue-50 text-blue-600";
      case "error":
        return "bg-red-50 text-red-600";
      default:
        return "bg-gray-50 text-gray-600";
    }
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Managed Databases</h1>
          <p className="text-gray-500 mt-1 font-medium">Manage your PostgreSQL, MySQL, and MariaDB databases</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => loadInstances()}
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
             <div className="grid grid-cols-7 gap-4 px-8 py-5 bg-gray-50/30 border-b border-gray-100">
                {['NAME', 'STATUS', 'USAGE', 'AUTO RENEWAL', 'PRICE', 'EXPIRY', 'ACTIONS'].map(head => (
                    <div key={head} className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em]">
                        {head}
                    </div>
                ))}
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
             <div className="grid grid-cols-7 gap-4 px-8 py-5 bg-gray-50/30 border-b border-gray-100">
                {['NAME', 'STATUS', 'USAGE', 'AUTO RENEWAL', 'PRICE', 'EXPIRY', 'ACTIONS'].map(head => (
                    <div key={head} className="text-[10px] font-extrabold text-gray-400 tracking-[0.1em]">
                        {head}
                    </div>
                ))}
            </div>

            <div className="divide-y divide-gray-100">
              {instances.map((instance) => (
                <Link
                  key={instance.id}
                  href={`/dashboard/infrastructure/database/${instance.id}`}
                  className="grid grid-cols-7 gap-4 px-8 py-6 items-center hover:bg-gray-50/40 transition-all group"
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
                        <div className="font-bold text-gray-900 text-base">{instance.dbName}</div>
                        <div className="text-[10px] text-gray-400 font-extrabold uppercase tracking-widest">{instance.engine}</div>
                    </div>
                  </div>

                  {/* STATUS */}
                  <div className="flex">
                    <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-lg tracking-[0.05em] shadow-sm ${getStatusColor(instance.status)}`}>
                      {instance.status}
                    </span>
                  </div>

                  {/* USAGE */}
                  <div className="text-sm font-bold text-gray-700">
                    --
                  </div>

                  {/* AUTO RENEWAL */}
                  <div className="text-[11px] font-black text-blue-600 uppercase tracking-widest flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>
                    Active
                  </div>

                  {/* PRICE */}
                  <div className="text-sm font-black text-gray-900">
                    {formatCurrency(instance.ratePerHour)}<span className="text-gray-400 font-bold block text-[9px] uppercase tracking-tighter">Per Hour</span>
                  </div>

                  {/* EXPIRY */}
                  <div className="text-sm font-bold text-gray-500">
                    {instance.terminatedAt ? new Date(instance.terminatedAt).toLocaleDateString() : 'Auto-renew'}
                  </div>

                  {/* ACTIONS */}
                  <div className="flex justify-end">
                    <button className="p-2.5 text-gray-300 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all active:scale-90">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
        </div>
      )}
    </div>
  );
}
