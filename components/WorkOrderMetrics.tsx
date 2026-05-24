"use client";
import { useState } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Activity, Clock, Zap, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { workOrderApi, assetApi } from "@/lib/api";
import { useEffect } from "react";

export function WorkOrderMetrics() {
  const [assetId, setAssetId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [assets, setAssets] = useState<any[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);

  useEffect(() => {
    setAssetsLoading(true);
    assetApi.getAll().then((res) => {
      // assetApi.getAll() may return a plain array OR { data: [...] }
      if (Array.isArray(res)) {
        setAssets(res);
      } else {
        setAssets(res?.data || []);
      }
    }).catch((err) => {
      console.error("Failed to load assets", err);
    }).finally(() => {
      setAssetsLoading(false);
    });
  }, []);

  // Convert a YYYY-MM-DD string to OffsetDateTime format expected by the backend
  // e.g. "2026-05-11" → "2026-05-11T00:00:00+03:00"
  const toOffsetDateTime = (dateStr: string, endOfDay = false): string => {
    const date = new Date(dateStr);
    if (endOfDay) {
      date.setHours(23, 59, 59, 999);
    } else {
      date.setHours(0, 0, 0, 0);
    }
    // Get local timezone offset in ±HH:MM format
    const offsetMinutes = -date.getTimezoneOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";
    const absOffset = Math.abs(offsetMinutes);
    const offsetHH = String(Math.floor(absOffset / 60)).padStart(2, "0");
    const offsetMM = String(absOffset % 60).padStart(2, "0");
    const offset = `${sign}${offsetHH}:${offsetMM}`;

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}T${hh}:${min}:${ss}${offset}`;
  };

  const handleFetchMetrics = async () => {
    if (!assetId || !fromDate || !toDate) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const from = toOffsetDateTime(fromDate, false);       // start of from day
      const to   = toOffsetDateTime(toDate,   true);        // end of to day
      const data = await workOrderApi.getMetrics(assetId, from, to);
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch metrics.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Work Order Metrics</h2>
          <p className="text-slate-600">Analyze Mean Time To Repair (MTTR) and Mean Time Between Failures (MTBF)</p>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="space-y-2">
            <Label>Asset</Label>
            <Select value={assetId} onValueChange={setAssetId} disabled={assetsLoading}>
              <SelectTrigger>
                <SelectValue placeholder={assetsLoading ? "Loading assets..." : assets.length === 0 ? "No assets found" : "Select an asset"} />
              </SelectTrigger>
              <SelectContent>
                {assets.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name} ({a.id.substring(0, 8)}...)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>From Date</Label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>To Date</Label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
          <Button onClick={handleFetchMetrics} disabled={loading || assetsLoading || !assetId || !fromDate || !toDate} className="w-full">
            {loading ? "Loading..." : "Generate Report"}
          </Button>
        </div>
        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </Card>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 flex items-center gap-4 border-l-4 border-blue-500">
            <div className="bg-blue-100 p-3 rounded-full">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Mean Time To Repair (MTTR)</p>
              <h3 className="text-3xl font-bold text-slate-900">{metrics.mttr ? metrics.mttr.toFixed(2) : '0'} hrs</h3>
            </div>
          </Card>
          
          <Card className="p-6 flex items-center gap-4 border-l-4 border-green-500">
            <div className="bg-green-100 p-3 rounded-full">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Mean Time Between Failures (MTBF)</p>
              <h3 className="text-3xl font-bold text-slate-900">{metrics.mtbf ? metrics.mtbf.toFixed(2) : '0'} hrs</h3>
            </div>
          </Card>

          <Card className="p-6 flex items-center gap-4 border-l-4 border-purple-500">
            <div className="bg-purple-100 p-3 rounded-full">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Breakdowns</p>
              <h3 className="text-3xl font-bold text-slate-900">{metrics.totalBreakdowns ?? '0'}</h3>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

