"use client";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
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
import { Textarea } from "./ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  Package,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { SparePart } from "@/types";
import { sparePartApi } from "@/lib/api";

type SparePartFormData = Omit<SparePart, "id" | "createdAt" | "updatedAt">;

const initialFormData: SparePartFormData = {
  partNumber: "",
  name: "",
  description: "",
  quantityOnHand: 0,
  reorderThreshold: 0,
};

// Mock data for demonstration
interface SparePartUI {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  quantityOnHand: number;
  reorderThreshold: number;
  createdAt?: string;
  updatedAt?: string;
}

export function SparePartsManagement() {
  // local UI model uses camelCase field names; we'll map to/from API snake_case
  const [spareParts, setSpareParts] = useState<SparePartUI[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePartUI | null>(null);
  const [formData, setFormData] = useState<SparePartFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof SparePartFormData, string>>
  >({});
  const [successMessage, setSuccessMessage] = useState("");

  const fetchSpareParts = async (): Promise<SparePartUI[]> => {
    try {
      const resp = await sparePartApi.getAll();
      const list = Array.isArray(resp) ? resp : resp && (resp.data ?? []);
      // map snake_case -> camelCase for UI
      const mapped = (list as SparePart[]).map((p: SparePart) => ({
        id: p.id,
        partNumber: p.partNumber,
        name: p.name,
        description: p.description,
        quantityOnHand: p.quantityOnHand,
        reorderThreshold: p.reorderThreshold,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      }));
      return mapped;
    } catch (err) {
      console.error("Failed to load spare parts", err);
      return [];
    }
  };

  // Fetch spare parts from API on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      const mapped = await fetchSpareParts();
      if (mounted) setSpareParts(mapped);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter spare parts based on search
  const filteredParts = spareParts.filter(
    (part) =>
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalParts = spareParts.length;
  const lowStockParts = spareParts.filter(
    (p) => p.quantityOnHand <= p.reorderThreshold && p.quantityOnHand > 0
  ).length;
  const outOfStockParts = spareParts.filter(
    (p) => p.quantityOnHand === 0
  ).length;

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof SparePartFormData, string>> = {};

    if (!formData.partNumber.trim()) {
      errors.partNumber = "Part number is required";
    }
    if (!formData.name.trim()) {
      errors.name = "Part name is required";
    }
    if (formData.quantityOnHand < 0) {
      errors.quantityOnHand = "Quantity cannot be negative";
    }
    if (formData.reorderThreshold < 0) {
      errors.reorderThreshold = "Reorder threshold cannot be negative";
    }
    // unit_cost removed from schema

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create -> call API
  const handleCreate = async () => {
    if (!validateForm()) return;
    try {
      const payloadApi = {
        name: formData.name,
        description: formData.description,
        reorderThreshold: formData.reorderThreshold,
      };
      const created = await sparePartApi.create(payloadApi);
      // map back to UI model
      const ui: SparePartUI = {
        id: created.id,
        partNumber: created.partNumber,
        name: created.name,
        description: created.description,
        quantityOnHand: created.quantityOnHand,
        reorderThreshold: created.reorderThreshold,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      };
      setSpareParts((prev) => [...prev, ui]);
      setSuccessMessage("Spare part created successfully");
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to create spare part", err);
      setSuccessMessage("Failed to create spare part");
    }
  };

  // Handle edit -> call API
  const handleEdit = async () => {
    if (!selectedPart || !validateForm()) return;
    try {
      const payloadApi: Omit<SparePart, "id" | "createdAt" | "updatedAt"> = {
        partNumber: formData.partNumber,
        name: formData.name,
        description: formData.description,
        quantityOnHand: formData.quantityOnHand,
        reorderThreshold: formData.reorderThreshold,
      };
      const updated = await sparePartApi.update(selectedPart.id, payloadApi);
      const ui: SparePartUI = {
        id: updated.id,
        partNumber: updated.partNumber,
        name: updated.name,
        description: updated.description,
        quantityOnHand: updated.quantityOnHand,
        reorderThreshold: updated.reorderThreshold,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };
      setSpareParts((prev) =>
        prev.map((p) => (p.id === selectedPart.id ? ui : p))
      );
      setSuccessMessage("Spare part updated successfully");
      setIsEditDialogOpen(false);
      setSelectedPart(null);
      setFormData(initialFormData);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to update spare part", err);
      setSuccessMessage("Failed to update spare part");
    }
  };

  // Handle delete -> call API
  const handleDelete = async () => {
    if (!selectedPart) return;
    try {
      await sparePartApi.delete(selectedPart.id);
      setSpareParts((prev) =>
        prev.filter((part) => part.id !== selectedPart.id)
      );
      setSuccessMessage("Spare part deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedPart(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Failed to delete spare part", err);
      setSuccessMessage("Failed to delete spare part");
    }
  };

  // Open edit dialog
  const openEditDialog = (part: SparePartUI) => {
    setSelectedPart(part);
    setFormData({
      partNumber: part.partNumber,
      name: part.name,
      description: part.description,
      quantityOnHand: part.quantityOnHand,
      reorderThreshold: part.reorderThreshold,
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (part: SparePartUI) => {
    setSelectedPart(part);
    setIsDeleteDialogOpen(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsCreateDialogOpen(true);
  };

  // Get stock status
  const getStockStatus = (part: SparePartUI) => {
    if (part.quantityOnHand === 0) {
      return {
        label: "Out of Stock",
        color: "bg-red-100 text-red-700",
        icon: AlertTriangle,
      };
    }
    if (part.quantityOnHand <= part.reorderThreshold) {
      return {
        label: "Low Stock",
        color: "bg-orange-100 text-orange-700",
        icon: TrendingDown,
      };
    }
    return {
      label: "In Stock",
      color: "bg-green-100 text-green-700",
      icon: CheckCircle,
    };
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Parts</p>
              <p className="text-2xl text-slate-900">{totalParts}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Low Stock</p>
              <p className="text-2xl text-slate-900">{lowStockParts}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Out of Stock</p>
              <p className="text-2xl text-slate-900">{outOfStockParts}</p>
            </div>
          </div>
        </Card>
        
      </div>

      {/* Search and Actions */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by part name or number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Spare Part
          </Button>
        </div>
      </Card>

      {/* Spare Parts Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm text-slate-600">
                  Part Number
                </th>
                <th className="text-left p-4 text-sm text-slate-600">Name</th>
                <th className="text-right p-4 text-sm text-slate-600">
                  Quantity
                </th>
                <th className="text-right p-4 text-sm text-slate-600">
                  Reorder Level
                </th>
                <th className="text-center p-4 text-sm text-slate-600">
                  Status
                </th>
                <th className="text-center p-4 text-sm text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-500">
                    No spare parts found
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const status = getStockStatus(part);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={part.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <p className="text-sm text-slate-900">
                          {part.partNumber}
                        </p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-900">{part.name}</p>
                        {part.description && (
                          <p className="text-xs text-slate-500 mt-1">
                            {part.description}
                          </p>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm text-slate-900">
                          {part.quantityOnHand}
                        </p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm text-slate-900">
                          {part.reorderThreshold}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(part)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(part)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Spare Part</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partNumber">Part Number *</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) =>
                  setFormData({ ...formData, partNumber: e.target.value })
                }
                placeholder="e.g., TB-600-HS"
              />
              {formErrors.partNumber && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.partNumber}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Turbine Bearing Set"
              />
              {formErrors.name && (
                <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Enter part description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="quantityOnHand">Quantity on Hand *</Label>
              <Input
                id="quantityOnHand"
                type="number"
                value={formData.quantityOnHand}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantityOnHand: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
              />
              {formErrors.quantityOnHand && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.quantityOnHand}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="reorderThreshold">Reorder Threshold *</Label>
              <Input
                id="reorderThreshold"
                type="number"
                value={formData.reorderThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorderThreshold: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
              />
              {formErrors.reorderThreshold && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.reorderThreshold}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Spare Part</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Spare Part</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_name">Part Name *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
              {formErrors.name && (
                <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit_reorderThreshold">Reorder Threshold *</Label>
              <Input
                id="edit_reorderThreshold"
                type="number"
                value={formData.reorderThreshold}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    reorderThreshold: parseInt(e.target.value) || 0,
                  })
                }
                min="0"
              />
              {formErrors.reorderThreshold && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.reorderThreshold}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Spare Part</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Spare Part</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{selectedPart?.name}</strong> ({selectedPart?.partNumber}
              )? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
