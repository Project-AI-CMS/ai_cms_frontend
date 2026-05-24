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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { UserInfo, WorkOrderDetails, SparePart } from "@/types";
import { workOrderApi, sparePartApi, userApi } from "@/lib/api";

type UserRow = { id: string; name: string; email: string; role?: string; isActive?: boolean };

type WorkOrderDetailProps = {
  workOrderId: string;
  user: UserInfo;
  onBack: () => void;
  onEdit?: (workOrderId: string) => void;
};

const statusConfig: Record<string, { color: string; bgColor: string; borderColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT:           { color: "text-gray-700",   bgColor: "bg-gray-100",   borderColor: "border-gray-300",   icon: Clock },
  NEW:             { color: "text-blue-700",   bgColor: "bg-blue-100",   borderColor: "border-blue-300",   icon: Clock },
  ASSIGNED:        { color: "text-purple-700", bgColor: "bg-purple-100", borderColor: "border-purple-300", icon: User },
  IN_PROGRESS:     { color: "text-orange-700", bgColor: "bg-orange-100", borderColor: "border-orange-300", icon: Activity },
  ON_HOLD:         { color: "text-yellow-700", bgColor: "bg-yellow-100", borderColor: "border-yellow-300", icon: Pause },
  PENDING_QC:      { color: "text-indigo-700", bgColor: "bg-indigo-100", borderColor: "border-indigo-300", icon: ClipboardList },
  COMPLETED:       { color: "text-green-700",  bgColor: "bg-green-100",  borderColor: "border-green-300",  icon: CheckCircle2 },
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

  const [isPartDialogOpen, setIsPartDialogOpen] = useState(false);
  const [partId, setPartId] = useState("");
  const [partQuantity, setPartQuantity] = useState(1);
  const [isSubmittingPart, setIsSubmittingPart] = useState(false);

  const [isLaborDialogOpen, setIsLaborDialogOpen] = useState(false);
  const [laborHours, setLaborHours] = useState(1);
  const [laborNotes, setLaborNotes] = useState("");
  const [isSubmittingLabor, setIsSubmittingLabor] = useState(false);

  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [assigneeId, setAssigneeId] = useState("");
  const [assignRole, setAssignRole] = useState("Technician");
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  // Available data for dropdowns
  const [availableParts, setAvailableParts] = useState<SparePart[]>([]);
  const [partSearch, setPartSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [availableUsers, setAvailableUsers] = useState<UserRow[]>([]);

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
    };

    fetchDropdownData();
  }, [fetchWorkOrderData]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 4000);
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setSubmittingComment(true);
    try {
      await workOrderApi.addActivity(workOrderId, {
        activityType: "comment",
        description: newComment.trim(),
        createdBy: user.name,
      });
      setNewComment("");
      showSuccess("Comment added successfully");
      await fetchWorkOrderData();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message || "Failed to add comment");
    } finally {
      setSubmittingComment(false);
    }
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
      if (newStatus === "COMPLETED") {
        await workOrderApi.complete(workOrderId, { faultFound: false, notes: "Status updated manually" });
      } else if (newStatus === "ON_HOLD") {
        await workOrderApi.hold(workOrderId, { reason: "Manual status update" });
      } else if (newStatus === "IN_PROGRESS") {
        await workOrderApi.resume(workOrderId);
      } else if (newStatus === "CANCELLED") {
        await workOrderApi.cancel(workOrderId, "Manual status update");
      } else if (newStatus === "PENDING_QC") {
        await workOrderApi.submitQualityReview(workOrderId, { isApproved: false, comment: "Submitted for QC review via status update" });
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
    if (laborHours <= 0) return;
    setIsSubmittingLabor(true);
    try {
      await workOrderApi.logLabor(workOrderId, { hoursWorked: laborHours, notes: laborNotes });
      showSuccess("Labor logged successfully");
      setIsLaborDialogOpen(false);
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

  const canHold    = isAdmin && ["NEW", "ASSIGNED", "IN_PROGRESS"].includes(workOrder.status);
  const canResume  = isAdmin && workOrder.status === "ON_HOLD";
  const canEdit    = isAdmin && !["COMPLETED", "CANCELLED"].includes(workOrder.status);
  const canComplete= isTech && ["IN_PROGRESS", "ASSIGNED"].includes(workOrder.status);
  const canCancel  = isAdmin && !["COMPLETED", "CANCELLED"].includes(workOrder.status);
  const canQC      = isAdmin && workOrder.status === "PENDING_QC";

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
          {canEdit && (
            <Button variant="outline" onClick={() => {
              setNewStatus(workOrder.status);
              setIsStatusDialogOpen(true);
            }} className="text-blue-600 border-blue-300 hover:bg-blue-50">
              <RefreshCw className="w-4 h-4 mr-2" />Update Status
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
                        <p className="text-sm text-slate-700">{activity.description}</p>
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
                {workOrderDetails.tasks?.map((task, index) => (
                  <div key={task.id} className="flex gap-4 p-4 bg-white border rounded-lg shadow-sm">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center flex-shrink-0 font-bold text-slate-500">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-semibold text-slate-900">{task.taskName}</h4>
                        <Badge variant="outline" className={task.status === "COMPLETED" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50"}>
                          {task.status?.replace(/_/g, " ")}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600">{task.description}</p>
                    </div>
                  </div>
                ))}
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
                  {workOrderDetails.partRequests?.map((pr) => (
                    <div key={pr.id} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                      <div>
                        <p className="text-sm font-medium text-slate-900">Part: {pr.partName || pr.partId}</p>
                        <p className="text-xs text-slate-500 mt-0.5">Requested: {new Date(pr.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold bg-slate-100 px-2 py-1 rounded">Qty: {pr.requestedQuantity}</span>
                        <Badge variant="outline" className={pr.status === "FULFILLED" ? "bg-green-50 text-green-700 border-green-200" : "bg-slate-50"}>
                          {pr.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
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
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{a.userName || a.userId}</p>
                      <p className="text-xs font-medium text-blue-600">{a.assignmentRole}</p>
                      <p className="text-xs text-slate-400 mt-0.5">Assigned {new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
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
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="ASSIGNED">Assigned</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                <SelectItem value="PENDING_QC">Pending QC</SelectItem>
                <SelectItem value="COMPLETED">Completed</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
                <SelectItem value="REWORK_REQUIRED">Rework Required</SelectItem>
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
            <Button onClick={handleLogLabor} disabled={isSubmittingLabor || laborHours <= 0}>
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
    </div>
  );
}
