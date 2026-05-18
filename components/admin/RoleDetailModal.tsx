"use client";

import { ArrowLeft, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Role } from "@/types/admin";

interface RoleDetailModalProps {
  role: Role;
  onEdit: () => void;
  onDelete: () => void;
  onBack: () => void;
}

export function RoleDetailModal({
  role,
  onEdit,
  onDelete,
  onBack,
}: RoleDetailModalProps) {
  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{role.name}</h1>
          {role.description && (
            <p className="text-slate-500 mt-1">{role.description}</p>
          )}
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

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">Permissions</h2>
        {role.permissions.length === 0 ? (
          <p className="text-slate-500">No permissions assigned</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {role.permissions.map((permission) => (
              <Badge key={permission.id} variant="secondary">
                {permission.name}
              </Badge>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
