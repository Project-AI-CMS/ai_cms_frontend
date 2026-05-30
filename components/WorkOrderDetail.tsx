"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  ArrowLeft,
  Edit,
  Clock,
  User,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Activity,
  Zap,
  Send,
  Pause,
  Play,
  XCircle,
  ThumbsUp,
  ThumbsDown,
  ClipboardList,
  RefreshCw,
  Plus,
  Users,
  Wrench,
  Package,
  Trash2,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { UserInfo, WorkOrderDetails, SparePart, WorkOrderTask, WorkOrderAssignment, Vendor } from "@/types";
import { workOrderApi, sparePartApi, userApi, vendorApi } from "@/lib/api";

type UserRow = { id: string; name: string; email: string; role?: string; isActive?: boolean };

type WorkOrderDetailProps = {
  workOrderId: string;
  user: UserInfo;
  onBack: () => void;
  onEdit?: (workOrderId: string) => void;
};

const statusConfig: Record<string, { color: string; bgColor: string; borderColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT:           { color: "text-gray-700",   bgColor: "bg-gray-100",   borderColor: "border-gray-300",   icon: Clock },
  ASSIGNED:        { color: "text-purple-700", bgColor: "bg-purple-100", borderColor: "border-purple-300", icon: User },
  IN_PROGRESS:     { color: "text-orange-700", bgColor: "bg-orange-100", borderColor: "border-orange-300", icon: Activity },
  ON_HOLD:         { color: "text-yellow-700", bgColor: "bg-yellow-100", borderColor: "border-yellow-300", icon: Pause },
  PENDING_QC:      { color: "text-indigo-700", bgColor: "bg-indigo-100", borderColor: "border-indigo-300", icon: ClipboardList },
  CLOSED:          { color: "text-green-700",  bgColor: "bg-green-100",  borderColor: "border-green-300",  icon: CheckCircle2 },
  CLOSED_WITH_FOLLOW_UP: { color: "text-blue-700", bgColor: "bg-blue-100", borderColor: "border-blue-300", icon: CheckCircle2 },
  OUTSOURCED_IN_PROGRESS: { color: "text-cyan-700", bgColor: "bg-cyan-100", borderColor: "border-cyan-300", icon: Send },
  CANCELLED:       { color: "text-red-700",    bgColor: "bg-red-100",    borderColor: "border-red-300",    icon: XCircle },
  REWORK_REQUIRED: { color: "text-orange-700", bgColor: "bg-orange-100", borderColor: "border-orange-300", icon: RefreshCw },
};

const DEFAULT_STATUS_CFG = { color: "text-slate-700", bgColor: "bg-slate-100", borderColor: "border-slate-300", icon: Clock };

const priorityConfig: Record<string, { color: string; bgColor: string }> = {
  LOW:      { color: "text-green-700",  bgColor: "bg-green-50" },
  MEDIUM:   { color: "text-blue-700",   bgColor: "bg-blue-50" },
  HIGH:     { color: "text-orange-700", bgColor: "bg-orange-50" },
  CRITICAL: { color: "text-red-700",    bgColor: "bg-red-50" },
};

