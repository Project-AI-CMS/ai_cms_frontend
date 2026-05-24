"use client";

import Link from "next/link";
import { BarChart3, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AnalyticsDashboard } from "@/components/AnalyticsDashboard";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">
          Monitor asset health predictions and view historical trends
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 border-blue-200 bg-blue-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Latest Predictions</h3>
              <p className="text-sm text-slate-600 mt-1">
                View the most recent prediction for any asset
              </p>
            </div>
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
          </div>
          <Link href="/analytics/latest">
            <Button className="mt-4 w-full">View Latest</Button>
          </Link>
        </Card>

        <Card className="p-6 border-green-200 bg-green-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Make Prediction</h3>
              <p className="text-sm text-slate-600 mt-1">
                Predict health status for a single asset
              </p>
            </div>
            <Zap className="w-5 h-5 text-green-600 flex-shrink-0" />
          </div>
          <Link href="/analytics/predict">
            <Button className="mt-4 w-full">Predict Now</Button>
          </Link>
        </Card>

        <Card className="p-6 border-purple-200 bg-purple-50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">Batch Predictions</h3>
              <p className="text-sm text-slate-600 mt-1">
                Run predictions for multiple assets at once
              </p>
            </div>
            <BarChart3 className="w-5 h-5 text-purple-600 flex-shrink-0" />
          </div>
          <Link href="/analytics/batch-predict">
            <Button className="mt-4 w-full">Batch Predict</Button>
          </Link>
        </Card>
      </div>

      <AnalyticsDashboard />
    </div>
  );
}
