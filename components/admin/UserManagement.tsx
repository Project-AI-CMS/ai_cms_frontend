"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { userApi, roleApi } from "@/lib/admin";
import { User, Role, PagedUser } from "@/types/admin";
import { UserList } from "./UserList";
import { UserForm } from "./UserForm";
import { UserDetailModal } from "./UserDetailModal";
import { toast } from "sonner";

type ViewMode = "list" | "form" | "detail";

export function UserManagement() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [searchEmail, setSearchEmail] = useState("");

  const fetchRoles = useCallback(async () => {
    try {
      const data = await roleApi.getAll();
      setRoles(data);
    } catch (err) {
      console.error("Failed to fetch roles:", err);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userApi.getAll(page, pageSize);
      setUsers(response.content);
      setTotalPages(response.totalPages);
    } catch (err: any) {
      setError(err.message || "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, [fetchRoles, fetchUsers]);

  const handleCreate = () => {
    setEditingUserId(null);
    setSelectedUser(null);
    setViewMode("form");
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditingUserId(user.id);
    setViewMode("form");
  };

  const handleView = (user: User) => {
    setSelectedUser(user);
    setViewMode("detail");
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      await userApi.delete(userId);
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      toast.success("User deleted successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    }
  };

  const handleFormSuccess = (savedUser: User) => {
    if (editingUserId) {
      setUsers((prev) =>
        prev.map((u) => (u.id === savedUser.id ? savedUser : u)),
      );
      toast.success("User updated successfully");
    } else {
      setUsers((prev) => [...prev, savedUser]);
      toast.success("User created successfully");
    }
    setViewMode("list");
  };

  if (viewMode === "form") {
    return (
      <UserForm
        user={selectedUser || undefined}
        roles={roles}
        onSuccess={handleFormSuccess}
        onCancel={() => setViewMode("list")}
      />
    );
  }

  if (viewMode === "detail" && selectedUser) {
    return (
      <UserDetailModal
        user={selectedUser}
        roles={roles}
        onEdit={() => handleEdit(selectedUser)}
        onDelete={() => handleDelete(selectedUser.id)}
        onBack={() => setViewMode("list")}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-slate-500 mt-1">Manage system users and roles</p>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          Create User
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
          <>
            <div className="p-4 border-b">
              <Input
                placeholder="Search by email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="max-w-md"
              />
            </div>
            <UserList
              users={users}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
            <div className="p-4 border-t flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing page {page + 1} of {totalPages}
              </p>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setPage((p) => (p < totalPages - 1 ? p + 1 : p))
                  }
                  disabled={page >= totalPages - 1}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
