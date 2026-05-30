"use client";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { Location, UserInfo } from "@/types";
import { locationApi } from "@/lib/api";

type LocationManagementProps = {
  user: UserInfo;
};

export function LocationManagement({ user }: LocationManagementProps) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [locationHierarchies, setLocationHierarchies] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [locationToDelete, setLocationToDelete] = useState<Location | null>(
    null,
  );
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parentLocationId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Check if user has admin access
  const hasAccess = user.role === "Administrator" || user.role === "Maintenance Manager";

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const [data, hierarchyData] = await Promise.all([
        locationApi.getAll(),
        locationApi.getHierarchies(),
      ]);
      setLocations(data);
      setLocationHierarchies(Array.isArray(hierarchyData) ? hierarchyData : []);
    } catch (error) {
      console.error("Failed to fetch locations:", error);
      setError("Failed to load locations");
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setEditingLocation(null);
    setFormData({ name: "", description: "", parentLocationId: "" });
    setErrors({});
    setDialogOpen(true);
  };

  const openEditDialog = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      name: location.name,
      description: location.description || "",
      parentLocationId: location.parentLocationId || "",
    });
    setErrors({});
    setDialogOpen(true);
  };

  const openDeleteDialog = (location: Location) => {
    setLocationToDelete(location);
    setDeleteDialogOpen(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Location name is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        description: formData.description || undefined,
        parentLocationId: formData.parentLocationId || null,
      };

      if (editingLocation) {
        await locationApi.update(editingLocation.id, payload);
        setSuccess("Location updated successfully");
      } else {
        await locationApi.create(payload);
        setSuccess("Location created successfully");
      }
      setDialogOpen(false);
      fetchLocations();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: unknown) {
      setError((error as Error).message || "Failed to save location");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!locationToDelete) return;

    setSubmitting(true);
    setError("");
    try {
      await locationApi.delete(locationToDelete.id);
      setSuccess("Location deleted successfully");
      setDeleteDialogOpen(false);
      fetchLocations();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error: unknown) {
      setError((error as Error).message || "Failed to delete location");
      setDeleteDialogOpen(false);
    } finally {
      setSubmitting(false);
      setLocationToDelete(null);
    }
  };

  // Get parent location name for display
  const getParentLocationName = (parentId: string | null | undefined) => {
    if (!parentId) return "-";
    const parent = locations.find((loc) => loc.id === parentId);
    return parent?.name || "-";
  };

  // Get available parent locations (exclude self and children to prevent circular references)
  const getAvailableParentLocations = () => {
    if (!editingLocation) return locations;
    return locations.filter((loc) => loc.id !== editingLocation.id);
  };

  const renderLocationTree = (items: Location[], level = 0) => {
    return items.map((location) => (
      <div key={location.id} className="space-y-2">
        <div
          className="flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm"
          style={{ marginLeft: level * 16 }}
        >
          <MapPin className="w-4 h-4 text-blue-600" />
          <span className="font-medium text-slate-900">{location.name}</span>
          {location.description && <span className="text-slate-500">{location.description}</span>}
        </div>
        {location.subLocations?.length ? renderLocationTree(location.subLocations, level + 1) : null}
      </div>
    ));
  };

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Administrator access
            required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Location Management</h2>
          <p className="text-slate-600">Manage facility locations and areas</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {/* Alerts */}
      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Locations Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600 mt-4">Loading locations...</p>
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 mb-4">No locations found</p>
            <Button onClick={openCreateDialog}>
              <Plus className="w-4 h-4 mr-2" />
              Create First Location
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm text-slate-600 font-medium">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-slate-600 font-medium">
                    Description
                  </th>
                  <th className="text-left py-3 px-4 text-sm text-slate-600 font-medium">
                    Parent Location
                  </th>
                  <th className="text-right py-3 px-4 text-sm text-slate-600 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" />
                        <span className="text-sm text-slate-900 font-medium">
                          {location.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {location.description || "-"}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {getParentLocationName(location.parentLocationId)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(location)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(location)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Locations</p>
              <p className="text-2xl text-slate-900">{locations.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Root Locations</p>
              <p className="text-2xl text-slate-900">
                {locations.filter((loc) => !loc.parentLocationId).length}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Sub-Locations</p>
              <p className="text-2xl text-slate-900">
                {locations.filter((loc) => loc.parentLocationId).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-medium text-slate-900 mb-4">Location Hierarchy</h3>
        {locationHierarchies.length === 0 ? (
          <p className="text-sm text-slate-500">No hierarchy data available.</p>
        ) : (
          <div className="space-y-2">{renderLocationTree(locationHierarchies)}</div>
        )}
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingLocation ? "Edit Location" : "Create New Location"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="name">
                  Location Name <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., Building A, Floor 1, Turbine Hall"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of this location"
                />
              </div>

              <div>
                <Label htmlFor="parentLocationId">Parent Location</Label>
                <Select
                  value={formData.parentLocationId}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      parentLocationId: value === "none" ? "" : value,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent location (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      No parent (Root location)
                    </SelectItem>
                    {getAvailableParentLocations().map((loc) => (
                      <SelectItem key={loc.id} value={loc.id}>
                        {loc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting
                  ? "Saving..."
                  : editingLocation
                    ? "Update"
                    : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the location &quot;
              {locationToDelete?.name}&quot;. This action cannot be undone.
              Assets and sub-locations using this location will need to be
              reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
