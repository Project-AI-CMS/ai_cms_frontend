"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PredictionHistory } from "@/components/PredictionHistory";
import { Card } from "@/components/ui/card";

export default function PredictionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.assetId as string;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          onClick={() => router.back()}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Prediction History
          </h1>
          <p className="text-slate-600 mt-1">Asset ID: {assetId}</p>
        </div>
      </div>

      <PredictionHistory assetId={assetId} />
    </div>
  );
}