export function WorkOrderDetail({ workOrderId, user, onBack, onEdit }: WorkOrderDetailProps) {
  const [workOrderDetails, setWorkOrderDetails] = useState<WorkOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  // Hold dialog
  const [isHoldDialogOpen, setIsHoldDialogOpen] = useState(false);
  const [holdReason, setHoldReason] = useState("");
  const [isHolding, setIsHolding] = useState(false);

  // Resume
  const [isResuming, setIsResuming] = useState(false);

  // Cancel dialog
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

  // Complete dialog
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [completeNotes, setCompleteNotes] = useState("");
  const [faultFound, setFaultFound] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  // QC Review dialog
  const [isQCDialogOpen, setIsQCDialogOpen] = useState(false);
  const [qcComment, setQCComment] = useState("");
  const [isSubmittingQC, setIsSubmittingQC] = useState(false);

  // Update Status dialog
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // New Dialogs State
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<WorkOrderTask | null>(null);
  const [editTaskName, setEditTaskName] = useState("");
  const [editTaskDescription, setEditTaskDescription] = useState("");
  const [editTaskSequence, setEditTaskSequence] = useState(1);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);
  const [partId, setPartId] = useState("");
  const [partQuantity, setPartQuantity] = useState(1);
  const [isSubmittingPart, setIsSubmittingPart] = useState(false);

  const [isLaborDialogOpen, setIsLaborDialogOpen] = useState(false);
  const [laborTaskId, setLaborTaskId] = useState("");
  const [laborHours, setLaborHours] = useState(1);
  const [laborNotes, setLaborNotes] = useState("");
  const [isSubmittingLabor, setIsSubmittingLabor] = useState(false);

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [assignRole, setAssignRole] = useState("Technician");
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);
  const [assignmentToRemove, setAssignmentToRemove] = useState<WorkOrderAssignment | null>(null);
  const [isRemovingAssignment, setIsRemovingAssignment] = useState(false);

  const [isInspectionDialogOpen, setIsInspectionDialogOpen] = useState(false);
  const [inspectionFindings, setInspectionFindings] = useState("");
  const [inspectionRecommendation, setInspectionRecommendation] = useState("");
  const [isSubmittingInspection, setIsSubmittingInspection] = useState(false);

  const [isOutsourcingDialogOpen, setIsOutsourcingDialogOpen] = useState(false);
  const [vendorId, setVendorId] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [isSubmittingOutsourcing, setIsSubmittingOutsourcing] = useState(false);

  // Available data for dropdowns
  const [availableParts, setAvailableParts] = useState<SparePart[]>([]);
  const [partSearch, setPartSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState<UserRow[]>([]);
  const [availableVendors, setAvailableVendors] = useState<Vendor[]>([]);

  const fetchWorkOrderData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await workOrderApi.getById(workOrderId);
      setWorkOrderDetails(data);
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to fetch work order details");
    } finally {
      setLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    fetchWorkOrderData();
    
    // Fetch available parts and users for dropdowns
    const toArray = (res: any): any[] => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && Array.isArray(res.content)) return res.content;
      if (res && Array.isArray(res.items)) return res.items;
      return [];
    };

    const fetchDropdownData = async () => {
      try {
        const partsData = await sparePartApi.getAll();
        setAvailableParts(toArray(partsData));
      } catch (err) {
        console.error("Failed to fetch parts", err);
        setAvailableParts([]);
      }

      try {
        const usersData = await userApi.getAll();
        setAvailableUsers(toArray(usersData));
      } catch (err) {
        console.error("Failed to fetch users", err);
        setAvailableUsers([]);
      }

      try {
        const vendorsData = await vendorApi.getAll();
        setAvailableVendors(toArray(vendorsData));
      } catch (err) {
        console.error("Failed to fetch vendors", err);
        setAvailableVendors([]);
      }
    };

    fetchDropdownData();
  }, [fetchWorkOrderData]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleAddComment = () => {
    setError("Comment creation is not exposed by the Work Order Service API. Existing activity history is read from work order details.");
  };

  const handleHold = async () => {
    if (!holdReason.trim()) return;
    setIsHolding(true);
    try {
      await workOrderApi.hold(workOrderId, { reason: holdReason });
      showSuccess("Work order placed on hold");
      setIsHoldDialogOpen(false);
      setHoldReason("");
      await fetchWorkOrderData();
    } catch (err: unknown) {
      setError((err as any)?.message || "Failed to hold work order");
    } finally {
      setIsHolding(false);
    }
  };

  const handleResume = async () => {
    setIsResuming(true);
    try {
      await workOrderApi.resume(workOrderId);
      showSuccess("Work order resumed");
      await fetchWorkOrderData();
    } catch (err: unknown) {
      setError((err as any)?.message || "Failed to resume work order");
    } finally {
      setIsResuming(false);
    }
  };

  const handleCancel = async () => {
    if (!cancelReason.trim()) return;
    setIsCancelling(true);
    try {
      await workOrderApi.cancel(workOrderId, cancelReason);
      showSuccess("Work order cancelled");
      setIsCancelDialogOpen(false);
      setCancelReason("");
      await fetchWorkOrderData();
    } catch (err: unknown) {
      setError((err as any)?.message || "Failed to cancel work order");
    } finally {
      setIsCancelling(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await workOrderApi.complete(workOrderId, { faultFound, notes: completeNotes });
      showSuccess("Work order marked as complete");
      setIsCompleteDialogOpen(false);
      setCompleteNotes("");
      setFaultFound(false);
      await fetchWorkOrderData();
    } catch (err: unknown) {
      setError((err as any)?.message || "Failed to complete work order");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleQCApprove = async () => {
    if (!qcComment.trim()) {
      setError("Quality review comment is required.");
      return;
    }
    setIsSubmittingQC(true);
    try {
      await workOrderApi.submitQualityReview(workOrderId, { isApproved: true, comment: qcComment });
      showSuccess("QC approved — work order completed");
      setIsQCDialogOpen(false);
      setQCComment("");
      await fetchWorkOrderData();
    } catch (err: unknown) {
      setError((err as any)?.message || "Failed to submit QC review");
    } finally {
      setIsSubmittingQC(false);
    }
  };

  const handleQCReject = async () => {
    if (!qcComment.trim()) {
      setError("Quality review comment is required.");
      return;
    }
    setIsSubmittingQC(true);
    try {
      await workOrderApi.submitQualityReview(workOrderId, { isApproved: false, comment: qcComment });
      showSuccess("QC rejected — work order sent for rework");
      setIsQCDialogOpen(false);
      setQCComment("");
      await fetchWorkOrderData();
    } catch (err: unknown) {
      setError((err as any)?.message || "Failed to submit QC review");
    } finally {
      setIsSubmittingQC(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setIsUpdatingStatus(true);
    try {
      if (newStatus === "CLOSED") {
        await workOrderApi.complete(workOrderId, { faultFound: false, notes: "Status updated manually" });
      } else if (newStatus === "ON_HOLD") {
        await workOrderApi.hold(workOrderId, { reason: "Manual status update" });
      } else if (newStatus === "IN_PROGRESS") {
        await workOrderApi.resume(workOrderId);
      } else if (newStatus === "CANCELLED") {
        await workOrderApi.cancel(workOrderId, "Manual status update");
      } else {
        throw new Error(`Direct transition to ${newStatus} is not supported. Please use the appropriate action buttons to transition the work order properly.`);
      }
      
      showSuccess(`Status updated to ${formatStatus(newStatus)}`);
      setIsStatusDialogOpen(false);
      await fetchWorkOrderData();
    } catch (err: unknown) {
      setError((err as any)?.message || "Failed to update status");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAddTask = async () => {
    if (!newTaskName.trim() || !newTaskDescription.trim()) return;
    setIsSubmittingTask(true);
    try {
      await workOrderApi.addTask(workOrderId, { taskName: newTaskName, description: newTaskDescription });
      showSuccess("Task added successfully");
      setIsTaskDialogOpen(false);
      setNewTaskName("");
      setNewTaskDescription("");
      await fetchWorkOrderData();
    } catch (err: any) {
      setError(err.message || "Failed to add task");
    } finally {
      setIsSubmittingTask(false);
    }
  };

  const handleRequestPart = async () => {
    if (!partId.trim() || partQuantity < 1) return;
    setIsSubmittingPart(true);
    try {
      await workOrderApi.requestParts(workOrderId, [{ partId, requestedQuantity: partQuantity }]);
      showSuccess("Part requested successfully");
      setIsPartDialogOpen(false);
      setPartId("");
      setPartQuantity(1);
      await fetchWorkOrderData();
    } catch (err: any) {
      setError(err.message || "Failed to request part");
    } finally {
      setIsSubmittingPart(false);
    }
  };

  const handleLogLabor = async () => {
    if (!laborTaskId || laborHours <= 0) return;
    setIsSubmittingLabor(true);
    try {
      await workOrderApi.logLabor(workOrderId, { taskId: laborTaskId, hoursWorked: laborHours, notes: laborNotes });
      showSuccess("Labor logged successfully");
      setIsLaborDialogOpen(false);
      setLaborTaskId("");
      setLaborHours(1);
      setLaborNotes("");
      await fetchWorkOrderData();
    } catch (err: any) {
      setError(err.message || "Failed to log labor");
    } finally {
      setIsSubmittingLabor(false);
    }
  };

  const handleAssignUser = async () => {
    if (!assigneeId.trim()) return;
    setIsSubmittingAssign(true);
    try {
      await workOrderApi.addAssignment(workOrderId, { userId: assigneeId, assignmentRole: assignRole });
      showSuccess("User assigned successfully");
      setIsAssignDialogOpen(false);
      setAssigneeId("");
      await fetchWorkOrderData();
    } catch (err: any) {
      setError(err.message || "Failed to assign user");
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    try {
      await workOrderApi.updateTaskStatus(taskId, status);
      showSuccess("Task status updated");
      await fetchWorkOrderData();
    } catch (err: any) {
      setError(err.message || "Failed to update task status");
    }
  };

  const openEditTaskDialog = (task: WorkOrderTask) => {
    setEditingTask(task);
    setEditTaskName(task.taskName || "");
    setEditTaskDescription(task.description || "");
    setEditTaskSequence(task.sequenceOrder || 1);
  };

  const handleUpdateTask = async () => {
    if (!editingTask || !editTaskName.trim()) return;
    setIsUpdatingTask(true);
    try {
      await workOrderApi.updateTask(editingTask.id, {
        taskName: editTaskName.trim(),
        description: editTaskDescription.trim() || undefined,
        sequenceOrder: editTaskSequence,
      });
      showSuccess("Task updated");
      setEditingTask(null);
      await fetchWorkOrderData();
    } catch (err: any) {
      setError(err.message || "Failed to update task");
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const handleUpdatePartStatus = async (partRequestId: string, status: string) => {
    try {
      await workOrderApi.updatePartRequestStatus(partRequestId, status);
      showSuccess("Part request status updated");
      await fetchWorkOrderData();
    } catch (err: any) {
      setError(err.message || "Failed to update part request status");
    }
  };

  const handleRemoveAssignment = async () => {
    if (!assignmentToRemove) return;
    setIsRemovingAssignment(true);
    try {
      await workOrderApi.removeAssignment(assignmentToRemove.id);
      showSuccess("Assignment removed");
      setAssignmentToRemove(null);
      await fetchWorkOrderData();
    } catch (err: any) {
      setError(err.message || "Failed to remove assignment");
    } finally {
      setIsRemovingAssignment(false);
    }
  };

  const handleSubmitInspection = async () => {
    if (!inspectionFindings.trim() || !inspectionRecommendation.trim()) return;
    setIsSubmittingInspection(true);
    try {
      await workOrderApi.submitInspectionResults(workOrderId, {
        findings: inspectionFindings.trim(),
        recommendation: inspectionRecommendation.trim(),
      });
      showSuccess("Inspection results submitted");
      setIsInspectionDialogOpen(false);
      setInspectionFindings("");
      setInspectionRecommendation("");
      await fetchWorkOrderData();
    } catch (err: any) {
      setError(err.message || "Failed to submit inspection results");
    } finally {
      setIsSubmittingInspection(false);
    }
  };

  const handleApproveOutsourcing = async () => {
    if (!vendorId.trim()) return;
    setIsSubmittingOutsourcing(true);
    try {
      await workOrderApi.approveOutsourcing(workOrderId, {
        vendorId: vendorId.trim(),
        estimatedCost: Number(estimatedCost) || 0,
      });
      showSuccess("Outsourcing approved");
      setIsOutsourcingDialogOpen(false);
      setVendorId("");
      setEstimatedCost("");
      await fetchWorkOrderData();
    } catch (err: any) {
      setError(err.message || "Failed to approve outsourcing");
    } finally {
      setIsSubmittingOutsourcing(false);
    }
  };

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
  const formatStatus = (status: string) =>
    status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case "comment":      return MessageSquare;
      case "status_change":return Activity;
      case "assignment":   return User;
      case "completion":   return CheckCircle2;
      default:             return Activity;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
        <p className="text-slate-500">Loading work order details...</p>
      </div>
    );
  }

  if (error && !workOrderDetails) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>
      </div>
    );
  }

  if (!workOrderDetails) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <p className="text-slate-500 text-center py-12">Work order not found</p>
      </div>
    );
  }

  const workOrder = workOrderDetails.workOrder;
  const activities = workOrderDetails.activities || [];
  const statusCfg = statusConfig[workOrder.status] ?? DEFAULT_STATUS_CFG;
  const StatusIcon = statusCfg.icon;
  const isAdmin = user.role === "ADMIN" || user.role === "MAINTENANCE_MANAGER";
  const isTech = user.role === "MAINTENANCE_TECHNICIAN" || isAdmin;
  const isFinalStatus = ["CLOSED", "CLOSED_WITH_FOLLOW_UP", "CANCELLED"].includes(workOrder.status);

  const canHold    = isAdmin && ["DRAFT", "ASSIGNED", "IN_PROGRESS"].includes(workOrder.status);
  const canResume  = isAdmin && workOrder.status === "ON_HOLD";
  const canEdit    = isAdmin && !isFinalStatus;
  const canComplete= isTech && ["IN_PROGRESS", "ASSIGNED"].includes(workOrder.status);
  const canCancel  = isAdmin && !isFinalStatus;
  const canQC      = isAdmin && workOrder.status === "PENDING_QC";
  const statusTransitionOptions = [
    canHold ? { value: "ON_HOLD", label: "On Hold" } : null,
    canResume ? { value: "IN_PROGRESS", label: "In Progress" } : null,
    canComplete ? { value: "CLOSED", label: "Closed" } : null,
    canCancel ? { value: "CANCELLED", label: "Cancelled" } : null,
  ].filter((option): option is { value: string; label: string } => Boolean(option));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-slate-900">Work Order Details</h2>
              <Badge className={`${statusCfg.bgColor} ${statusCfg.color} border ${statusCfg.borderColor} font-medium`}>
                <StatusIcon className="w-3 h-3 mr-1" />
                {formatStatus(workOrder.status)}
              </Badge>
              {workOrder.priority && (
                <Badge className={`${(priorityConfig[workOrder.priority] ?? priorityConfig.LOW).bgColor} ${(priorityConfig[workOrder.priority] ?? priorityConfig.LOW).color} border-0`}>
                  {workOrder.priority === "CRITICAL" && <Zap className="w-3 h-3 mr-1" />}
                  {workOrder.priority}
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">
              {workOrder.workOrderType?.replace(/_/g, " ")} &bull; {workOrder.assetName || workOrder.assetId}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {canResume && (
            <Button variant="outline" onClick={handleResume} disabled={isResuming} className="text-green-600 border-green-300 hover:bg-green-50">
              <Play className="w-4 h-4 mr-2" />
              {isResuming ? "Resuming..." : "Resume"}
            </Button>
          )}
          {canHold && (
            <Button variant="outline" onClick={() => setIsHoldDialogOpen(true)} className="text-yellow-700 border-yellow-300 hover:bg-yellow-50">
              <Pause className="w-4 h-4 mr-2" />Hold
            </Button>
          )}
          {canComplete && (
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(true)} className="text-green-700 border-green-300 hover:bg-green-50">
              <CheckCircle2 className="w-4 h-4 mr-2" />Complete
            </Button>
          )}
          {canQC && (
            <Button variant="outline" onClick={() => setIsQCDialogOpen(true)} className="text-indigo-700 border-indigo-300 hover:bg-indigo-50">
              <ClipboardList className="w-4 h-4 mr-2" />QC Review
            </Button>
          )}
          {canCancel && (
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(true)} className="text-red-600 border-red-300 hover:bg-red-50">
              <XCircle className="w-4 h-4 mr-2" />Cancel
            </Button>
          )}
          {statusTransitionOptions.length > 0 && (
            <Button variant="outline" onClick={() => {
              setNewStatus("");
              setIsStatusDialogOpen(true);
            }} className="text-blue-600 border-blue-300 hover:bg-blue-50">
              <RefreshCw className="w-4 h-4 mr-2" />Update Status
            </Button>
          )}
          {canEdit && String(workOrder.workOrderType).toUpperCase() === "INSPECTION" && (
            <Button variant="outline" onClick={() => setIsInspectionDialogOpen(true)}>
              Submit Inspection
            </Button>
          )}
          {canEdit && String(workOrder.workOrderType).toUpperCase() === "OUTSOURCING" && (
            <Button variant="outline" onClick={() => setIsOutsourcingDialogOpen(true)}>
              Approve Outsourcing
            </Button>
          )}
          {canEdit && onEdit && (
            <Button onClick={() => onEdit(workOrder.id)}>
              <Edit className="w-4 h-4 mr-2" />Edit
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4" /><AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6 bg-slate-50 p-1 flex overflow-x-auto w-full justify-start md:justify-center border-b rounded-lg">
          <TabsTrigger value="overview" className="flex-1 md:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ClipboardList className="w-4 h-4 mr-2" /> Overview
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex-1 md:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Wrench className="w-4 h-4 mr-2" /> Tasks
          </TabsTrigger>
          <TabsTrigger value="parts" className="flex-1 md:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Package className="w-4 h-4 mr-2" /> Parts & Labor
          </TabsTrigger>
          <TabsTrigger value="team" className="flex-1 md:flex-none data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Users className="w-4 h-4 mr-2" /> Team
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details grid */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b">Work Order Details</h3>
            <div className="grid grid-cols-2 gap-x-6 gap-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Type</p>
                <p className="text-sm font-medium text-slate-900">{workOrder.workOrderType?.replace(/_/g, " ")}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Asset</p>
                <p className="text-sm font-medium text-slate-900">{workOrder.assetName || workOrder.assetId}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Assigned To</p>
                <p className="text-sm font-medium text-slate-900">
                  {workOrderDetails.assignments?.length > 0
                    ? workOrderDetails.assignments.map((a) => a.userName || a.userId).join(", ")
                    : "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Created</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(workOrder.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Last Updated</p>
                <p className="text-sm font-medium text-slate-900">{formatDate(workOrder.updatedAt)}</p>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-3 pb-3 border-b">Description</h3>
            <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">{workOrder.description || "No description provided."}</p>
          </Card>

          {/* Comments & Activity */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b">Comments & Activity</h3>

            {/* Add Comment */}
            <div className="mb-6 p-4 bg-slate-50 rounded-lg border">
              <Textarea
                placeholder="Add a comment or note..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="mb-3 bg-white"
                rows={3}
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || submittingComment}
                size="sm"
              >
                <Send className="w-4 h-4 mr-2" />
                {submittingComment ? "Posting..." : "Post Comment"}
              </Button>
            </div>

            {/* Activity List */}
            <div className="space-y-3">
              {activities.length === 0 ? (
                <div className="text-center py-10">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No activity yet</p>
                </div>
              ) : (
                [...activities].reverse().map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.activityType);
                  return (
                    <div key={activity.id} className="flex gap-3 p-3 bg-white border rounded-lg hover:bg-slate-50 transition-colors">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <ActivityIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <p className="text-sm font-medium text-slate-900">{activity.createdByName || activity.createdBy}</p>
                          <span className="text-xs text-slate-400">{formatDate(activity.createdAt)}</span>
                          <Badge variant="outline" className="text-xs py-0">{activity.activityType?.replace(/_/g, " ")}</Badge>
                        </div>
                        <p className="text-sm text-slate-700">{activity.description || activity.notes || activity.metadata || "No details provided."}</p>
                        {activity.oldValue && activity.newValue && (
                          <p className="text-xs text-slate-400 mt-1">
                            {activity.oldValue} &rarr; {activity.newValue}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card className="p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Created</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(workOrder.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Last Updated</p>
                  <p className="text-sm font-medium text-slate-900">{formatDate(workOrder.updatedAt)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Labor Logs */}
          {workOrderDetails.laborLogs?.length > 0 && (
            <Card className="p-6">
              <h3 className="text-base font-semibold text-slate-900 mb-4 pb-3 border-b">Labor Logs</h3>
              <div className="space-y-3">
                {workOrderDetails.laborLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{log.userName || log.userId}</p>
                      {log.notes && <p className="text-xs text-slate-500 mt-0.5">{log.notes}</p>}
                    </div>
                    <span className="text-sm font-bold text-slate-900 bg-white px-2 py-1 rounded border">{log.hoursWorked}h</span>
                  </div>
                ))}
                <div className="pt-3 border-t flex items-center justify-between">
                  <p className="text-sm text-slate-500">Total Hours</p>
                  <p className="text-xl font-bold text-slate-900">
                    {workOrderDetails.laborLogs.reduce((sum, log) => sum + log.hoursWorked, 0)}h
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
        </div>
        </TabsContent>

        {/* Tasks Tab */}
        <TabsContent value="tasks" className="mt-0 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <h3 className="text-base font-semibold text-slate-900">Work Order Tasks</h3>
              <Button onClick={() => setIsTaskDialogOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" /> Add Task
              </Button>
            </div>
            {workOrderDetails.tasks?.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed">
                <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium text-sm">No tasks added yet</p>
                <p className="text-slate-400 text-xs mt-1">Break down this work order into sub-tasks.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {workOrderDetails.tasks?.map((task, index) => {
                  const taskStatus = task.status || "PENDING";
                  const taskStatusClass = taskStatus === "COMPLETED"
                    ? "bg-green-50 text-green-700 border-green-200"
                    : taskStatus === "IN_PROGRESS"
                      ? "bg-orange-50 text-orange-700 border-orange-200"
                      : "bg-slate-50 text-slate-600 border-slate-200";

                  return (
                    <div key={task.id} className="overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4 border-b bg-slate-50/80 px-4 py-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 font-bold text-sm">
                            {index + 1}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-semibold text-slate-900 truncate">{task.taskName}</h4>
                            <p className="text-xs text-slate-500">Sequence {task.sequenceOrder || index + 1}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={taskStatusClass}>
                          {taskStatus.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <div className="p-4">
                        <p className="text-sm text-slate-600 leading-6">{task.description || "No task description provided."}</p>
                        <div className="mt-4 flex items-center justify-between gap-3 flex-wrap rounded-lg bg-slate-50 p-3">
                          <div className="space-y-1">
                            <Label className="text-xs font-medium text-slate-500">Task Status</Label>
                            <Select value={taskStatus} onValueChange={(status) => handleUpdateTaskStatus(task.id, status)}>
                              <SelectTrigger className="h-9 w-44 bg-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                <SelectItem value="COMPLETED">Completed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => openEditTaskDialog(task)}>
                            Edit Task
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </TabsContent>

        {/* Parts & Labor Tab */}
        <TabsContent value="parts" className="mt-0 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Parts Requests */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="text-base font-semibold text-slate-900">Requested Parts</h3>
                <Button onClick={() => setIsPartDialogOpen(true)} size="sm" variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                  <Package className="w-4 h-4 mr-2" /> Request Part
                </Button>
              </div>
              {workOrderDetails.partRequests?.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No parts requested.</div>
              ) : (
                <div className="space-y-3">
                  {workOrderDetails.partRequests?.map((pr) => {
                    const partStatus = pr.status || "PENDING";
                    const partStatusClass = partStatus === "ISSUED" || partStatus === "USED" || partStatus === "FULFILLED"
                      ? "bg-green-50 text-green-700 border-green-200"
                      : partStatus === "RETURNED"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-yellow-50 text-yellow-700 border-yellow-200";

                    return (
                      <div key={pr.id} className="overflow-hidden rounded-xl border bg-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between gap-3 border-b bg-slate-50/80 px-4 py-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                              <Package className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-semibold text-slate-900 truncate">{pr.partName || pr.partId}</p>
                              <p className="text-xs text-slate-500">Requested {pr.createdAt ? new Date(pr.createdAt).toLocaleDateString() : "—"}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className={partStatusClass}>{partStatus}</Badge>
                        </div>
                        <div className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">Requested Qty</p>
                              <p className="text-lg font-bold text-slate-900">{pr.requestedQuantity}</p>
                            </div>
                            <div className="rounded-lg bg-slate-50 p-3">
                              <p className="text-xs text-slate-500">Consumed Qty</p>
                              <p className="text-lg font-bold text-slate-900">{pr.consumedQuantity ?? 0}</p>
                            </div>
                          </div>
                          <div className="rounded-lg bg-slate-50 p-3 space-y-1">
                            <Label className="text-xs font-medium text-slate-500">Part Status</Label>
                            <Select value={partStatus} onValueChange={(status) => handleUpdatePartStatus(pr.id, status)}>
                              <SelectTrigger className="h-9 bg-white text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pending</SelectItem>
                                <SelectItem value="ISSUED">Issued</SelectItem>
                                <SelectItem value="USED">Used</SelectItem>
                                <SelectItem value="RETURNED">Returned</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            {/* Labor Logs */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b">
                <h3 className="text-base font-semibold text-slate-900">Labor Logs</h3>
                <Button onClick={() => setIsLaborDialogOpen(true)} size="sm" variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
                  <Clock className="w-4 h-4 mr-2" /> Log Time
                </Button>
              </div>
              {workOrderDetails.laborLogs?.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">No time logged yet.</div>
              ) : (
                <div className="space-y-3">
                  {workOrderDetails.laborLogs?.map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{log.userName || log.userId}</p>
                        {log.notes && <p className="text-xs text-slate-500 mt-0.5">{log.notes}</p>}
                        <p className="text-xs text-slate-400 mt-1">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                      <span className="text-lg font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded border">{log.hoursWorked}h</span>
                    </div>
                  ))}
                  <div className="pt-4 mt-4 border-t flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-600">Total Hours</p>
                    <p className="text-xl font-bold text-slate-900">
                      {workOrderDetails.laborLogs?.reduce((sum, log) => sum + log.hoursWorked, 0) || 0}h
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-0 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <h3 className="text-base font-semibold text-slate-900">Assigned Team</h3>
              <Button onClick={() => setIsAssignDialogOpen(true)} size="sm">
                <Users className="w-4 h-4 mr-2" /> Assign User
              </Button>
            </div>
            {workOrderDetails.assignments?.length === 0 ? (
              <div className="text-center py-10 bg-slate-50 rounded-lg border border-dashed">
                <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-500 font-medium text-sm">No users assigned</p>
                <p className="text-slate-400 text-xs mt-1">Assign technicians and inspectors to this work order.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {workOrderDetails.assignments?.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                      {(a.userName || a.userId).charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900">{a.userName || a.userId}</p>
                      <p className="text-xs font-medium text-blue-600">{a.assignmentRole}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Assigned {new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setAssignmentToRemove(a)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                      <Trash2 className="w-3 h-3 mr-1" /> Remove
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Hold Dialog */}
      <Dialog open={isHoldDialogOpen} onOpenChange={setIsHoldDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Work Order On Hold</DialogTitle>
            <DialogDescription>Provide a reason for holding this work order. It will be logged.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for hold..."
              value={holdReason}
              onChange={(e) => setHoldReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsHoldDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleHold} disabled={!holdReason.trim() || isHolding} className="bg-yellow-600 hover:bg-yellow-700">
              {isHolding ? "Placing on Hold..." : "Confirm Hold"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Work Order</DialogTitle>
            <DialogDescription>This will cancel the work order. Please provide a reason.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>Go Back</Button>
            <Button onClick={handleCancel} disabled={!cancelReason.trim() || isCancelling} className="bg-red-600 hover:bg-red-700">
              {isCancelling ? "Cancelling..." : "Cancel Work Order"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Work Order</DialogTitle>
            <DialogDescription>Confirm completion details before submitting.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg border">
              <input
                type="checkbox"
                id="fault-found"
                checked={faultFound}
                onChange={(e) => setFaultFound(e.target.checked)}
                className="w-4 h-4 accent-blue-600"
              />
              <Label htmlFor="fault-found" className="cursor-pointer">Fault was found during this work order</Label>
            </div>
            <div className="space-y-2">
              <Label>Completion Notes (optional)</Label>
              <Textarea
                placeholder="Any notes about the completed work..."
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleComplete} disabled={isCompleting} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              {isCompleting ? "Completing..." : "Mark as Complete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QC Review Dialog */}
      <Dialog open={isQCDialogOpen} onOpenChange={setIsQCDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Quality Control Review</DialogTitle>
            <DialogDescription>Review the completed work and submit your QC decision.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Label>QC Comment (optional)</Label>
            <Textarea
              placeholder="Add any QC notes or findings..."
              value={qcComment}
              onChange={(e) => setQCComment(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsQCDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleQCReject} disabled={isSubmittingQC} className="bg-red-600 hover:bg-red-700">
              <ThumbsDown className="w-4 h-4 mr-2" />
              {isSubmittingQC ? "Submitting..." : "Reject (Rework)"}
            </Button>
            <Button onClick={handleQCApprove} disabled={isSubmittingQC} className="bg-green-600 hover:bg-green-700">
              <ThumbsUp className="w-4 h-4 mr-2" />
              {isSubmittingQC ? "Submitting..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isStatusDialogOpen} onOpenChange={setIsStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Work Order Status</DialogTitle>
            <DialogDescription>Manually transition the work order to a new status.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3">
            <Label>New Status</Label>
            <Select value={newStatus} onValueChange={setNewStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                {statusTransitionOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus} disabled={isUpdatingStatus || !newStatus || newStatus === workOrder.status}>
              {isUpdatingStatus ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Task Dialog */}
      <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>Add a new sub-task to this work order.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Task Name</Label>
              <Input
                placeholder="e.g. Inspect filters"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Detailed instructions for this task..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddTask} disabled={isSubmittingTask || !newTaskName.trim()}>
              {isSubmittingTask ? "Adding..." : "Add Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Request Part Dialog */}
      <Dialog open={isPartDialogOpen} onOpenChange={(open) => { setIsPartDialogOpen(open); if (!open) { setPartSearch(""); setPartId(""); setPartQuantity(1); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Request Part</DialogTitle>
            <DialogDescription>Search and select a spare part required for this work order.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Search Parts</Label>
              <Input
                placeholder="Search by part name or number..."
                value={partSearch}
                onChange={(e) => setPartSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1 border rounded-lg p-1 bg-slate-50">
              {availableParts.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-sm">No spare parts found. Parts may not be loaded yet.</p>
              ) : (
                (() => {
                  const filtered = availableParts.filter((p) =>
                    p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
                    p.partNumber?.toLowerCase().includes(partSearch.toLowerCase())
                  );
                  if (filtered.length === 0) return <p className="text-center py-6 text-slate-400 text-sm">No parts found.</p>;
                  return filtered.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPartId(p.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm transition-colors ${
                        partId === p.id
                          ? "bg-blue-600 text-white"
                          : "hover:bg-white text-slate-700"
                      }`}
                    >
                      <div className="text-left">
                        <p className="font-medium">{p.name}</p>
                        <p className={`text-xs ${partId === p.id ? "text-blue-200" : "text-slate-400"}`}>{p.partNumber}</p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        partId === p.id ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-600"
                      }`}>
                        Stock: {p.quantityOnHand}
                      </span>
                    </button>
                  ));
                })()
              )}
            </div>
            {partId && (
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={partQuantity}
                  onChange={(e) => setPartQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsPartDialogOpen(false); setPartSearch(""); setPartId(""); setPartQuantity(1); }}>Cancel</Button>
            <Button onClick={handleRequestPart} disabled={isSubmittingPart || !partId}>
              {isSubmittingPart ? "Requesting..." : "Request Part"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Log Labor Dialog */}
      <Dialog open={isLaborDialogOpen} onOpenChange={setIsLaborDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Labor</DialogTitle>
            <DialogDescription>Log the hours worked on this work order.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Task</Label>
              <Select value={laborTaskId} onValueChange={setLaborTaskId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select the task worked on" />
                </SelectTrigger>
                <SelectContent>
                  {workOrderDetails.tasks?.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.taskName || task.description || task.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Hours Worked</Label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={laborHours}
                onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (optional)</Label>
              <Textarea
                placeholder="What work was performed during this time?"
                value={laborNotes}
                onChange={(e) => setLaborNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLaborDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleLogLabor} disabled={isSubmittingLabor || !laborTaskId || laborHours <= 0}>
              {isSubmittingLabor ? "Logging..." : "Log Labor"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign User Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={(open) => { setIsAssignDialogOpen(open); if (!open) { setUserSearch(""); setAssigneeId(""); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign User</DialogTitle>
            <DialogDescription>Search and select a team member to assign to this work order.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Search Users</Label>
              <Input
                placeholder="Search by name or email..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                autoFocus
              />
            </div>
            <div className="max-h-56 overflow-y-auto space-y-1 border rounded-lg p-1 bg-slate-50">
              {availableUsers.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-sm">No users found. Users may not be loaded yet.</p>
              ) : (
                (() => {
                  const filtered = availableUsers.filter((u) =>
                    u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.email?.toLowerCase().includes(userSearch.toLowerCase())
                  );
                  if (filtered.length === 0) return <p className="text-center py-6 text-slate-400 text-sm">No users found.</p>;
                  return filtered.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setAssigneeId(u.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
                        assigneeId === u.id
                          ? "bg-blue-600 text-white"
                          : "hover:bg-white text-slate-700"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        assigneeId === u.id ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-600"
                      }`}>
                        {u.name?.charAt(0).toUpperCase() || "?"}
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{u.name}</p>
                        <p className={`text-xs ${assigneeId === u.id ? "text-blue-200" : "text-slate-400"}`}>{u.email}</p>
                      </div>
                    </button>
                  ));
                })()
              )}
            </div>
            {assigneeId && (
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={assignRole} onValueChange={setAssignRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Technician">Technician</SelectItem>
                    <SelectItem value="Inspector">Inspector</SelectItem>
                    <SelectItem value="Lead">Lead</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsAssignDialogOpen(false); setUserSearch(""); setAssigneeId(""); }}>Cancel</Button>
            <Button onClick={handleAssignUser} disabled={isSubmittingAssign || !assigneeId}>
              {isSubmittingAssign ? "Assigning..." : "Assign User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
            <DialogDescription>Update task details and execution order.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Task Name</Label>
              <Input value={editTaskName} onChange={(e) => setEditTaskName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea value={editTaskDescription} onChange={(e) => setEditTaskDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Sequence Order</Label>
              <Input type="number" min="1" value={editTaskSequence} onChange={(e) => setEditTaskSequence(Number(e.target.value) || 1)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTask(null)}>Cancel</Button>
            <Button onClick={handleUpdateTask} disabled={isUpdatingTask || !editTaskName.trim()}>
              {isUpdatingTask ? "Saving..." : "Save Task"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!assignmentToRemove} onOpenChange={(open) => !open && setAssignmentToRemove(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Assignment</DialogTitle>
            <DialogDescription>
              Remove {assignmentToRemove?.userName || assignmentToRemove?.userId} from this work order team.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignmentToRemove(null)}>Cancel</Button>
            <Button onClick={handleRemoveAssignment} disabled={isRemovingAssignment} className="bg-red-600 hover:bg-red-700">
              {isRemovingAssignment ? "Removing..." : "Remove Assignment"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isInspectionDialogOpen} onOpenChange={setIsInspectionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Inspection Results</DialogTitle>
            <DialogDescription>
              Choose a recommendation. Internal repair and outsourcing automatically create child work orders.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Findings</Label>
              <Textarea value={inspectionFindings} onChange={(e) => setInspectionFindings(e.target.value)} rows={4} />
            </div>
            <div className="space-y-2">
              <Label>Recommendation</Label>
              <Select value={inspectionRecommendation} onValueChange={setInspectionRecommendation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select inspection outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NO_FAULT_FOUND">No fault found</SelectItem>
                  <SelectItem value="NEEDS_INTERNAL_REPAIR">Needs internal repair</SelectItem>
                  <SelectItem value="NEEDS_OUTSOURCE">Needs outsource</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-slate-500">
                Needs outsource creates a new OUTSOURCING work order. Approve that new work order after it appears in the Work Orders list.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInspectionDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitInspection} disabled={isSubmittingInspection || !inspectionFindings.trim() || !inspectionRecommendation.trim()}>
              {isSubmittingInspection ? "Submitting..." : "Submit Results"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isOutsourcingDialogOpen} onOpenChange={setIsOutsourcingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Outsourcing</DialogTitle>
            <DialogDescription>
              Approve an OUTSOURCING work order created from an inspection recommendation.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm text-blue-900">
            This action moves the work order to OUTSOURCED_IN_PROGRESS and records vendor outsourcing details.
          </div>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label>Vendor</Label>
              {availableVendors.length > 0 ? (
                <Select value={vendorId} onValueChange={setVendorId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}{vendor.email ? ` - ${vendor.email}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={vendorId} onChange={(e) => setVendorId(e.target.value)} placeholder="Vendor UUID" />
              )}
            </div>
            <div className="space-y-2">
              <Label>Estimated Cost</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOutsourcingDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleApproveOutsourcing} disabled={isSubmittingOutsourcing || !vendorId.trim()}>
              {isSubmittingOutsourcing ? "Approving..." : "Approve"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
