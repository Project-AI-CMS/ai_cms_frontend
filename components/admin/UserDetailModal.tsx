"use client";

import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Role } from "@/types/admin";

interface UserDetailModalProps {
  user: User;
  roles: Role[];
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function UserDetailModal({
  user,
  roles,
  onEdit,
  onDelete,
  onBack,
}: UserDetailModalProps) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-slate-500 mt-1">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline" className="gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button
            onClick={onDelete}
            variant="outline"
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-600">Username</h3>
          <p className="mt-1">{user.username}</p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-slate-600">Status</h3>
          <Badge className="mt-1" variant={user.enabled ? "default" : "secondary"}>
            {user.enabled ? "Active" : "Inactive"}
          </Badge>
        </Card>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Assigned Roles</h2>
        {user.roles.length === 0 ? (
          <p className="text-slate-500">No roles assigned</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {user.roles.map((role) => (
              <Badge key={role.id} variant="secondary">
                {role.name}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
