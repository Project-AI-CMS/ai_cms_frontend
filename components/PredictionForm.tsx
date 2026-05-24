"use client";

import { useState, useEffect } from "react";
import { Loader, AlertCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { analyticsApi } from "@/lib/analytics";
import {
  PredictionResponse,
  ASSET_TYPE_FEATURE_COUNTS,
} from "@/types/analytics";
import { PredictionResultsCard } from "@/components/PredictionResultsCard";
import { assetApi, assetTypeApi } from "@/lib/api";
import type { Asset, AssetType } from "@/types";

interface FormAsset {
  id: string;
  name: string;
  assetTypeId?: string;
  assetType?: { name: string };
  serialNumber?: string;
}

export function PredictionForm() {
  const [assets, setAssets] = useState<FormAsset[]>([]);
  const [assetTypes, setAssetTypes] = useState<Record<string, AssetType>>({});
  const [selectedAsset, setSelectedAsset] = useState<FormAsset | null>(null);
  const [assetType, setAssetType] = useState<string | null>(null);
  const [features, setFeatures] = useState<number[]>([]);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);

  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<
    Record<number, string>
  >({});

  // Load assets and asset types on mount
  useEffect(() => {
    const fetchData = async () => {
      setLoadingAssets(true);
      try {
        // Fetch assets
        const assetResponse = await assetApi.getAll({ limit: 1000 });
        const assetList = Array.isArray(assetResponse)
          ? assetResponse
          : assetResponse.data || [];
        setAssets(assetList);

        // Fetch asset types
        const typesResponse = await assetTypeApi.getAll();
        const typesList = Array.isArray(typesResponse)
          ? typesResponse
          : typesResponse.data || [];

        // Create a lookup map by ID
        const typeMap: Record<string, AssetType> = {};
        typesList.forEach((type: AssetType) => {
          typeMap[type.id] = type;
        });
        setAssetTypes(typeMap);
      } catch (err) {
        console.error("Failed to load data:", err);
        setError("Failed to load assets or asset types");
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchData();
  }, []);

  const handleAssetSelect = (asset: FormAsset) => {
    setSelectedAsset(asset);
    setPrediction(null);
    setSuccess(null);
    setError(null);

    // Get asset type ID
    const assetTypeId = asset.assetTypeId;

    if (!assetTypeId) {
      setError("Asset type ID is missing. Please select a different asset.");
      setAssetType(null);
      setFeatures([]);
      return;
    }

    // Look up the asset type by ID
    const fetchedAssetType = assetTypes[assetTypeId];

    if (!fetchedAssetType) {
      setError(
        "Asset type information not found. Please try again or select a different asset.",
      );
      setAssetType(null);
      setFeatures([]);
      return;
    }

    // Use the asset type name
    const assetTypeName = fetchedAssetType.name
      .toLowerCase()
      .replace(/\s+/g, "_");

    // Try to match to known types for UI purposes (feature count)
    let featureCount = 5; // default
    for (const type of Object.keys(ASSET_TYPE_FEATURE_COUNTS)) {
      if (assetTypeName.includes(type)) {
        featureCount =
          ASSET_TYPE_FEATURE_COUNTS[
            type as keyof typeof ASSET_TYPE_FEATURE_COUNTS
          ];
        break;
      }
    }

    // Store the asset type and initialize features
    setAssetType(assetTypeName);
    setFeatures(Array(featureCount).fill(0));
    setValidationErrors({});
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newErrors = { ...validationErrors };
    const numValue = parseFloat(value);

    if (isNaN(numValue)) {
      newErrors[index] = "Must be a number";
    } else {
      delete newErrors[index];
    }

    setValidationErrors(newErrors);

    const newFeatures = [...features];
    newFeatures[index] = isNaN(numValue) ? 0 : numValue;
    setFeatures(newFeatures);
  };

  const validateForm = (): boolean => {
    if (!selectedAsset) {
      setError("Please select an asset");
      return false;
    }

    if (!assetType) {
      setError("Asset type not available");
      return false;
    }

    // Basic validation: ensure we have features
    if (features.length === 0) {
      setError("Please enter sensor features");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      if (!selectedAsset || !assetType) {
        throw new Error("Asset or asset type not selected");
      }

      const result = await analyticsApi.predictSingle({
        asset_id: selectedAsset.id,
        asset_type: assetType,
        features,
      });

      setPrediction(result);
      setSuccess("Prediction completed successfully!");
    } catch (err) {
      setError((err as Error).message || "Failed to make prediction");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedAsset(null);
    setAssetType(null);
    setFeatures([]);
    setPrediction(null);
    setError(null);
    setSuccess(null);
    setValidationErrors({});
  };

  const featureCount =
    assetType &&
    ASSET_TYPE_FEATURE_COUNTS[assetType as keyof typeof ASSET_TYPE_FEATURE_COUNTS]
      ? ASSET_TYPE_FEATURE_COUNTS[
          assetType as keyof typeof ASSET_TYPE_FEATURE_COUNTS
        ]
      : features.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">
          Single Asset Prediction
        </h1>
        <p className="text-slate-600 mt-1">
          Predict asset health by providing sensor features
        </p>
      </div>

      {prediction && <PredictionResultsCard prediction={prediction} />}

      <Card className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-900">{error}</p>
              </div>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <div className="text-sm font-medium text-green-900">
                {success}
              </div>
            </div>
          )}

          {/* Asset Selection */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-900">
              Select Asset <span className="text-red-600">*</span>
            </label>
            {loadingAssets ? (
              <div className="text-center py-4 text-slate-600">
                Loading assets...
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedAsset?.id || ""}
                  onChange={(e) => {
                    const asset = assets.find((a) => a.id === e.target.value);
                    if (asset) handleAssetSelect(asset);
                  }}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select an asset --</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Asset Type Display */}
          {selectedAsset && assetType && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-slate-600">
                <strong>Asset Type:</strong> {assetType}
              </p>
              <p className="text-sm text-slate-600 mt-1">
                <strong>Required Features:</strong> {featureCount}
              </p>
            </div>
          )}

          {/* Feature Inputs */}
          {selectedAsset && assetType && features.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-900">
                Sensor Features ({featureCount})
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 max-h-96 overflow-y-auto p-4 bg-slate-50 rounded-lg">
                {features.map((value, index) => (
                  <div key={index} className="flex flex-col gap-1">
                    <label className="text-xs font-medium text-slate-700">
                      Feature {index + 1}
                    </label>
                    <Input
                      type="number"
                      step="any"
                      value={value}
                      onChange={(e) =>
                        handleFeatureChange(index, e.target.value)
                      }
                      placeholder={`F${index + 1}`}
                      className={`text-sm ${
                        validationErrors[index]
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                    />
                    {validationErrors[index] && (
                      <p className="text-xs text-red-600">
                        {validationErrors[index]}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !selectedAsset || !assetType}
              className="gap-2"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              {loading ? "Predicting..." : "Make Prediction"}
            </Button>

            <Button
              type="button"
              onClick={handleReset}
              variant="outline"
              disabled={loading}
            >
              Reset
            </Button>
          </div>
        </form>
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-semibold text-slate-900 mb-2">How to use:</h4>
        <ul className="text-sm text-slate-700 space-y-1 list-disc list-inside">
          <li>Select an asset from your inventory</li>
          <li>The asset type is automatically fetched from the system</li>
          <li>Enter numeric sensor readings in the feature fields</li>
          <li>Click "Make Prediction" to get asset health status</li>
          <li>Results show health status, confidence score, and recommendations</li>
        </ul>
      </Card>
    </div>
  );
}
