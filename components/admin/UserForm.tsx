"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { userApi } from "@/lib/admin";
import { User, Role, CreateUserRequest, UpdateUserRequest } from "@/types/admin";
import { toast } from "sonner";

interface UserFormProps {
  user?: User;
  roles: Role[];
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

export function UserForm({
  user,
  roles,
  onSuccess,
  onCancel,
}: UserFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(
    new Set()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setEmail(user.email);
      setUsername(user.username);
      setEnabled(user.enabled);
      setSelectedRoleIds(new Set(user.roles.map((r) => r.id)));
    }
  }, [user]);

  const handleRoleToggle = (roleId: string) => {
    const newRoles = new Set(selectedRoleIds);
    if (newRoles.has(roleId)) {
      newRoles.delete(roleId);
    } else {
      newRoles.add(roleId);
    }
    setSelectedRoleIds(newRoles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim() || !email.trim() || !username.trim()) {
      setError("All fields are required");
      return;
    }

    if (!user && !password) {
      setError("Password is required for new users");
      return;
    }

    if (!user && password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      let savedUser: User;

      if (user) {
        const updateData: UpdateUserRequest = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          enabled,
        };
        savedUser = await userApi.update(user.id, updateData);

        // Handle role changes
        const currentRoleIds = new Set(user.roles.map((r) => r.id));
        for (const roleId of selectedRoleIds) {
          if (!currentRoleIds.has(roleId)) {
            await userApi.assignRole(user.id, roleId);
          }
        }
        for (const roleId of currentRoleIds) {
          if (!selectedRoleIds.has(roleId)) {
            await userApi.removeRole(user.id, roleId);
          }
        }

        savedUser = await userApi.getById(user.id);
      } else {
        const createData: CreateUserRequest = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          username: username.trim(),
          password,
          roleIds: Array.from(selectedRoleIds),
        };
        savedUser = await userApi.create(createData);
      }

      onSuccess(savedUser);
    } catch (err: any) {
      setError(err.message || "Failed to save user");
      toast.error(err.message || "Failed to save user");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onCancel} disabled={loading} className="gap-2">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>

      <div>
        <h1 className="text-3xl font-bold">{user ? "Edit User" : "Create User"}</h1>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">User Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>First Name</Label>
              <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={loading} required className="mt-1" />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={loading} required className="mt-1" />
            </div>
          </div>
          <div>
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading || !!user} required className="mt-1" />
          </div>
          <div>
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} disabled={loading || !!user} required className="mt-1" />
          </div>
          {!user && (
            <div>
              <Label>Password</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} required className="mt-1" />
            </div>
          )}
          <div className="flex items-center space-x-2">
            <Checkbox id="enabled" checked={enabled} onCheckedChange={(c) => setEnabled(c as boolean)} disabled={loading} />
            <Label htmlFor="enabled" className="font-normal cursor-pointer">Enabled</Label>
          </div>
        </Card>

        <Card className="p-6 space-y-4">
          <h2 className="text-lg font-semibold">Roles</h2>
          <div className="space-y-3">
            {roles.map((role) => (
              <div key={role.id} className="flex items-center space-x-2">
                <Checkbox
                  id={role.id}
                  checked={selectedRoleIds.has(role.id)}
                  onCheckedChange={() => handleRoleToggle(role.id)}
                  disabled={loading}
                />
                <Label htmlFor={role.id} className="font-normal cursor-pointer">{role.name}</Label>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {user ? "Update User" : "Create User"}
          </Button>
        </div>
      </form>
    </div>
  );
}
