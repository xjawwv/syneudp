"use client";

import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Account Settings</h1>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-800 mb-4">Profile Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email</label>
            <div className="text-gray-900 font-medium">{profile.email}</div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Role</label>
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
              profile.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
            }`}>
              {profile.role}
            </span>
          </div>
          <div>
             <label className="block text-sm text-gray-500 mb-1">User ID</label>
             <code className="text-sm bg-gray-50 px-2 py-1 rounded text-gray-600">{profile.id}</code>
          </div>
        </div>
      </div>
    </div>
  );
}
