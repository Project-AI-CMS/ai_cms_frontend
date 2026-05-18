"use client";

import { useEffect, useState } from "react";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";
import { RoleManagement } from "@/components/admin/RoleManagement";
import { permissionApi } from "@/lib/admin";
import { Permission } from "@/types/admin";
import { Loader2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function RolesPage() {
  const { loading: authLoading, isAuthorized } = useRequireAdmin();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const data = await permissionApi.getAll();
        setPermissions(data);
      } catch (err: any) {
        setError(err.message || "Failed to load permissions");
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && isAuthorized) {
      fetchPermissions();
    }
  }, [authLoading, isAuthorized]);

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return <RoleManagement permissions={permissions} />;
}
