"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { permissionApi } from "@/lib/admin";
import { Permission } from "@/types/admin";
import { toast } from "sonner";

interface PermissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: (permission: Permission) => void;
}

export function PermissionFormDialog({
  open,
  onOpenChange,
  onSuccess,
}: PermissionFormDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Permission name is required");
      return;
    }

    setLoading(true);

    try {
      const newPermission = await permissionApi.create({
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onSuccess(newPermission);
      setName("");
      setDescription("");
    } catch (err: any) {
      setError(err.message || "Failed to create permission");
      toast.error(err.message || "Failed to create permission");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setName("");
      setDescription("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Permission</DialogTitle>
          <DialogDescription>
            Add a new permission to the system
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Permission Name</Label>
            <Input
              id="name"
              placeholder="e.g., DELETE_USERS, CREATE_REPORTS"
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
              placeholder="Describe what this permission allows"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              rows={3}
              className="mt-1"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Permission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
