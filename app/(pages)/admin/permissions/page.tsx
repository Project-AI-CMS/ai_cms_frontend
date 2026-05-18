"use client";

import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { PermissionManagement } from "@/components/admin/PermissionManagement";
import { Loader2 } from "lucide-react";

export default function PermissionsPage() {
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

  return <PermissionManagement />;
}
