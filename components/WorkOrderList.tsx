"use client";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Clock,
  AlertTriangle,
  Zap,
} from "lucide-react";
import { WorkOrder, WorkOrderStatus, WorkOrderPriority, UserInfo } from "@/types";
import { workOrderApi } from "@/lib/api";

type WorkOrderListProps = {
  user: UserInfo;
  onViewWorkOrder?: (workOrderId: string) => void;
  onEditWorkOrder?: (workOrderId: string) => void;
};

const statusConfig: Record<string, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  DRAFT:           { color: 'text-gray-600',   bgColor: 'bg-gray-100',   icon: Clock },
  NEW:             { color: 'text-blue-600',   bgColor: 'bg-blue-100',   icon: Clock },
  ASSIGNED:        { color: 'text-purple-600', bgColor: 'bg-purple-100', icon: Clock },
  IN_PROGRESS:     { color: 'text-orange-600', bgColor: 'bg-orange-100', icon: AlertTriangle },
  ON_HOLD:         { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  PENDING_QC:      { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  COMPLETED:       { color: 'text-green-600',  bgColor: 'bg-green-100',  icon: CheckCircle2 },
  CANCELLED:       { color: 'text-red-600',    bgColor: 'bg-red-100',    icon: AlertCircle },
  REWORK_REQUIRED: { color: 'text-red-600',    bgColor: 'bg-red-50',     icon: AlertTriangle },
};

const DEFAULT_STATUS = { color: 'text-slate-600', bgColor: 'bg-slate-100', icon: Clock };

const priorityConfig: Record<WorkOrderPriority, { color: string; bgColor: string }> = {
  LOW: { color: 'text-green-700', bgColor: 'bg-green-50' },
  MEDIUM: { color: 'text-blue-700', bgColor: 'bg-blue-50' },
  HIGH: { color: 'text-orange-700', bgColor: 'bg-orange-50' },
  CRITICAL: { color: 'text-red-700', bgColor: 'bg-red-50' }
};

export function WorkOrderList({ user, onViewWorkOrder, onEditWorkOrder }: WorkOrderListProps) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workOrderToDelete, setWorkOrderToDelete] = useState<WorkOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchWorkOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const params: {
        statuses?: string[];
        workOrderTypes?: string[];
        assetId?: string;
        assignedToUserId?: string;
      } = {};
      
      if (statusFilter) {
        params.statuses = [statusFilter];
      }
      
      if (priorityFilter) {
        // Note: API doesn't support priority filtering directly, we'll filter client-side
      }
      
      if (user.role === "Maintenance Worker") {
        // TODO: Get actual user ID from user context
        params.assignedToUserId = "current_user_id";
      }

      const response = await workOrderApi.getAll(params);
      
      let workOrdersData = response.data || [];
      
      // Client-side filtering for priority and search
      if (priorityFilter) {
        workOrdersData = workOrdersData.filter((wo: WorkOrder) => wo.priority === priorityFilter);
      }
      
      if (searchTerm) {
        workOrdersData = workOrdersData.filter((wo: WorkOrder) => 
          wo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          wo.assetId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (wo.assetName && wo.assetName.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setWorkOrders(workOrdersData);
      setTotal(workOrdersData.length);
      setTotalPages(Math.ceil(workOrdersData.length / limit));
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || "Failed to fetch work orders";
      console.error("Failed to fetch work orders:", err);
      setError(message);
      setWorkOrders([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchWorkOrders();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCancel = async (workOrder: WorkOrder) => {
    setSubmitting(true);
    setError("");
    try {
      await workOrderApi.cancel(workOrder.id, "Cancelled by user");
      setSuccess("Work order cancelled successfully");
      setDeleteDialogOpen(false);
      setWorkOrderToDelete(null);
      fetchWorkOrders();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || "Failed to cancel work order";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Add fetchWorkOrders to useEffect dependencies
  useEffect(() => {
    fetchWorkOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, user.role]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatStatus = (status: WorkOrderStatus) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatPriority = (priority: WorkOrderPriority) => {
    return priority.charAt(0).toUpperCase() + priority.slice(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Work Orders</h2>
          <p className="text-slate-600">
            {user.role === "Maintenance Worker"
              ? "Viewing your assigned work orders"
              : `Manage and monitor all work orders (${total} total)`}
          </p>
        </div>
        {/* {(user.role === "Administrator" || user.role === "Maintenance Manager") && (
          <Button onClick={() => onEditWorkOrder?.("new")}>
            <Plus className="w-4 h-4 mr-2" />
            Create Work Order
          </Button>
        )} */}
      </div>

      {/* Error Alert - Show prominently at top */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex-1 min-w-64 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by title, asset, or technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="PENDING_QC">Pending QC</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="REWORK_REQUIRED">Rework Required</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter || "all"} onValueChange={(value) => setPriorityFilter(value === "all" ? "" : value)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="LOW">Low</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HIGH">High</SelectItem>
              <SelectItem value="CRITICAL">Critical</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Filter className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </div>
      </Card>

      {/* Work Orders Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600 mt-4">Loading work orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-900 font-medium mb-2">Unable to Load Work Orders</p>
            <p className="text-slate-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchWorkOrders} variant="outline">
              Try Again
            </Button>
          </div>
        ) : workOrders && workOrders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No work orders found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Title</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Asset</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Priority</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Assigned To</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Created</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workOrders?.map((workOrder) => {
                    const statusCfg = statusConfig[workOrder.status] ?? DEFAULT_STATUS;
                    const StatusIcon = statusCfg.icon;
                    return (
                      <tr key={workOrder.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-sm text-slate-900 font-medium">{workOrder.description.substring(0, 50)}...</p>
                            <p className="text-xs text-slate-500">{workOrder.workOrderType}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-900">
                          {workOrder.assetName || workOrder.assetId}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {workOrder.workOrderType}
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={`${statusCfg.bgColor} ${statusCfg.color} border-0`}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {formatStatus(workOrder.status)}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {workOrder.priority ? (
                            <Badge className={`${(priorityConfig[workOrder.priority] ?? priorityConfig.LOW).bgColor} ${(priorityConfig[workOrder.priority] ?? priorityConfig.LOW).color} border-0`}>
                              {workOrder.priority === 'CRITICAL' && <Zap className="w-3 h-3 mr-1" />}
                              {formatPriority(workOrder.priority)}
                            </Badge>
                          ) : (
                            <span className="text-sm text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          Unassigned {/* TODO: Get from assignments */}
                        </td>
                        <td className="py-3 px-4 text-sm text-slate-600">
                          {formatDate(workOrder.createdAt)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onViewWorkOrder?.(workOrder.id)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {/* {(user.role === "Administrator" || 
                              user.role === "Maintenance Manager") && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditWorkOrder?.(workOrder.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            )} */}
                            {(user.role === "ADMIN" || user.role === "MAINTENANCE_MANAGER") &&
                             workOrder.status !== "COMPLETED" && workOrder.status !== "CANCELLED" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setWorkOrderToDelete(workOrder);
                                  setDeleteDialogOpen(true);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-slate-600">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, total)} of {total} work orders
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className="w-8"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

      {/* Success Alert */}
      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200 mt-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Work Order</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the selected work order and move it to cancelled status. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setWorkOrderToDelete(null);
                setDeleteDialogOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => workOrderToDelete && handleCancel(workOrderToDelete)}
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? "Cancelling..." : "Cancel Work Order"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}