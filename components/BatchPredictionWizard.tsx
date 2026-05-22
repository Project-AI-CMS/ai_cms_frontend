"use client";

import { useState } from "react";
import { Loader, AlertCircle, CheckCircle2, Plus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/analytics";
import {
  PredictionRequest,
  PredictionResponse,
  ASSET_TYPE_FEATURE_COUNTS,
} from "@/types/analytics";

type BatchStep = "input" | "review" | "processing" | "results";

interface BatchItem extends PredictionRequest {
  id: string;
}

interface BatchResult extends PredictionResponse {
  id: string;
  error?: string;
}

export function BatchPredictionWizard() {
  const [step, setStep] = useState<BatchStep>("input");
  const [batchItems, setBatchItems] = useState<BatchItem[]>([]);
  const [results, setResults] = useState<BatchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [processed, setProcessed] = useState(0);

  const [currentItem, setCurrentItem] = useState<Partial<BatchItem>>({
    id: "",
    asset_id: "",
    asset_type: "battery",
    features: [],
  });

  const handleAddItem = () => {
    setError(null);

    if (!currentItem.asset_id?.trim()) {
      setError("Asset ID is required");
      return;
    }

    if (!currentItem.asset_type) {
      setError("Asset Type is required");
      return;
    }

    const assetType =
      currentItem.asset_type as keyof typeof ASSET_TYPE_FEATURE_COUNTS;
    if (!(assetType in ASSET_TYPE_FEATURE_COUNTS)) {
      setError("Invalid asset type");
      return;
    }

    const requiredCount = ASSET_TYPE_FEATURE_COUNTS[assetType];
    if (
      !currentItem.features ||
      currentItem.features.length !== requiredCount
    ) {
      setError(`${assetType} requires exactly ${requiredCount} features`);
      return;
    }

    const newItem: BatchItem = {
      id: `item-${Date.now()}`,
      asset_id: currentItem.asset_id.trim(),
      asset_type: assetType,
      features: currentItem.features,
    };

    setBatchItems([...batchItems, newItem]);
    setCurrentItem({
      id: "",
      asset_id: "",
      asset_type: "battery",
      features: [],
    });
  };

  const handleRemoveItem = (id: string) => {
    setBatchItems(batchItems.filter((item) => item.id !== id));
  };

  const handleFeatureChange = (index: number, value: string) => {
    const numValue = parseFloat(value);
    const newFeatures = [...(currentItem.features || [])];
    newFeatures[index] = isNaN(numValue) ? 0 : numValue;
    setCurrentItem({ ...currentItem, features: newFeatures });
  };

  const handleAssetTypeChange = (newType: string) => {
    const assetType = newType as keyof typeof ASSET_TYPE_FEATURE_COUNTS;
    const count = ASSET_TYPE_FEATURE_COUNTS[assetType];
    setCurrentItem({
      ...currentItem,
      asset_type: assetType,
      features: Array(count).fill(0),
    });
  };

  const handleStartProcessing = () => {
    if (batchItems.length === 0) {
      setError("Add at least one item to the batch");
      return;
    }

    setStep("processing");
    setProcessed(0);
    setResults([]);
    setError(null);
    processBatch();
  };

  const processBatch = async () => {
    setLoading(true);

    try {
      const predictions = batchItems.map((item) => ({
        asset_id: item.asset_id,
        asset_type: item.asset_type,
        features: item.features,
      }));

      const batchResults = await analyticsApi.predictBatch(predictions);

      const resultsWithIds: BatchResult[] = batchResults.map(
        (result, index) => ({
          ...result,
          id: batchItems[index].id,
        }),
      );

      setResults(resultsWithIds);
      setProcessed(batchResults.length);
      setStep("results");
    } catch (err) {
      setError((err as Error).message || "Failed to process batch");
      setStep("results");
    } finally {
      setLoading(false);
    }
  };

  const successCount = results.filter((r) => !r.error).length;
  const errorCount = results.filter((r) => r.error).length;

  const currentAssetType =
    currentItem.asset_type as keyof typeof ASSET_TYPE_FEATURE_COUNTS;
  const featureCount = currentAssetType
    ? ASSET_TYPE_FEATURE_COUNTS[currentAssetType]
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Batch Predictions</h1>
        <p className="text-slate-600 mt-1">
          Run predictions for multiple assets at once
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex gap-2 justify-between">
        {["input", "review", "processing", "results"].map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step === s
                  ? "bg-blue-600 text-white"
                  : ["input", "review", "processing", "results"].indexOf(step) >
                      i
                    ? "bg-green-600 text-white"
                    : "bg-gray-300 text-gray-600"
              }`}
            >
              {["input", "review", "processing", "results"].indexOf(step) >
              i ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                i + 1
              )}
            </div>
            {i < 3 && (
              <div
                className={`flex-1 h-1 ${
                  ["input", "review", "processing", "results"].indexOf(step) > i
                    ? "bg-green-600"
                    : "bg-gray-300"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium text-red-900">{error}</p>
        </div>
      )}

      {/* Step 1: Input */}
      {step === "input" && (
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Add Predictions</h2>

          {/* Add Item Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Asset ID <span className="text-red-600">*</span>
              </label>
              <Input
                placeholder="e.g., ASSET-001"
                value={currentItem.asset_id || ""}
                onChange={(e) =>
                  setCurrentItem({ ...currentItem, asset_id: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Asset Type <span className="text-red-600">*</span>
              </label>
              <select
                value={currentItem.asset_type}
                onChange={(e) => handleAssetTypeChange(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.keys(ASSET_TYPE_FEATURE_COUNTS).map((type) => (
                  <option key={type} value={type}>
                    {type} (
                    {
                      ASSET_TYPE_FEATURE_COUNTS[
                        type as keyof typeof ASSET_TYPE_FEATURE_COUNTS
                      ]
                    }{" "}
                    features)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Features Grid */}
          {featureCount > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-3">
                Sensor Features ({featureCount} required)
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-8 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-lg">
                {Array(featureCount)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="flex flex-col gap-1">
                      <label className="text-xs font-medium text-slate-700">
                        F{i + 1}
                      </label>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0"
                        value={currentItem.features?.[i] || ""}
                        onChange={(e) => handleFeatureChange(i, e.target.value)}
                        className="text-sm h-8"
                      />
                    </div>
                  ))}
              </div>
            </div>
          )}

          <Button
            onClick={handleAddItem}
            className="gap-2"
            disabled={!currentItem.asset_id?.trim()}
          >
            <Plus className="w-4 h-4" />
            Add to Batch
          </Button>

          {/* Batch Items List */}
          {batchItems.length > 0 && (
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">
                Items in Batch ({batchItems.length})
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {batchItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {item.asset_id}
                      </p>
                      <p className="text-sm text-slate-600">
                        {item.asset_type} ({item.features.length} features)
                      </p>
                    </div>
                    <Button
                      onClick={() => handleRemoveItem(item.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setStep("review")}
              disabled={batchItems.length === 0}
            >
              Review Batch
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Review */}
      {step === "review" && (
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Review Batch</h2>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Asset ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Type
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Features
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {batchItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">{item.asset_id}</td>
                    <td className="py-3 px-4">
                      <Badge>{item.asset_type}</Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.features.length}
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => handleRemoveItem(item.id)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                      >
                        Remove
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-slate-900">
              <strong>Total items:</strong> {batchItems.length}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button onClick={() => setStep("input")} variant="outline">
              Back
            </Button>
            <Button onClick={handleStartProcessing} disabled={loading}>
              {loading && <Loader className="w-4 h-4 animate-spin mr-2" />}
              Start Processing
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Processing */}
      {step === "processing" && (
        <Card className="p-6 space-y-6 text-center">
          <h2 className="text-xl font-semibold">Processing Batch</h2>

          <div className="py-8">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-lg text-slate-900 font-medium">
              Processing {processed} of {batchItems.length} predictions...
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 mt-6 max-w-md mx-auto">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${batchItems.length > 0 ? (processed / batchItems.length) * 100 : 0}%`,
                }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Results */}
      {step === "results" && (
        <Card className="p-6 space-y-6">
          <h2 className="text-xl font-semibold">Batch Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-slate-600">Successful</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {successCount}
              </p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-slate-600">Failed</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {errorCount}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {results.length}
              </p>
            </div>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Asset ID
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Health
                  </th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 px-4">{result.asset_id}</td>
                    <td className="py-3 px-4">
                      {result.error ? (
                        <Badge className="bg-red-100 text-red-800">Error</Badge>
                      ) : (
                        <Badge
                          className={
                            result.status.toLowerCase() === "healthy"
                              ? "bg-green-100 text-green-800"
                              : result.status.toLowerCase() === "warning"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {result.status}
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {result.error ? (
                        <span className="text-red-600">N/A</span>
                      ) : (
                        result.health_score_or_class
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {result.error ? (
                        <span className="text-red-600 text-xs">
                          {result.error.substring(0, 20)}...
                        </span>
                      ) : (
                        `${Math.round(result.confidence * 100)}%`
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => {
                setStep("input");
                setBatchItems([]);
                setResults([]);
              }}
              variant="outline"
            >
              Start New Batch
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
