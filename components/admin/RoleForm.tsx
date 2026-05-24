"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { roleApi } from "@/lib/admin";
import { Role, Permission, CreateRoleRequest } from "@/types/admin";
import { toast } from "sonner";

interface RoleFormProps {
  role?: Role;
  permissions: Permission[];
  onSuccess: (role: Role) => void;
  onCancel: () => void;
}

export function RoleForm({
  role,
  permissions,
  onSuccess,
  onCancel,
}: RoleFormProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<Set<string>>(
    new Set(),
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role) {
      setName(role.name);
      setDescription(role.description || "");
      setSelectedPermissions(new Set(role.permissions.map((p) => p.id)));
    }
  }, [role]);

  const handlePermissionToggle = (permissionId: string, checked: boolean) => {
    const newPermissions = new Set(selectedPermissions);
    if (checked) {
      newPermissions.add(permissionId);
    } else {
      newPermissions.delete(permissionId);
    }
    setSelectedPermissions(newPermissions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Role name is required");
      return;
    }

    setLoading(true);

    try {
      const data: CreateRoleRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
      };

      let savedRole: Role;
      if (role) {
        savedRole = await roleApi.update(role.id, data);

        // Handle permission changes
        const currentPermIds = new Set(role.permissions.map((p) => p.id));

        // Add new permissions
        for (const permId of selectedPermissions) {
          if (!currentPermIds.has(permId)) {
            await roleApi.assignPermission(role.id, permId);
          }
        }

        // Remove permissions
        for (const permId of currentPermIds) {
          if (!selectedPermissions.has(permId)) {
            await roleApi.removePermission(role.id, permId);
          }
        }

        // Refetch to get updated permissions
        savedRole = await roleApi.getById(role.id);
      } else {
        savedRole = await roleApi.create(data);

        // Assign permissions to new role
        for (const permId of selectedPermissions) {
          await roleApi.assignPermission(savedRole.id, permId);
        }

        // Refetch to get updated permissions
        savedRole = await roleApi.getById(savedRole.id);
      }

      onSuccess(savedRole);
    } catch (err: any) {
      setError(err.message || "Failed to save role");
      toast.error(err.message || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        variant="ghost"
        onClick={onCancel}
        className="gap-2"
        disabled={loading}
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {role ? "Edit Role" : "Create Role"}
        </h1>
        <p className="text-slate-500 mt-1">
          {role
            ? "Update role details and permissions"
            : "Create a new role and assign permissions"}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Role Information</h2>

          <div>
            <Label htmlFor="name">Role Name</Label>
            <Input
              id="name"
              placeholder="e.g., Editor, Reviewer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Describe the purpose of this role"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              className="mt-1"
            />
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Permissions</h2>
          <p className="text-sm text-slate-500">
            Select permissions to assign to this role
          </p>

          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {permissions.length === 0 ? (
              <p className="text-slate-500 text-sm">No permissions available</p>
            ) : (
              permissions.map((permission) => (
                <div key={permission.id} className="flex items-start space-x-3">
                  <Checkbox
                    id={permission.id}
                    checked={selectedPermissions.has(permission.id)}
                    onCheckedChange={(checked) =>
                      handlePermissionToggle(permission.id, checked as boolean)
                    }
                    disabled={loading}
                    className="mt-1"
                  />
                  <label
                    htmlFor={permission.id}
                    className="flex-1 cursor-pointer"
                  >
                    <p className="font-medium text-sm">{permission.name}</p>
                    {permission.description && (
                      <p className="text-xs text-slate-500">
                        {permission.description}
                      </p>
                    )}
                  </label>
                </div>
              ))
            )}
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {role ? "Update Role" : "Create Role"}
          </Button>
        </div>
      </form>
    </div>
  );
}
