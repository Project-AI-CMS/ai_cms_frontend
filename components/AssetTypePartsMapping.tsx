"use client";
import { useCallback, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Package,
  Link as LinkIcon,
  Search,
  Settings,
} from "lucide-react";
import type { AssetTypePart, SparePart, AssetType, UserInfo } from "@/types";
import { assetTypeApi, sparePartApi, assetTypePartApi } from "@/lib/api";

type AssetTypePartsProps = {
  user?: UserInfo;
};

type AssetTypePartFormData = Omit<
  AssetTypePart,
  "id" | "createdAt" | "updatedAt"
>;

const initialFormData: AssetTypePartFormData = {
  partId: "",
  assetTypeId: "",
  quantityPerAsset: 1,
  positionReference: "",
};

const defaultUser: UserInfo = {
  email: "guest@example.com",
  name: "Guest",
  role: "Administrator",
};

export function AssetTypePartsMapping({
  user = defaultUser,
}: AssetTypePartsProps) {
  const [mappings, setMappings] = useState<AssetTypePart[]>([]);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [spareParts, setSpareParts] = useState<SparePart[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAssetType, setFilterAssetType] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<AssetTypePart | null>(
    null
  );
  const [formData, setFormData] =
    useState<AssetTypePartFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<
    Partial<Record<keyof AssetTypePartFormData, string>>
  >({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const hasAccess = user.role === "Administrator";

  const normalizeAssetType = (raw: any): AssetType => ({
    id: raw.id,
    name: raw.name,
    description: raw.description,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });

  const normalizeSparePart = (raw: any): SparePart => ({
    id: raw.id,
    partNumber: raw.partNumber,
    name: raw.name,
    description: raw.description,
    quantityOnHand: raw.quantityOnHand,
    reorderThreshold: raw.reorderThreshold,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });

  const normalizeMapping = (raw: any): AssetTypePart => ({
    id: raw.id,
    partId: raw.partId,
    assetTypeId: raw.assetTypeId,
    quantityPerAsset: raw.quantityPerAsset,
    positionReference: raw.positionReference || "",
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [assetTypesResp, sparePartsResp, mappingsResp] = await Promise.all([
        assetTypeApi.getAll(),
        sparePartApi.getAll(),
        assetTypePartApi.getAll(),
      ]);

      const atData = Array.isArray(assetTypesResp)
        ? assetTypesResp
        : assetTypesResp?.data || [];
      setAssetTypes(atData.map(normalizeAssetType));

      const spData = Array.isArray(sparePartsResp)
        ? sparePartsResp
        : sparePartsResp?.data || [];
      setSpareParts(spData.map(normalizeSparePart));

      const mpData = Array.isArray(mappingsResp)
        ? mappingsResp
        : mappingsResp?.data || [];
      setMappings(mpData.map(normalizeMapping));
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message || err.message || "Failed to load data"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getAssetTypeName = (id: string) =>
    assetTypes.find((t) => t.id === id)?.name || "Unknown";
  const getSparePart = (id: string) => spareParts.find((p) => p.id === id);

  const filteredMappings = mappings.filter((mapping) => {
    const part = getSparePart(mapping.partId);
    const assetType = getAssetTypeName(mapping.assetTypeId);
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      part?.name.toLowerCase().includes(term) ||
      part?.partNumber.toLowerCase().includes(term) ||
      assetType.toLowerCase().includes(term) ||
      mapping.positionReference?.toLowerCase().includes(term);
    const matchesFilter =
      filterAssetType === "all" || mapping.assetTypeId === filterAssetType;
    return matchesSearch && matchesFilter;
  });

  const totalMappings = mappings.length;
  const uniqueAssetTypes = new Set(mappings.map((m) => m.assetTypeId)).size;
  const uniqueParts = new Set(mappings.map((m) => m.partId)).size;

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AssetTypePartFormData, string>> = {};
    if (!formData.partId) errors.partId = "Spare part is required";
    if (!formData.assetTypeId) errors.assetTypeId = "Asset type is required";
    if (formData.quantityPerAsset <= 0)
      errors.quantityPerAsset = "Quantity must be greater than 0";

    const isDuplicate = mappings.some(
      (m) =>
        m.partId === formData.partId &&
        m.assetTypeId === formData.assetTypeId &&
        (!selectedMapping || m.id !== selectedMapping.id)
    );
    if (isDuplicate) {
      errors.partId = "This spare part is already mapped to this asset type";
      setErrorMessage(
        "Duplicate mapping: This spare part is already mapped to the selected asset type"
      );
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;
    setSaving(true);
    try {
      const payload = {
        partId: formData.partId,
        assetTypeId: formData.assetTypeId,
        quantityPerAsset: formData.quantityPerAsset,
        positionReference: formData.positionReference || undefined,
      };
      const created = await assetTypePartApi.create(payload);
      const createdObj = Array.isArray(created) ? created[0] : created;
      const normalized = normalizeMapping(createdObj);
      setMappings((prev) => [...prev, normalized]);
      setSuccessMessage("Mapping created successfully");
      setIsCreateDialogOpen(false);
      setFormData(initialFormData);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err.message ||
          "Failed to create mapping"
      );
    } finally {
      setSaving(false);
    }
  };


  const handleDelete = async () => {
    if (!selectedMapping) return;
    setSaving(true);
    try {
      await assetTypePartApi.delete(selectedMapping.assetTypeId, selectedMapping.partId);
      setMappings((prev) => prev.filter((m) => m.id !== selectedMapping.id));
      setSuccessMessage("Mapping deleted successfully");
      setIsDeleteDialogOpen(false);
      setSelectedMapping(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err: any) {
      setErrorMessage(
        err?.response?.data?.message ||
          err.message ||
          "Failed to delete mapping"
      );
    } finally {
      setSaving(false);
    }
  };


  const openDeleteDialog = (mapping: AssetTypePart) => {
    setSelectedMapping(mapping);
    setIsDeleteDialogOpen(true);
  };

  const openCreateDialog = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setErrorMessage("");
    setIsCreateDialogOpen(true);
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
          <h2 className="text-2xl text-slate-900 mb-1">
            Asset Type Parts Mapping
          </h2>
          <p className="text-slate-600">
            Manage spare parts requirements for each asset type
          </p>
        </div>
        <Button onClick={openCreateDialog} disabled={loading}>
          <Plus className="w-4 h-4 mr-2" />
          Add Mapping
        </Button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Mappings</p>
              <p className="text-2xl text-slate-900">{totalMappings}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Asset Types Mapped</p>
              <p className="text-2xl text-slate-900">{uniqueAssetTypes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Unique Parts Used</p>
              <p className="text-2xl text-slate-900">{uniqueParts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by part name, asset type, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterAssetType} onValueChange={setFilterAssetType}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by Asset Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Asset Types</SelectItem>
              {assetTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Mappings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm text-slate-600">
                  Asset Type
                </th>
                <th className="text-left p-4 text-sm text-slate-600">
                  Spare Part
                </th>
                <th className="text-left p-4 text-sm text-slate-600">
                  Part Number
                </th>
                <th className="text-right p-4 text-sm text-slate-600">
                  Qty per Asset
                </th>
                <th className="text-left p-4 text-sm text-slate-600">
                  Position Reference
                </th>
                <th className="text-center p-4 text-sm text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredMappings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-500">
                    {loading ? "Loading..." : "No mappings found"}
                  </td>
                </tr>
              ) : (
                filteredMappings.map((mapping) => {
                  const part = getSparePart(mapping.partId);
                  const assetTypeName = getAssetTypeName(mapping.assetTypeId);

                  return (
                    <tr key={mapping.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-slate-900 font-medium">
                            {assetTypeName}
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-900">
                          {part?.name || "Unknown"}
                        </p>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {part?.partNumber || "N/A"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm text-slate-900 font-medium">
                          {mapping.quantityPerAsset}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-600">
                          {mapping.positionReference || "-"}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(mapping)}
                            disabled={saving}
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
            <DialogTitle>Add New Mapping</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="assetTypeId">Asset Type *</Label>
              <Select
                value={formData.assetTypeId}
                onValueChange={(value) => {
                  setFormData({ ...formData, assetTypeId: value });
                  setFormErrors({ ...formErrors, assetTypeId: undefined });
                  setErrorMessage("");
                }}
              >
                <SelectTrigger
                  className={formErrors.assetTypeId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                      {type.description && (
                        <span className="text-xs text-slate-500">
                          {" "}
                          - {type.description}
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.assetTypeId && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.assetTypeId}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="partId">Spare Part *</Label>
              <Select
                value={formData.partId}
                onValueChange={(value) => {
                  setFormData({ ...formData, partId: value });
                  setFormErrors({ ...formErrors, partId: undefined });
                  setErrorMessage("");
                }}
              >
                <SelectTrigger
                  className={formErrors.partId ? "border-red-500" : ""}
                >
                  <SelectValue placeholder="Select spare part" />
                </SelectTrigger>
                <SelectContent>
                  {spareParts.map((part) => (
                    <SelectItem key={part.id} value={part.id}>
                      <div className="flex items-center gap-2">
                        <span>{part.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {part.partNumber}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.partId && (
                <p className="text-xs text-red-600 mt-1">{formErrors.partId}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quantityPerAsset">Quantity per Asset *</Label>
              <Input
                id="quantityPerAsset"
                type="number"
                value={String(formData.quantityPerAsset)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    quantityPerAsset: parseInt(e.target.value) || 0,
                  })
                }
                min={1}
                placeholder="e.g., 4"
              />
              {formErrors.quantityPerAsset && (
                <p className="text-xs text-red-600 mt-1">
                  {formErrors.quantityPerAsset}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="positionReference">Position Reference</Label>
              <Input
                id="positionReference"
                value={formData.positionReference}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    positionReference: e.target.value,
                  })
                }
                placeholder="e.g., HP/LP Rotor Bearings"
              />
              <p className="text-xs text-slate-500 mt-1">
                Optional: Specify where this part is used in the asset
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving ? "Saving..." : "Create Mapping"}
            </Button>
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
            <AlertDialogTitle>Delete Mapping</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mapping?
              <br />
              <br />
              <strong>Asset Type:</strong>{" "}
              {selectedMapping && getAssetTypeName(selectedMapping.assetTypeId)}
              <br />
              <strong>Spare Part:</strong>{" "}
              {selectedMapping && getSparePart(selectedMapping.partId)?.name}
              <br />
              <br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={saving}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
