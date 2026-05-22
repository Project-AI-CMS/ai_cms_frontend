"use client";

import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  Link as LinkIcon,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PredictionResponse } from "@/types/analytics";
import Link from "next/link";

interface PredictionResultsCardProps {
  prediction: PredictionResponse;
  onViewHistory?: () => void;
}

export function PredictionResultsCard({
  prediction,
  onViewHistory,
}: PredictionResultsCardProps) {
  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "healthy")
      return <CheckCircle2 className="w-8 h-8 text-green-600" />;
    if (statusLower === "warning")
      return <AlertCircle className="w-8 h-8 text-yellow-600" />;
    if (statusLower === "critical")
      return <XCircle className="w-8 h-8 text-red-600" />;
    return <AlertCircle className="w-8 h-8 text-gray-600" />;
  };

  const getStatusBadgeClass = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "healthy") return "bg-green-100 text-green-800";
    if (statusLower === "warning") return "bg-yellow-100 text-yellow-800";
    if (statusLower === "critical") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  const confidencePercent = Math.min(
    100,
    Math.round(prediction.confidence * 100),
  );

  return (
    <Card className="p-6 border-2 border-blue-200 bg-blue-50">
      <div className="space-y-4">
        {/* Header with status icon and title */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            {getStatusIcon(prediction.status)}
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Prediction Result
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Asset ID: {prediction.asset_id}
              </p>
            </div>
          </div>
          <Badge className={getStatusBadgeClass(prediction.status)}>
            {prediction.status}
          </Badge>
        </div>

        {/* Main prediction info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg border">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Health Status
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {prediction.health_score_or_class}
            </p>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Confidence Score
            </p>
            <div className="mt-2">
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold text-slate-900">
                  {confidencePercent}%
                </p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${confidencePercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border">
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Prediction ID
            </p>
            <p className="text-sm font-mono text-slate-900 mt-2 truncate">
              {prediction.prediction_id || "N/A"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {onViewHistory && (
            <button
              onClick={onViewHistory}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm font-medium"
            >
              <LinkIcon className="w-4 h-4" />
              View Full History
            </button>
          )}
        </div>

        {/* Status-specific recommendations */}
        {prediction.status.toLowerCase() === "critical" && (
          <div className="bg-red-100 border border-red-300 rounded-lg p-3 text-sm text-red-800">
            <strong>⚠️ Critical Alert:</strong> This asset requires immediate
            attention. Please review and take appropriate maintenance action.
          </div>
        )}

        {prediction.status.toLowerCase() === "warning" && (
          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 text-sm text-yellow-800">
            <strong>📋 Maintenance Recommended:</strong> Schedule maintenance
            within the next maintenance window to prevent critical issues.
          </div>
        )}

        {prediction.status.toLowerCase() === "healthy" && (
          <div className="bg-green-100 border border-green-300 rounded-lg p-3 text-sm text-green-800">
            <strong>✓ Healthy Status:</strong> Asset is operating normally.
            Continue regular monitoring.
          </div>
        )}
      </div>
    </Card>
  );
}
