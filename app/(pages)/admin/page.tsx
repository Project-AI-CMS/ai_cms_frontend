"use client";

import { useRouter } from "next/navigation";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { Loader2 } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { loading, isAuthorized } = useRequireAdmin();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-slate-600 mt-2">
          Manage users, roles, and permissions
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => router.push("/admin/users")}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 hover:shadow-lg hover:scale-105 transition-all text-left"
        >
          <h2 className="text-2xl font-bold text-blue-900">Users</h2>
          <p className="text-blue-700 text-sm mt-1">Manage system users</p>
        </button>
        <button
          onClick={() => router.push("/admin/roles")}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 hover:shadow-lg hover:scale-105 transition-all text-left"
        >
          <h2 className="text-2xl font-bold text-purple-900">Roles</h2>
          <p className="text-purple-700 text-sm mt-1">Manage system roles</p>
        </button>
        <button
          onClick={() => router.push("/admin/permissions")}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 hover:shadow-lg hover:scale-105 transition-all text-left"
        >
          <h2 className="text-2xl font-bold text-green-900">Permissions</h2>
          <p className="text-green-700 text-sm mt-1">Manage permissions</p>
        </button>
      </div>
    </div>
  );
}
