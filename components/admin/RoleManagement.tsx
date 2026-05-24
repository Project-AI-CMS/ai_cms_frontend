"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { roleApi, permissionApi } from "@/lib/admin";
import { Role, Permission } from "@/types/admin";
import { RoleList } from "./RoleList";
import { RoleForm } from "./RoleForm";
import { RoleDetailModal } from "./RoleDetailModal";
import { toast } from "sonner";

type ViewMode = "list" | "form" | "detail";

interface RoleManagementProps {
  permissions: Permission[];
}

export function RoleManagement({ permissions }: RoleManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await roleApi.getAll();
      setRoles(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleCreate = () => {
    setEditingRoleId(null);
    setSelectedRole(null);
    setViewMode("form");
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setEditingRoleId(role.id);
    setViewMode("form");
  };

  const handleView = async (role: Role) => {
    setSelectedRole(role);
    setViewMode("detail");
  };

  const handleDelete = async (roleId: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      await roleApi.delete(roleId);
      setRoles((prev) => prev.filter((r) => r.id !== roleId));
      toast.success("Role deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete role");
    }
  };

  const handleFormSuccess = (savedRole: Role) => {
    if (editingRoleId) {
      setRoles((prev) =>
        prev.map((r) => (r.id === savedRole.id ? savedRole : r)),
      );
      toast.success("Role updated successfully");
    } else {
      setRoles((prev) => [...prev, savedRole]);
      toast.success("Role created successfully");
    }
    setViewMode("list");
  };

  if (viewMode === "form") {
    return (
      <RoleForm
        role={selectedRole || undefined}
        permissions={permissions}
        onSuccess={handleFormSuccess}
        onCancel={() => setViewMode("list")}
      />
    );
  }

  if (viewMode === "detail" && selectedRole) {
    return (
      <RoleDetailModal
        role={selectedRole}
        onEdit={() => handleEdit(selectedRole)}
        onDelete={() => handleDelete(selectedRole.id)}
        onBack={() => setViewMode("list")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles</h1>
          <p className="text-slate-500 mt-1">
            Manage system roles and permissions
          </p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create Role
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : (
          <RoleList
            roles={roles}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </Card>
    </div>
  );
}
