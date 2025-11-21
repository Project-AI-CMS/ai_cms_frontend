"use client";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { Asset, AssetType, Location } from "@/types";
import { assetApi, assetTypeApi, locationApi } from "@/lib/api";

type AssetFormProps = {
  assetId?: string; // undefined for create, id for edit
  onBack: () => void;
  onSuccess: () => void;
};

export function AssetForm({ assetId, onBack, onSuccess }: AssetFormProps) {
  const isEdit = !!assetId && assetId !== "new";

  const [formData, setFormData] = useState({
    name: "",
    serialNumber: "",
    assetTypeId: "",
    locationId: "",
    parentAssetId: "",
    installationDate: "",
  });

  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [parentAssets, setParentAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFormData();
  }, [assetId]);

  const fetchFormData = async () => {
    try {
      // Fetch dropdown data
      const [typesData, locationsData, assetsData] = await Promise.all([
        assetTypeApi.getAll(),
        locationApi.getAll(),
        assetApi.getAll({}),
      ]);

      setAssetTypes(typesData);
      setLocations(locationsData);
      const assetsList = Array.isArray(assetsData)
        ? assetsData
        : assetsData?.data || [];
      setParentAssets(assetsList);

      // If editing, fetch asset data
      if (isEdit) {
        const assetData = await assetApi.getById(assetId);
        setFormData({
          name: assetData.name,
          serialNumber: assetData.serialNumber,
          assetTypeId: assetData.assetTypeId,
          locationId: assetData.locationId,
          parentAssetId: assetData.parentAssetId || "",
          installationDate: assetData.installationDate,
        });
      }
    } catch (error) {
      setError("Failed to load form data");
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Asset name is required";
    if (!formData.serialNumber.trim())
      newErrors.serialNumber = "Serial number is required";
    if (!formData.assetTypeId) newErrors.assetTypeId = "Asset type is required";
    if (!formData.locationId) newErrors.locationId = "Location is required";
    if (!formData.installationDate)
      newErrors.installationDate = "Installation date is required";
    // Only validate fields present in the Asset schema

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setError("Please fix the validation errors");
      return;
    }

    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        serialNumber: formData.serialNumber,
        assetTypeId: formData.assetTypeId,
        locationId: formData.locationId,
        parentAssetId: formData.parentAssetId || null,
        installationDate: formData.installationDate,
      };

      if (isEdit) {
        await assetApi.update(assetId, submitData);
        setSuccess("Asset updated successfully");
      } else {
        await assetApi.create(submitData);
        setSuccess("Asset created successfully");
      }

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setError(error.message || "Failed to save asset");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 mt-4">Loading asset data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">
            {isEdit ? "Edit Asset" : "Create New Asset"}
          </h2>
          <p className="text-slate-600">
            {isEdit
              ? "Update asset information"
              : "Add a new asset to the system"}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg text-slate-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    Asset Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    placeholder="Enter asset name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="serialNumber">
                    Serial Number <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="serialNumber"
                    value={formData.serialNumber}
                    onChange={(e) =>
                      handleChange("serialNumber", e.target.value)
                    }
                    placeholder="Enter serial number"
                    className={errors.serialNumber ? "border-red-500" : ""}
                  />
                  {errors.serialNumber && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.serialNumber}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Classification */}
            <div>
              <h3 className="text-lg text-slate-900 mb-4">Classification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="assetTypeId">
                    Asset Type <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.assetTypeId}
                    onValueChange={(value) =>
                      handleChange("assetTypeId", value)
                    }
                  >
                    <SelectTrigger
                      className={errors.assetTypeId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assetTypeId && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.assetTypeId}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="locationId">
                    Location <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.locationId}
                    onValueChange={(value) => handleChange("locationId", value)}
                  >
                    <SelectTrigger
                      className={errors.locationId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.locationId && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.locationId}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="parentAssetId">Parent Asset (Optional)</Label>
                  <Select
                    value={formData.parentAssetId || "none"}
                    onValueChange={(value) =>
                      handleChange(
                        "parentAssetId",
                        value === "none" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent asset (if any)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {parentAssets &&
                        parentAssets
                          .filter((a) => a.id !== assetId) // Don't allow self as parent
                          .map((asset) => (
                            <SelectItem key={asset.id} value={asset.id}>
                              {asset.name}
                            </SelectItem>
                          ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="installationDate">
                    Installation Date <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="installationDate"
                    type="date"
                    value={formData.installationDate}
                    onChange={(e) =>
                      handleChange("installationDate", e.target.value)
                    }
                    className={errors.installationDate ? "border-red-500" : ""}
                  />
                  {errors.installationDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.installationDate}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Status and technical fields removed to match Asset schema */}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : isEdit ? "Update Asset" : "Create Asset"}
          </Button>
        </div>
      </form>
    </div>
  );
}
