"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
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
} from "lucide-react";
import { UserInfo, WorkOrderDetails } from "@/types";
import { workOrderApi } from "@/lib/api";

type WorkOrderDetailProps = {
  workOrderId: string;
  user: UserInfo;
  onBack: () => void;
  onEdit?: (workOrderId: string) => void;
};

const statusConfig = {
  NEW: { color: 'text-blue-600', bgColor: 'bg-blue-100', icon: Clock },
  IN_PROGRESS: { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: AlertTriangle },
  PENDING_QC: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  COMPLETED: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle2 },
  CANCELLED: { color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle },
  REWORK_REQUIRED: { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: AlertTriangle }
};

const priorityConfig = {
  LOW: { color: 'text-green-700', bgColor: 'bg-green-50' },
  MEDIUM: { color: 'text-blue-700', bgColor: 'bg-blue-50' },
  HIGH: { color: 'text-orange-700', bgColor: 'bg-orange-50' },
  CRITICAL: { color: 'text-red-700', bgColor: 'bg-red-50' }
};

export function WorkOrderDetail({ workOrderId, user, onBack, onEdit }: WorkOrderDetailProps) {
  const [workOrderDetails, setWorkOrderDetails] = useState<WorkOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);

  const fetchWorkOrderData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await workOrderApi.getById(workOrderId);
      setWorkOrderDetails(data);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || "Failed to fetch work order details";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [workOrderId]);

  useEffect(() => {
    fetchWorkOrderData();
  }, [fetchWorkOrderData]);

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
      setSuccess("Comment added successfully");
      setTimeout(() => setSuccess(""), 3000);
      
      // Refresh work order data
      await fetchWorkOrderData();
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || "Failed to add comment";
      setError(message);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatPriority = (priority: string) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'comment': return MessageSquare;
      case 'status_change': return Activity;
      case 'assignment': return User;
      case 'completion': return CheckCircle2;
      default: return Activity;
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 mt-4">Loading work order details...</p>
      </div>
    );
  }

  if (error && !workOrderDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!workOrderDetails) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-slate-600">Work order not found</p>
        </div>
      </div>
    );
  }

  const workOrder = workOrderDetails.workOrder;
  const activities = workOrderDetails.activities || [];
  const StatusIcon = statusConfig[workOrder.status as keyof typeof statusConfig]?.icon || Clock;
  const canEdit = user.role === "Administrator" || user.role === "Maintenance Manager";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl text-slate-900 mb-1">Work Order #{workOrder.id}</h2>
            <p className="text-slate-600">{workOrder.workOrderType} - {workOrder.assetName || workOrder.assetId}</p>
          </div>
        </div>
        {canEdit && onEdit && (
          <Button onClick={() => onEdit(workOrder.id)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">Work Order Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Status</p>
                <Badge className={`${statusConfig[workOrder.status as keyof typeof statusConfig]?.bgColor} ${statusConfig[workOrder.status as keyof typeof statusConfig]?.color} border-0`}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {formatStatus(workOrder.status)}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Priority</p>
                {workOrder.priority && (
                  <Badge className={`${priorityConfig[workOrder.priority as keyof typeof priorityConfig]?.bgColor} ${priorityConfig[workOrder.priority as keyof typeof priorityConfig]?.color} border-0`}>
                    {workOrder.priority === 'CRITICAL' && <Zap className="w-3 h-3 mr-1" />}
                    {formatPriority(workOrder.priority)}
                  </Badge>
                )}
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Type</p>
                <p className="text-sm text-slate-900">{workOrder.workOrderType.replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Asset</p>
                <p className="text-sm text-slate-900">{workOrder.assetName || workOrder.assetId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Assigned To</p>
                <p className="text-sm text-slate-900">
                  {workOrderDetails.assignments.length > 0 
                    ? workOrderDetails.assignments.map(a => a.userName || a.userId).join(', ')
                    : "Unassigned"}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Created</p>
                <p className="text-sm text-slate-900">{formatDate(workOrder.createdAt)}</p>
              </div>
            </div>
          </Card>

          {/* Description */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">Description</h3>
            <p className="text-slate-700 whitespace-pre-wrap">{workOrder.description}</p>
          </Card>

          {/* Comments Section */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">Comments & Activities</h3>
            
            {/* Add Comment */}
            {canEdit && (
              <div className="mb-6 p-4 bg-slate-50 rounded-lg">
                <Textarea
                  placeholder="Add a comment or update..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                  rows={3}
                />
                <Button 
                  onClick={handleAddComment} 
                  disabled={!newComment.trim() || submittingComment}
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {submittingComment ? "Adding..." : "Add Comment"}
                </Button>
              </div>
            )}

            {/* Activities List */}
            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-slate-500 text-center py-8">No activities yet</p>
              ) : (
                activities.map((activity) => {
                  const ActivityIcon = getActivityIcon(activity.activityType);
                  return (
                    <div key={activity.id} className="flex gap-3 p-3 bg-white border rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <ActivityIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-slate-900">
                            {activity.createdByName || activity.createdBy}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatDate(activity.createdAt)}
                          </p>
                        </div>
                        <p className="text-sm text-slate-700">{activity.description}</p>
                        {activity.oldValue && activity.newValue && (
                          <p className="text-xs text-slate-500 mt-1">
                            Changed from &ldquo;{activity.oldValue}&rdquo; to &ldquo;{activity.newValue}&rdquo;
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
            <h3 className="text-lg text-slate-900 mb-4">Timeline</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Created</p>
                  <p className="text-sm text-slate-900">{formatDate(workOrder.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Activity className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Last Updated</p>
                  <p className="text-sm text-slate-900">{formatDate(workOrder.updatedAt)}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Labor Logs */}
          {workOrderDetails.laborLogs.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg text-slate-900 mb-4">Labor Logs</h3>
              <div className="space-y-3">
                {workOrderDetails.laborLogs.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 rounded">
                    <div>
                      <p className="text-sm text-slate-900 font-medium">{log.userName || log.userId}</p>
                      {log.notes && <p className="text-xs text-slate-600">{log.notes}</p>}
                    </div>
                    <p className="text-sm text-slate-900 font-medium">{log.hoursWorked}h</p>
                  </div>
                ))}
                <div className="pt-3 border-t">
                  <p className="text-sm text-slate-600">Total Hours</p>
                  <p className="text-2xl text-slate-900">
                    {workOrderDetails.laborLogs.reduce((sum, log) => sum + log.hoursWorked, 0)}h
                  </p>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
