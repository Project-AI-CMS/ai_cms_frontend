"use client";

import { Permission } from "@/types/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PermissionListProps {
  permissions: Permission[];
}

export function PermissionList({ permissions }: PermissionListProps) {
  if (permissions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-slate-500">No permissions found</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {permissions.map((permission) => (
          <TableRow key={permission.id} className="hover:bg-slate-50">
            <TableCell className="font-medium">{permission.name}</TableCell>
            <TableCell className="text-slate-600">
              {permission.description || "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
