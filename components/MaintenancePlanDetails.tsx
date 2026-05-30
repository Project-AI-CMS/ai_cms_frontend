"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { ArrowLeft, Plus, Play, CheckCircle2, AlertCircle, Search, CalendarDays, User, Wrench, Clock, RefreshCw } from "lucide-react";
import { maintenancePlanningApi, workOrderApi, assetApi } from "@/lib/api";
import { UserInfo } from "@/types";

type MaintenancePlanDetailsProps = {
  planId: string;
  planType: "annual" | "monthly";
  user?: UserInfo;
  onBack: () => void;
};

export function MaintenancePlanDetails({ planId, planType, user, onBack }: MaintenancePlanDetailsProps) {
  const [details, setDetails] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<any[]>([]);
  const [planChanges, setPlanChanges] = useState<any[]>([]);
  const [monthlyPlan, setMonthlyPlan] = useState<any | null>(null);
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isCreateDetailOpen, setIsCreateDetailOpen] = useState(false);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [isScheduleChangeOpen, setIsScheduleChangeOpen] = useState(false);
  const [isPlanChangeLookupOpen, setIsPlanChangeLookupOpen] = useState(false);
  const [selectedPlanChange, setSelectedPlanChange] = useState<any | null>(null);
  const [planChangeLookupId, setPlanChangeLookupId] = useState("");
  const [planChangeSearch, setPlanChangeSearch] = useState("");

  const [newDetail, setNewDetail] = useState({
    taskName: "",
    description: "",
    assetId: "",
    assetSearch: "",
    monthsOfMaintenance: Array(12).fill(false),
  });

  const [newStatus, setNewStatus] = useState({
    actionType: "PENDING_VERIFICATION",
    remark: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [scheduleChange, setScheduleChange] = useState({
    newNextMntPlanFrom: "",
    newNextMntPlanTo: "",
    reasonJustification: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const monthlyData = planType === "monthly" ? await maintenancePlanningApi.getMonthlyPlanById(planId) : null;
      const detailsData = await maintenancePlanningApi.searchPlanDetails(
        planType === "annual"
          ? { annualPlanId: planId }
          : { id: monthlyData?.planDetailsId },
      );
      const statusData = await maintenancePlanningApi.searchPlanStatuses({ planId });
      const changesData = planType === "monthly" ? await maintenancePlanningApi.getPlanChangesByMonthlyPlan(planId) : [];
      const toArray = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        if (res && Array.isArray(res.content)) return res.content;
        if (res && Array.isArray(res.items)) return res.items;
        return [];
      };

      setDetails(toArray(detailsData));
      setStatuses(toArray(statusData));
      setPlanChanges(toArray(changesData));
      setMonthlyPlan(monthlyData);
    } catch (err: any) {
      setError(err.message || "Failed to fetch plan data");
    } finally {
      setLoading(false);
    }
  }, [planId, planType]);

  useEffect(() => {
    fetchData();

    // Load assets for the dropdown
    const loadAssets = async () => {
      try {
        const res = await assetApi.getAll();
        const list = Array.isArray(res) ? res : res?.data || res?.content || [];
        setAssets(list);
      } catch (err) {
        console.error("Failed to load assets", err);
      }
    };
    loadAssets();
  }, [fetchData]);

  const handleCreateDetail = async () => {
    if (!newDetail.assetId || !user?.id) {
      setError("Asset and logged-in planner ID are required.");
      return;
    }
    if (planType !== "annual") {
      setError("Plan details can only be added to annual plans. Monthly plans are created from existing plan details.");
      return;
    }

    setIsProcessing(true);
    setError("");
    try {
      const monthsStr = newDetail.monthsOfMaintenance
        .map((selected) => selected ? "1" : "0")
        .join("");
      
      await maintenancePlanningApi.createPlanDetails({
        annualPlanId: planType === 'annual' ? planId : undefined,
        description: newDetail.description,
        machineId: newDetail.assetId,
        plannerId: user.id,
        monthsOfMaintenance: monthsStr,
      });
      setSuccess("Plan detail added successfully");
      setIsCreateDetailOpen(false);
      setNewDetail({ taskName: "", description: "", assetId: "", assetSearch: "", monthsOfMaintenance: Array(12).fill(false) });
      fetchData();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to add detail");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleChangeStatus = async () => {
    setIsProcessing(true);
    try {
      await maintenancePlanningApi.changePlanStatus({
        planId,
        planType: planType.toUpperCase(),
        actionType: newStatus.actionType,
        performedBy: user?.id || "",
        remark: newStatus.remark,
      });
      setSuccess("Status updated successfully");
      setIsChangeStatusOpen(false);
      setNewStatus({ actionType: "PENDING_VERIFICATION", remark: "" });
      fetchData();
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to update status");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateWorkOrder = async (detailId: string) => {
    setIsProcessing(true);
    try {
      await workOrderApi.createFromPlan({
        monthlyPlanId: planId,
        assignments: [{ userId: user?.id as string, assignmentRole: "LEAD" }],
      });
      setSuccess("Work Order generated from plan!");
      setDetails((prev: any[]) => prev.filter((d) => d.id !== detailId));
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to generate work order");
    } finally {
      setIsProcessing(false);
    }
  };

  // Filtered assets for search
  const filteredAssets = assets.filter((a) =>
    a.name?.toLowerCase().includes(newDetail.assetSearch.toLowerCase()) ||
    a.serialNumber?.toLowerCase().includes(newDetail.assetSearch.toLowerCase())
  );

  const formatMaintenanceMonths = (months?: string) => {
    if (!months) return "—";
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const selected = months.length === 12 && /^[01]+$/.test(months)
      ? months.split("").map((value, index) => value === "1" ? labels[index] : null).filter(Boolean)
      : months.split(",").map((month) => labels[Number(month.trim()) - 1] || month.trim()).filter(Boolean);

    return selected.length ? selected.join(", ") : "—";
  };

  const handleRequestScheduleChange = async () => {
    if (!user?.id || !scheduleChange.newNextMntPlanFrom || !scheduleChange.newNextMntPlanTo || !scheduleChange.reasonJustification.trim()) {
      setError("New dates, reason, and logged-in user are required.");
      return;
    }
    setIsProcessing(true);
    try {
      await maintenancePlanningApi.requestMonthlyPlanScheduleChange({
        monthlyPlanId: planId,
        newNextMntPlanFrom: scheduleChange.newNextMntPlanFrom,
        newNextMntPlanTo: scheduleChange.newNextMntPlanTo,
        reasonJustification: scheduleChange.reasonJustification.trim(),
        changeRequestedBy: user.id,
      });
      setSuccess("Schedule change requested");
      setIsScheduleChangeOpen(false);
      setScheduleChange({ newNextMntPlanFrom: "", newNextMntPlanTo: "", reasonJustification: "" });
      await fetchData();
    } catch (err: any) {
      setError(err.message || "Failed to request schedule change");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadPlanChangeById = async () => {
    const id = planChangeLookupId.trim();
    if (!id) return;
    setIsProcessing(true);
    try {
      const change = await maintenancePlanningApi.getPlanChangeById(id);
      setSelectedPlanChange(change);
      setIsPlanChangeLookupOpen(false);
      setPlanChangeLookupId("");
    } catch (err: any) {
      setError(err.message || "Failed to fetch plan change");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadMyPlanChanges = async () => {
    if (!user?.id) {
      setError("Logged-in user ID is required.");
      return;
    }
    try {
      const changes = await maintenancePlanningApi.getPlanChangesByRequestedBy(user.id);
      setPlanChanges(Array.isArray(changes) ? changes : []);
      setSuccess("Loaded your plan change requests");
      setTimeout(() => setSuccess(""), 4000);
    } catch (err: any) {
      setError(err.message || "Failed to fetch your plan changes");
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return "—";
    const parsed = new Date(date);
    return isNaN(parsed.getTime()) ? "—" : parsed.toLocaleDateString();
  };

  const openDetails = details.filter(
    (detail: any) => !detail.workOrderId && !detail.workOrderCreated && detail.status !== 'WORK_ORDER_CREATED' && detail.status !== 'GENERATED' && detail.status !== 'COMPLETED',
  );

  const primaryDetail = details[0];
  const primaryAsset = primaryDetail ? assets.find((a) => a.id === primaryDetail.machineId) : null;

  const selectedAsset = assets.find((a) => a.id === newDetail.assetId);
  const filteredPlanChanges = planChanges.filter((change: any) => {
    const query = planChangeSearch.trim().toLowerCase();
    if (!query) return true;
    return [
      change.id,
      change.reasonJustification,
      change.status,
      change.newNextMntPlanFrom,
      change.newNextMntPlanTo,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-bold text-slate-900">
            {planType === "annual" ? "Annual" : "Monthly"} Plan Details
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsChangeStatusOpen(true)}>
            Update Status
          </Button>
          {planType === "annual" && (
            <Button onClick={() => setIsCreateDetailOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Detail
            </Button>
          )}
          {planType === "monthly" && (
            <Button variant="outline" onClick={() => setIsScheduleChangeOpen(true)}>
              Request Schedule Change
            </Button>
          )}
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 border-green-200 text-green-900">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {planType === "annual" ? (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Annual Schedule Details</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Task Name</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Scheduled Months</TableHead>
                    <TableHead>Next Step</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {openDetails.map((detail: any) => (
                    <TableRow key={detail.id}>
                      <TableCell className="font-medium">{detail.description || detail.taskName || "—"}</TableCell>
                      <TableCell>
                        <span className="text-sm text-slate-700">
                          {assets.find((a) => a.id === detail.machineId)?.name || detail.machineId}
                        </span>
                      </TableCell>
                      <TableCell>{formatMaintenanceMonths(detail.monthsOfMaintenance)}</TableCell>
                      <TableCell>
                        <span className="text-xs text-slate-500">Create monthly plan first</span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {openDetails.length === 0 && !loading && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                        No details found for this plan. Add one to get started.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Card>
          ) : (
            <div className="space-y-5">
              <Card className="overflow-hidden border-blue-100">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-5 text-white">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-blue-100">Monthly execution</p>
                      <h3 className="text-2xl font-semibold mt-1">
                        {primaryDetail?.description || "Maintenance execution plan"}
                      </h3>
                    </div>
                    <Badge className="bg-white/15 text-white border border-white/20">
                      {monthlyPlan?.status || "UNKNOWN"}
                    </Badge>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-xl border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <CalendarDays className="w-4 h-4" /> Execution Window
                      </div>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatDate(monthlyPlan?.nextMntPlanFrom)} - {formatDate(monthlyPlan?.nextMntPlanTo)}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <User className="w-4 h-4" /> Foreman
                      </div>
                      <p className="text-lg font-semibold text-slate-900">{monthlyPlan?.formanId || "—"}</p>
                    </div>
                    <div className="rounded-xl border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Wrench className="w-4 h-4" /> Asset
                      </div>
                      <p className="text-lg font-semibold text-slate-900">
                        {primaryAsset?.name || primaryDetail?.machineId || "—"}
                      </p>
                    </div>
                    <div className="rounded-xl border bg-slate-50 p-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                        <Clock className="w-4 h-4" /> Annual Schedule
                      </div>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatMaintenanceMonths(primaryDetail?.monthsOfMaintenance)}
                      </p>
                    </div>
                  </div>

                  {(monthlyPlan?.machineCondition || monthlyPlan?.remark) && (
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <p className="text-sm font-medium text-slate-900 mb-2">Execution Notes</p>
                      {monthlyPlan?.machineCondition && <p className="text-sm text-slate-600">Condition: {monthlyPlan.machineCondition}</p>}
                      {monthlyPlan?.remark && <p className="text-sm text-slate-600 mt-1">Remark: {monthlyPlan.remark}</p>}
                    </div>
                  )}

                  <div className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50 p-4">
                    <div>
                      <p className="font-medium text-blue-950">Ready for work order execution</p>
                      <p className="text-sm text-blue-700">Generate the preventive work order from this monthly plan.</p>
                    </div>
                    <Button
                      onClick={() => handleGenerateWorkOrder(primaryDetail?.id || planId)}
                      disabled={isProcessing || monthlyPlan?.workOrderCreated || !primaryDetail}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {monthlyPlan?.workOrderCreated ? "WO Created" : "Generate WO"}
                    </Button>
                  </div>
                </div>
              </Card>

              <Card className="p-5">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Schedule Change Requests</h3>
                    <p className="text-sm text-slate-500">Review, lookup, and track reschedule requests.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setIsPlanChangeLookupOpen(true)}>Find by ID</Button>
                    <Button variant="outline" size="sm" onClick={handleLoadMyPlanChanges}>Mine</Button>
                  </div>
                </div>
                  {selectedPlanChange && (
                    <div className="mb-4 rounded-xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-blue-950">Lookup Result</p>
                        <Badge variant="outline" className="bg-white">{selectedPlanChange.status}</Badge>
                      </div>
                      <p className="text-sm text-blue-800 mt-1">{selectedPlanChange.reasonJustification || selectedPlanChange.id}</p>
                      <p className="text-xs text-blue-700 mt-2">
                        Proposed: {formatDate(selectedPlanChange.newNextMntPlanFrom)} - {formatDate(selectedPlanChange.newNextMntPlanTo)}
                      </p>
                    </div>
                  )}
                {planChanges.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {planChanges.map((change: any) => (
                      <div key={change.id} className="rounded-xl border bg-white p-4 shadow-sm">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-slate-900">{change.reasonJustification || "Schedule change"}</p>
                          <Badge variant="outline">{change.status}</Badge>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">
                          {formatDate(change.newNextMntPlanFrom)} - {formatDate(change.newNextMntPlanTo)}
                        </p>
                        {change.changeRequestedAt && (
                          <p className="text-xs text-slate-400 mt-1">Requested {formatDate(change.changeRequestedAt)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed bg-slate-50 p-6 text-center">
                    <RefreshCw className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-medium text-slate-700">No schedule changes yet</p>
                    <p className="text-sm text-slate-500">Use Request Schedule Change when this monthly window needs to move.</p>
                  </div>
                )}
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Status History</h3>
            <div className="space-y-4">
              {statuses.map((s: any) => (
                <div key={s.id} className="border-l-2 border-blue-500 pl-4 py-1">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{s.actionType || s.status || "UNKNOWN"}</Badge>
                    <span className="text-xs text-slate-500">
                      {s.performedAt || s.createdAt 
                        ? new Date(s.performedAt || s.createdAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>
                  {(s.remark || s.comments) && <p className="text-sm text-slate-600">{s.remark || s.comments}</p>}
                </div>
              ))}
              {statuses.length === 0 && !loading && (
                <p className="text-slate-500 text-sm">No status history available.</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Add Detail Dialog */}
        <Dialog open={isCreateDetailOpen} onOpenChange={(open) => {
        setIsCreateDetailOpen(open);
        if (!open) setNewDetail({ taskName: "", description: "", assetId: "", assetSearch: "", monthsOfMaintenance: Array(12).fill(false) });
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Plan Detail</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">

            {/* Task Name */}
            <div className="space-y-2">
              <Label>Task Name <span className="text-red-500">*</span></Label>
              <Input
                placeholder="e.g. Monthly engine inspection"
                value={newDetail.taskName}
                onChange={(e) => setNewDetail({ ...newDetail, taskName: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Detailed task description..."
                value={newDetail.description}
                onChange={(e) => setNewDetail({ ...newDetail, description: e.target.value })}
                rows={3}
              />
            </div>

            {/* Asset Picker */}
            <div className="space-y-2">
              <Label>Asset <span className="text-red-500">*</span></Label>
              {selectedAsset ? (
                <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div>
                    <p className="text-sm font-semibold text-blue-900">{selectedAsset.name}</p>
                    <p className="text-xs text-blue-600">{selectedAsset.serialNumber}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-red-600"
                    onClick={() => setNewDetail({ ...newDetail, assetId: "", assetSearch: "" })}
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search asset by name or serial number..."
                      value={newDetail.assetSearch}
                      onChange={(e) => setNewDetail({ ...newDetail, assetSearch: e.target.value })}
                      className="pl-9"
                    />
                  </div>
                  {newDetail.assetSearch && (
                    <div className="max-h-44 overflow-y-auto border rounded-lg bg-slate-50 p-1 space-y-1">
                      {filteredAssets.length === 0 ? (
                        <p className="text-center py-4 text-slate-400 text-sm">No assets found.</p>
                      ) : (
                        filteredAssets.slice(0, 20).map((a) => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => setNewDetail({ ...newDetail, assetId: a.id, assetSearch: a.name })}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-md text-sm hover:bg-white text-slate-700 transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium">{a.name}</p>
                              <p className="text-xs text-slate-400">{a.serialNumber}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">{a.currentStatus || "—"}</Badge>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Months of Maintenance (Annual only) */}
            {planType === "annual" && (
              <div className="space-y-2">
                <Label>Scheduled Months <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-4 gap-2">
                  {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((month, idx) => {
                    const isSelected = newDetail.monthsOfMaintenance[idx];
                    return (
                      <button
                        key={month}
                        type="button"
                        onClick={() => {
                          const newMonths = [...newDetail.monthsOfMaintenance];
                          newMonths[idx] = !newMonths[idx];
                          setNewDetail({ ...newDetail, monthsOfMaintenance: newMonths });
                        }}
                        className={`py-1.5 px-2 text-xs font-medium rounded-md border transition-colors ${
                          isSelected 
                            ? "bg-blue-600 text-white border-blue-600" 
                            : "bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {month}
                      </button>
                    );
                  })}
                </div>
                {!newDetail.monthsOfMaintenance.some(Boolean) && (
                  <p className="text-xs text-red-500 mt-1">Select at least one month</p>
                )}
              </div>
            )}

            {/* Planner (read-only, auto-filled) */}
            {user && (
              <div className="p-3 bg-slate-50 border rounded-lg text-sm text-slate-600 flex items-center gap-2">
                <span className="font-medium text-slate-700">Planner:</span>
                <span>{user.name}</span>
                <Badge variant="outline" className="text-xs ml-auto">{user.role}</Badge>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDetailOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateDetail} disabled={isProcessing || !newDetail.assetId || (planType === 'annual' && !newDetail.monthsOfMaintenance.some(Boolean))}>
              {isProcessing ? "Saving..." : "Save Detail"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Status Dialog */}
      <Dialog open={isChangeStatusOpen} onOpenChange={setIsChangeStatusOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Update Plan Status</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus.actionType} onValueChange={(val) => setNewStatus({ ...newStatus, actionType: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING_VERIFICATION">Send for Verification</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Send for Approval</SelectItem>
                  <SelectItem value="APPROVED">Approve Plan</SelectItem>
                  <SelectItem value="REJECTED">Reject Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Remark</Label>
              <Textarea
                value={newStatus.remark}
                onChange={(e) => setNewStatus({ ...newStatus, remark: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangeStatusOpen(false)}>Cancel</Button>
            <Button onClick={handleChangeStatus} disabled={isProcessing}>
              {isProcessing ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isScheduleChangeOpen} onOpenChange={setIsScheduleChangeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Request Schedule Change</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>New Start Date</Label>
                <Input
                  type="date"
                  value={scheduleChange.newNextMntPlanFrom}
                  onChange={(e) => setScheduleChange({ ...scheduleChange, newNextMntPlanFrom: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>New End Date</Label>
                <Input
                  type="date"
                  value={scheduleChange.newNextMntPlanTo}
                  onChange={(e) => setScheduleChange({ ...scheduleChange, newNextMntPlanTo: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea
                value={scheduleChange.reasonJustification}
                onChange={(e) => setScheduleChange({ ...scheduleChange, reasonJustification: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsScheduleChangeOpen(false)}>Cancel</Button>
            <Button onClick={handleRequestScheduleChange} disabled={isProcessing || !scheduleChange.newNextMntPlanFrom || !scheduleChange.newNextMntPlanTo || !scheduleChange.reasonJustification.trim()}>
              {isProcessing ? "Requesting..." : "Request Change"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isPlanChangeLookupOpen} onOpenChange={setIsPlanChangeLookupOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Find Schedule Change</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="rounded-lg border bg-slate-50 p-3 text-sm text-slate-600">
              Search existing schedule change requests and select one to inspect. Use direct ID lookup only if the request is not listed here.
            </div>

            <div className="space-y-2">
              <Label>Search Requests</Label>
              <Input
                value={planChangeSearch}
                onChange={(e) => setPlanChangeSearch(e.target.value)}
                placeholder="Search by reason, status, or date"
              />
            </div>

            <div className="max-h-72 overflow-y-auto rounded-xl border bg-white p-2 space-y-2">
              {filteredPlanChanges.length > 0 ? (
                filteredPlanChanges.map((change: any) => (
                  <button
                    key={change.id}
                    type="button"
                    onClick={() => {
                      setSelectedPlanChange(change);
                      setIsPlanChangeLookupOpen(false);
                      setPlanChangeSearch("");
                    }}
                    className="w-full rounded-lg border border-slate-200 p-3 text-left hover:border-blue-300 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-medium text-slate-900">{change.reasonJustification || "Schedule change"}</p>
                      <Badge variant="outline">{change.status}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Proposed: {formatDate(change.newNextMntPlanFrom)} - {formatDate(change.newNextMntPlanTo)}
                    </p>
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">No matching schedule changes found.</div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Direct ID Lookup</Label>
              <Input
                value={planChangeLookupId}
                onChange={(e) => setPlanChangeLookupId(e.target.value)}
                placeholder="Optional: paste plan change UUID"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPlanChangeLookupOpen(false)}>Cancel</Button>
            <Button onClick={handleLoadPlanChangeById} disabled={isProcessing || !planChangeLookupId.trim()}>
              {isProcessing ? "Searching..." : "Find Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
