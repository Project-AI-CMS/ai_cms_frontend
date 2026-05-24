"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  RefreshCw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { analyticsApi } from "@/lib/analytics";
import { DashboardResponse } from "@/types/analytics";

interface KPICard {
  title: string;
  value: number;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const SkeletonLoader = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
      ))}
    </div>
    <div className="h-80 bg-gray-200 rounded-lg animate-pulse" />
    <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
  </div>
);

export function AnalyticsDashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await analyticsApi.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError((err as Error).message || "Failed to load analytics dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-slate-900 font-medium mb-2">
          Failed to Load Dashboard
        </p>
        <p className="text-slate-600 text-sm mb-4">{error}</p>
        <Button onClick={fetchDashboard} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">No analytics data available</p>
      </div>
    );
  }

  const kpiCards: KPICard[] = [
    {
      title: "Total Predictions",
      value: dashboard.totalPredictions,
      change: "+12%",
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Healthy Assets",
      value: dashboard.healthyCount,
      change: "+8%",
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Warnings",
      value: dashboard.warningCount,
      change: "-3%",
      icon: AlertCircle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      title: "Critical Issues",
      value: dashboard.criticalCount,
      change: "-5%",
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
  ];

  const chartData = [
    { name: "Healthy", value: dashboard.healthyCount, fill: "#10b981" },
    { name: "Warning", value: dashboard.warningCount, fill: "#f59e0b" },
    { name: "Critical", value: dashboard.criticalCount, fill: "#ef4444" },
  ].filter((item) => item.value > 0);

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "healthy":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Predictive Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Asset health predictions and trends
          </p>
        </div>
        <Button
          onClick={fetchDashboard}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((card) => {
          const IconComponent = card.icon;
          return (
            <Card key={card.title} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-slate-900 mt-2">
                    {card.value}
                  </p>
                  <p className="text-xs text-green-600 mt-2">{card.change}</p>
                </div>
                <div className={`p-3 rounded-lg ${card.bgColor}`}>
                  <IconComponent className={`w-6 h-6 ${card.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Status Distribution Chart */}
      {chartData.length > 0 ? (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">
            Status Distribution
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      ) : (
        <Card className="p-6 text-center">
          <p className="text-slate-600">
            No prediction data available yet. Start by making predictions.
          </p>
        </Card>
      )}

      {/* Summary Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Overall Health</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Healthy Rate</span>
              <span className="font-semibold">
                {dashboard.totalPredictions > 0
                  ? (
                      (dashboard.healthyCount / dashboard.totalPredictions) *
                      100
                    ).toFixed(1)
                  : "0"}
                %
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-600 h-2 rounded-full"
                style={{
                  width: `${
                    dashboard.totalPredictions > 0
                      ? (dashboard.healthyCount / dashboard.totalPredictions) *
                        100
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Alerts</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Warning Count</span>
              <span className="font-semibold text-yellow-600">
                {dashboard.warningCount}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Critical Count</span>
              <span className="font-semibold text-red-600">
                {dashboard.criticalCount}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-semibold text-slate-900 mb-3">Last Updated</h3>
          <p className="text-sm text-slate-600">
            {dashboard.lastUpdated
              ? new Date(dashboard.lastUpdated).toLocaleString()
              : "Never"}
          </p>
          <Badge className={`mt-3 ${getStatusColor("healthy")}`}>
            Service: Online
          </Badge>
        </Card>
      </div>
    </div>
  );
}
