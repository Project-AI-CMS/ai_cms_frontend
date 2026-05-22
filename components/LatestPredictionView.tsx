"use client";

import { useEffect, useState } from "react";
import { Loader, AlertCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/analytics";
import { PredictionResultResponse } from "@/types/analytics";
import { assetApi } from "@/lib/api";
import Link from "next/link";

interface FormAsset {
  id: string;
  name: string;
  assetType?: { name: string };
}

export function LatestPredictionView() {
  const [assets, setAssets] = useState<FormAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [prediction, setPrediction] = useState<PredictionResultResponse | null>(
    null,
  );

  const [loadingAssets, setLoadingAssets] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAssets = async () => {
      setLoadingAssets(true);
      try {
        const response = await assetApi.getAll({ limit: 1000 });
        const assetList = Array.isArray(response)
          ? response
          : response.data || [];
        setAssets(assetList);
      } catch (err) {
        console.error("Failed to load assets:", err);
        setError("Failed to load assets");
      } finally {
        setLoadingAssets(false);
      }
    };

    fetchAssets();
  }, []);

  const handleAssetSelect = async (assetId: string) => {
    setSelectedAssetId(assetId);
    setPrediction(null);
    setError(null);
    setLoading(true);

    try {
      const result = await analyticsApi.getLatestPrediction(assetId);
      setPrediction(result);
    } catch (err) {
      setError((err as Error).message || "Failed to load latest prediction");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "healthy") return "bg-green-100 text-green-800";
    if (statusLower === "warning") return "bg-yellow-100 text-yellow-800";
    if (statusLower === "critical") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Latest Prediction</h1>
        <p className="text-slate-600 mt-1">
          View the most recent prediction for any asset
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Select Asset <span className="text-red-600">*</span>
            </label>
            {loadingAssets ? (
              <div className="text-center py-4 text-slate-600">
                Loading assets...
              </div>
            ) : (
              <select
                value={selectedAssetId}
                onChange={(e) => handleAssetSelect(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Select an asset --</option>
                {assets.map((asset) => (
                  <option key={asset.id} value={asset.id}>
                    {asset.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {error && selectedAssetId && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <Loader className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
              <p className="text-slate-600">Loading prediction...</p>
            </div>
          )}

          {prediction && selectedAssetId && !loading && (
            <div className="space-y-4">
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 space-y-4">
                {/* Status and Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Current Status
                    </p>
                    <div className="mt-3">
                      <Badge
                        className={`${getStatusColor(prediction.status)} text-base px-3 py-1`}
                      >
                        {prediction.status}
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
                      Asset Type
                    </p>
                    <p className="text-lg font-semibold text-slate-900 mt-2">
                      {prediction.asset_type}
                    </p>
                  </div>
                </div>

                {/* Prediction Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white p-4 rounded-lg border">
                  <div>
                    <p className="text-xs font-medium text-slate-600">
                      Health Score
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {prediction.health_score_or_class}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600">
                      Confidence
                    </p>
                    <p className="text-2xl font-bold text-slate-900 mt-1">
                      {Math.min(100, Math.round(prediction.confidence * 100))}%
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-slate-600">
                      Predicted
                    </p>
                    <p className="text-sm text-slate-900 mt-1">
                      {new Date(prediction.predicted_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Prediction ID */}
                <div className="bg-slate-50 p-3 rounded-lg border">
                  <p className="text-xs font-medium text-slate-600">
                    Prediction ID
                  </p>
                  <p className="text-xs font-mono text-slate-900 mt-1 break-all">
                    {prediction.prediction_id}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Link href={`/analytics/predictions/${selectedAssetId}`}>
                    <Button className="gap-2">View Full History</Button>
                  </Link>
                </div>

                {/* Status Message */}
                {prediction.status.toLowerCase() === "critical" && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-800">
                    <strong>⚠️ Critical Alert:</strong> Immediate maintenance
                    attention required.
                  </div>
                )}

                {prediction.status.toLowerCase() === "warning" && (
                  <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
                    <strong>📋 Warning:</strong> Schedule maintenance soon to
                    prevent issues.
                  </div>
                )}

                {prediction.status.toLowerCase() === "healthy" && (
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-sm text-green-800">
                    <strong>✓ Healthy:</strong> Asset is operating normally.
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedAssetId && !loading && !prediction && !error && (
            <div className="text-center py-8 text-slate-600">
              No predictions found for this asset
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
