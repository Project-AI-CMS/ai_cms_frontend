"use client";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Label } from "./ui/label";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Calendar,
  FileText,
  Eye,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { MaintenanceRequest, UserInfo } from "@/types";
import { maintenanceRequestApi } from "@/lib/api";
import { MaintenanceRequestDetail } from "./MaintenanceRequestDetail";

type MaintenanceRequestReviewProps = {
  user: UserInfo;
  onViewRequest?: (requestId: string) => void;
};

const statusConfig = {
  PENDING: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  PENDING_REVIEW: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  APPROVED: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle2 },
  REJECTED: { color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle }
};

const normalizeStatus = (status?: string | null) =>
  String(status || "")
    .trim()
    .replace(/[-\s]+/g, "_")
    .toUpperCase();

const isPendingRequest = (request: MaintenanceRequest) => {
  const status = normalizeStatus(request.status);
  return status === "PENDING" || status === "PENDING_REVIEW";
};

export function MaintenanceRequestReview({ user, onViewRequest }: MaintenanceRequestReviewProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Detail view state
  const [detailRequest, setDetailRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await maintenanceRequestApi.getPending();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to fetch maintenance requests';
      setError(message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setActionType('approve');
    setShowConfirmDialog(true);
  };

  const handleReject = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setActionType('reject');
    setRejectReason('');
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedRequest || !actionType) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (actionType === 'approve') {
        await maintenanceRequestApi.approve(selectedRequest.id);
        setSuccess(`Request #${selectedRequest.id.substring(0, 8)} approved successfully. An inspection work order has been created.`);
      } else if (actionType === 'reject') {
        if (!rejectReason.trim()) {
          setError('Please provide a reason for rejection');
          setActionLoading(false);
          return;
        }
        await maintenanceRequestApi.reject(selectedRequest.id, rejectReason.trim());
        setSuccess(`Request #${selectedRequest.id.substring(0, 8)} rejected successfully.`);
      }

      // Refresh the list
      await fetchPendingRequests();
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || `Failed to ${actionType} request`;
      setError(message);
    } finally {
      setActionLoading(false);
      setShowConfirmDialog(false);
      setSelectedRequest(null);
      setActionType(null);
      setRejectReason('');
    }
  };

  const handleViewDetails = (request: MaintenanceRequest) => {
    setDetailRequest(request);
    setShowDetailDialog(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Role restriction removed - all users can review requests

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Maintenance Request Review</h2>
          <p className="text-slate-600">
            Review and approve maintenance requests from users
          </p>
        </div>
        <Button onClick={fetchPendingRequests} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary */}
      {requests.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 bg-yellow-50 border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-800">{requests.filter(isPendingRequest).length}</p>
                <p className="text-sm text-yellow-600">Pending Review</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-green-50 border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-800">{requests.filter(r => normalizeStatus(r.status) === 'APPROVED').length}</p>
                <p className="text-sm text-green-600">Approved Today</p>
              </div>
            </div>
          </Card>
          <Card className="p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-red-800">{requests.filter(r => normalizeStatus(r.status) === 'REJECTED').length}</p>
                <p className="text-sm text-red-600">Rejected Today</p>
              </div>
            </div>
          </Card>
        </div>
      )}

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

      {/* Requests List */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600 mt-4">Loading maintenance requests...</p>
          </div>
        ) : error && requests.length === 0 ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-900 font-medium mb-2">Unable to Load Requests</p>
            <p className="text-slate-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchPendingRequests} variant="outline">
              Try Again
            </Button>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-slate-900 font-medium mb-2">All Caught Up!</p>
            <p className="text-slate-600">No pending maintenance requests to review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const normalizedStatus = normalizeStatus(request.status);
              const StatusIcon = statusConfig[normalizedStatus as keyof typeof statusConfig]?.icon || Clock;
              const statusStyle = statusConfig[normalizedStatus as keyof typeof statusConfig] ?? statusConfig.PENDING;
              
              return (
                <Card key={request.id} className={`p-4 border-l-4 ${
                  isPendingRequest(request)
                    ? 'border-l-yellow-400 bg-yellow-50/30' 
                    : 'border-l-gray-300'
                }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-slate-900">
                          Request #{request.id.substring(0, 8)}
                        </h3>
                        <Badge className={`${statusStyle?.bgColor} ${statusStyle?.color} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {formatStatus(request.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <User className="w-4 h-4" />
                          <span>Requested by: {request.requestedBy}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <FileText className="w-4 h-4" />
                          <span>Asset: {request.assetId}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(request.createdAt)}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 rounded-lg p-3 mb-4">
                        <p className="text-sm text-slate-700">
                          {request.description.length > 200 
                            ? `${request.description.substring(0, 200)}...` 
                            : request.description}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isPendingRequest(request) ? (
                    <div className="bg-white border border-yellow-200 rounded-lg p-3 mt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-yellow-600" />
                          <span className="text-sm font-medium text-yellow-800">Action Required</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewRequest ? onViewRequest(request.id) : handleViewDetails(request)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            {onViewRequest ? 'View Details' : 'View Details'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleReject(request)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            disabled={actionLoading}
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(request)}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={actionLoading}
                          >
                            <CheckCircle2 className="w-4 h-4 mr-2" />
                            Approve
                          </Button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-end gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewRequest ? onViewRequest(request.id) : handleViewDetails(request)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === 'approve' 
                ? 'This will approve the maintenance request and create an inspection work order.'
                : 'This will reject the maintenance request. Please provide a reason below.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>

          {actionType === 'reject' && (
            <div className="py-4">
              <Label htmlFor="rejectReason">Reason for Rejection *</Label>
              <Textarea
                id="rejectReason"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Please explain why this request is being rejected..."
                rows={3}
                className="mt-2"
              />
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={actionLoading}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmAction}
              disabled={actionLoading || (actionType === 'reject' && !rejectReason.trim())}
              className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {actionLoading ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Detail Dialog */}
      {detailRequest && (
        <MaintenanceRequestDetail
          request={detailRequest}
          user={user}
          open={showDetailDialog}
          onOpenChange={setShowDetailDialog}
        />
      )}
    </div>
  );
}
