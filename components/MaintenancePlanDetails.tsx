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
import { ArrowLeft, Plus, Play, CheckCircle2, AlertCircle, Search } from "lucide-react";
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
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [isCreateDetailOpen, setIsCreateDetailOpen] = useState(false);
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);

  const [newDetail, setNewDetail] = useState({
    taskName: "",
    description: "",
    estimatedHours: 1,
    assetId: "",
    assetSearch: "",
    monthsOfMaintenance: Array(12).fill(false),
  });

  const [newStatus, setNewStatus] = useState({
    actionType: "PENDING_VERIFICATION",
    comments: "",
  });

  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const detailsData = await maintenancePlanningApi.searchPlanDetails({ 
        annualPlanId: planType === 'annual' ? planId : undefined,
      });
      const statusData = await maintenancePlanningApi.searchPlanStatuses({ planId });
      const toArray = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        if (res && Array.isArray(res.content)) return res.content;
        if (res && Array.isArray(res.items)) return res.items;
        return [];
      };

      setDetails(toArray(detailsData));
      setStatuses(toArray(statusData));
    } catch (err: any) {
      setError(err.message || "Failed to fetch plan data");
    } finally {
      setLoading(false);
    }
  }, [planId]);

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
    if (!newDetail.taskName || !newDetail.assetId) {
      setError("Task name and asset are required.");
      return;
    }

    setIsProcessing(true);
    setError("");
    try {
      const monthsStr = newDetail.monthsOfMaintenance.map(m => m ? '1' : '0').join('');
      
      await maintenancePlanningApi.createPlanDetails({
        annualPlanId: planType === 'annual' ? planId : undefined,
        monthlyPlanId: planType === 'monthly' ? planId : undefined,
        planType: planType.toUpperCase(),
        taskName: newDetail.taskName,
        description: newDetail.description,
        estimatedDuration: newDetail.estimatedHours,
        assetId: newDetail.assetId,
        machineId: newDetail.assetId,
        plannerId: user?.id ?? null,
        monthsOfMaintenance: planType === 'annual' ? monthsStr : undefined,
      });
      setSuccess("Plan detail added successfully");
      setIsCreateDetailOpen(false);
      setNewDetail({ taskName: "", description: "", estimatedHours: 1, assetId: "", assetSearch: "", monthsOfMaintenance: Array(12).fill(false) });
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
        comments: newStatus.comments,
      });
      setSuccess("Status updated successfully");
      setIsChangeStatusOpen(false);
      setNewStatus({ actionType: "PENDING_VERIFICATION", comments: "" });
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
        monthlyPlanId: planType === "monthly" ? planId : undefined,
        planDetailId: detailId,
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

  const selectedAsset = assets.find((a) => a.id === newDetail.assetId);

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
          <Button onClick={() => setIsCreateDetailOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Detail
          </Button>
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
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Plan Execution Details</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task Name</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Est. Hours</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {details
                  .filter((detail: any) => !detail.workOrderId && !detail.workOrderCreated && detail.status !== 'WORK_ORDER_CREATED' && detail.status !== 'GENERATED' && detail.status !== 'COMPLETED')
                  .map((detail: any) => (
                  <TableRow key={detail.id}>
                    <TableCell className="font-medium">{detail.description || detail.taskName || "—"}</TableCell>
                    <TableCell>
                      <span className="text-sm text-slate-700">
                        {assets.find((a) => a.id === detail.machineId)?.name || detail.machineId}
                      </span>
                    </TableCell>
                    <TableCell>{detail.estimatedDuration || detail.estimatedHours || detail.estimatedHour || detail.estimatedTime || detail.duration || 0}h</TableCell>
                    <TableCell>
                      {planType === "monthly" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleGenerateWorkOrder(detail.id)}
                          disabled={isProcessing}
                        >
                          <Play className="w-3 h-3 mr-1" /> Generate WO
                        </Button>
                      ) : (
                        <span className="text-xs text-slate-500">Only from Monthly Plans</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {details.filter((detail: any) => !detail.workOrderId && !detail.workOrderCreated && detail.status !== 'WORK_ORDER_CREATED' && detail.status !== 'GENERATED' && detail.status !== 'COMPLETED').length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-6 text-slate-500">
                      No details found for this plan. Add one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
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
                  {s.comments && <p className="text-sm text-slate-600">{s.comments}</p>}
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
        if (!open) setNewDetail({ taskName: "", description: "", estimatedHours: 1, assetId: "", assetSearch: "", monthsOfMaintenance: Array(12).fill(false) });
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

            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label>Estimated Hours</Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={newDetail.estimatedHours}
                onChange={(e) => setNewDetail({ ...newDetail, estimatedHours: parseFloat(e.target.value) || 1 })}
              />
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
            <Button onClick={handleCreateDetail} disabled={isProcessing || !newDetail.taskName || !newDetail.assetId || (planType === 'annual' && !newDetail.monthsOfMaintenance.some(Boolean))}>
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
                  <SelectItem value="PENDING_VERIFICATION">Submit for Verification</SelectItem>
                  <SelectItem value="PENDING_APPROVAL">Submit for Approval</SelectItem>
                  <SelectItem value="APPROVED">Approve Plan</SelectItem>
                  <SelectItem value="REJECTED">Reject Plan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Comments / Notes</Label>
              <Textarea
                value={newStatus.comments}
                onChange={(e) => setNewStatus({ ...newStatus, comments: e.target.value })}
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
    </div>
  );
}
