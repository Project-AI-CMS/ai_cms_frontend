"use client";

import { useEffect, useState } from "react";
import { Loader, AlertCircle, Download } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/analytics";
import { PredictionResultResponse } from "@/types/analytics";

interface PredictionHistoryProps {
  assetId: string;
}

interface ChartData {
  date: string;
  confidence: number;
  status: string;
  healthScore: string;
}

const SkeletonLoader = () => (
  <div className="space-y-6">
    <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />
    <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
  </div>
);

export function PredictionHistory({ assetId }: PredictionHistoryProps) {
  const [predictions, setPredictions] = useState<PredictionResultResponse[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await analyticsApi.getPredictionHistory(assetId, 100);
        setPredictions(data);

        // Prepare chart data
        const chart = data.reverse().map((p) => ({
          date: new Date(p.predicted_at).toLocaleDateString(),
          confidence: Math.min(100, parseFloat((p.confidence * 100).toFixed(1))),
          status: p.status,
          healthScore: p.health_score_or_class,
        }));

        setChartData(chart);
      } catch (err) {
        setError((err as Error).message || "Failed to load prediction history");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [assetId]);

  const handleExportCSV = () => {
    const headers = [
      "Prediction ID",
      "Asset ID",
      "Asset Type",
      "Status",
      "Health Score",
      "Confidence",
      "Predicted At",
    ];

    const rows = predictions.map((p) => [
      p.prediction_id,
      p.asset_id,
      p.asset_type,
      p.status,
      p.health_score_or_class,
      p.confidence,
      p.predicted_at,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `predictions-${assetId}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower === "healthy") return "bg-green-100 text-green-800";
    if (statusLower === "warning") return "bg-yellow-100 text-yellow-800";
    if (statusLower === "critical") return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-slate-900 font-medium mb-2">
          Failed to Load History
        </p>
        <p className="text-slate-600 text-sm mb-4">{error}</p>
      </div>
    );
  }

  if (predictions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">
          No prediction history available for this asset
        </p>
      </div>
    );
  }

  const latestPrediction = predictions[predictions.length - 1];
  const previousPrediction =
    predictions.length > 1 ? predictions[predictions.length - 2] : null;
  const trendUp =
    previousPrediction &&
    parseFloat(latestPrediction.health_score_or_class) >
      parseFloat(previousPrediction.health_score_or_class);

  return (
    <div className="space-y-6">
      {/* Latest Prediction Summary */}
      <Card className="p-6 border-2 border-blue-200 bg-blue-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Latest Status
            </p>
            <Badge
              className={`mt-2 ${getStatusColor(latestPrediction.status)}`}
            >
              {latestPrediction.status}
            </Badge>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Health Score
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {latestPrediction.health_score_or_class}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Confidence
            </p>
            <p className="text-2xl font-bold text-slate-900 mt-2">
              {Math.min(100, Math.round(latestPrediction.confidence * 100))}%
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Last Updated
            </p>
            <p className="text-sm text-slate-900 mt-2">
              {new Date(latestPrediction.predicted_at).toLocaleString()}
            </p>
          </div>
        </div>
      </Card>

      {/* Confidence Trend Chart */}
      {chartData.length > 1 && (
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-4">
            Confidence Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value) => `${value}%`} />
              <Legend />
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#3b82f6"
                dot={false}
                name="Confidence %"
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* History Table */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">Prediction History</h3>
          <Button
            onClick={handleExportCSV}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-slate-900">
                  Prediction ID
                </th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">
                  Predicted At
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
              {predictions.map((prediction) => (
                <tr
                  key={prediction.prediction_id}
                  className="border-b hover:bg-slate-50"
                >
                  <td className="py-3 px-4 font-mono text-xs text-slate-600">
                    {prediction.prediction_id.substring(0, 12)}...
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(prediction.predicted_at).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={getStatusColor(prediction.status)}>
                      {prediction.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {prediction.health_score_or_class}
                  </td>
                  <td className="py-3 px-4">
                    {Math.min(100, Math.round(prediction.confidence * 100))}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-slate-600 mt-4">
          Showing {predictions.length} predictions
        </p>
      </Card>
    </div>
  );
}
