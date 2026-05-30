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
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  FileText,
  Database,
  XCircle,
  AlertTriangle,
} from "lucide-react";
import { MaintenanceRequest, Asset } from "@/types";
import { maintenanceRequestApi, assetApi } from "@/lib/api";

type MaintenanceRequestDetailPageProps = {
  requestId: string;
  onBack: () => void;
  onSuccess?: () => void;
};

const statusConfig = {
  PENDING: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  PENDING_REVIEW: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  APPROVED: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle2 },
  REJECTED: { color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle }
};

export function MaintenanceRequestDetailPage({ requestId, onBack, onSuccess }: MaintenanceRequestDetailPageProps) {
  const [request, setRequest] = useState<MaintenanceRequest | null>(null);
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Action states
  const [actionLoading, setActionLoading] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  useEffect(() => {
    fetchRequestDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestId]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const [pendingRequests, myRequests] = await Promise.all([
        maintenanceRequestApi.getPending().catch(() => []),
        maintenanceRequestApi.getMyRequests().catch(() => []),
      ]);
      const allRequests = [
        ...(Array.isArray(pendingRequests) ? pendingRequests : []),
        ...(Array.isArray(myRequests) ? myRequests : []),
      ];
      const foundRequest = allRequests.find((r: MaintenanceRequest) => r.id === requestId);

      if (!foundRequest) {
        setError('Maintenance request not found');
        return;
      }

      setRequest(foundRequest);

      // Fetch asset details
      try {
        const assetData = await assetApi.getById(foundRequest.assetId);
        setAsset(assetData);
      } catch (assetError) {
        console.warn('Could not fetch asset details:', assetError);
        // Continue without asset details
      }
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Failed to fetch request details';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = () => {
    setActionType('approve');
    setShowConfirmDialog(true);
  };

  const handleReject = () => {
    setActionType('reject');
    setRejectReason('');
    setShowConfirmDialog(true);
  };

  const handleConfirmAction = async () => {
    if (!request || !actionType) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      if (actionType === 'approve') {
        await maintenanceRequestApi.approve(request.id);
        setSuccess('Request approved successfully. An inspection work order has been created.');
      } else if (actionType === 'reject') {
        if (!rejectReason.trim()) {
          setError('Please provide a reason for rejection');
          setActionLoading(false);
          return;
        }
        await maintenanceRequestApi.reject(request.id, rejectReason.trim());
        setSuccess('Request rejected successfully.');
      }

      // Refresh the request details
      await fetchRequestDetails();
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || `Failed to ${actionType} request`;
      setError(message);
    } finally {
      setActionLoading(false);
      setShowConfirmDialog(false);
      setActionType(null);
      setRejectReason('');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const canTakeAction = request?.status === 'PENDING' || request?.status === 'PENDING_REVIEW';
  


  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 mt-4">Loading request details...</p>
      </div>
    );
  }

  if (error && !request) {
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

  if (!request) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
        <div className="text-center py-12">
          <p className="text-slate-600">Maintenance request not found</p>
        </div>
      </div>
    );
  }

  const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || Clock;
  const statusStyle = statusConfig[request.status as keyof typeof statusConfig];

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
            <h2 className="text-2xl text-slate-900 mb-1">
              Maintenance Request #{request.id.substring(0, 8)}
            </h2>
            <p className="text-slate-600">Request details and status</p>
          </div>
        </div>
        
        {/* Action Buttons for All Users */}
        {canTakeAction && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReject}
              className="inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              style={{
                borderColor: '#fca5a5',
                color: '#b91c1c',
                backgroundColor: '#ffffff'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#fef2f2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
              disabled={actionLoading}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </button>
            <button
              onClick={handleApprove}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              style={{
                backgroundColor: '#16a34a',
                borderColor: '#16a34a'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#15803d';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#16a34a';
              }}
              disabled={actionLoading}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </button>
          </div>
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
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status and Basic Info */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg text-slate-900">Request Status</h3>
              <Badge className={`${statusStyle?.bgColor} ${statusStyle?.color} border-0 px-3 py-1`}>
                <StatusIcon className="w-4 h-4 mr-2" />
                {formatStatus(request.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Request ID</p>
                <p className="text-sm text-slate-900 font-mono">{request.id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Created Date</p>
                <p className="text-sm text-slate-900">{formatDate(request.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Requested By</p>
                <p className="text-sm text-slate-900">{request.requestedBy}</p>
              </div>
              {request.reviewedBy && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Reviewed By</p>
                  <p className="text-sm text-slate-900">{request.reviewedBy}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Asset Information */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Database className="w-5 h-5" />
              Asset Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Asset ID</p>
                <p className="text-sm text-slate-900 font-mono">{request.assetId}</p>
              </div>
              {asset && (
                <>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Asset Name</p>
                    <p className="text-sm text-slate-900">{asset.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Serial Number</p>
                    <p className="text-sm text-slate-900">{asset.serialNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600 mb-1">Installation Date</p>
                    <p className="text-sm text-slate-900">{asset.installationDate}</p>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Problem Description */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Problem Description
            </h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Timeline */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timeline
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Request Created</p>
                  <p className="text-xs text-slate-500">
                    {formatDate(request.createdAt)} by {request.requestedBy}
                  </p>
                </div>
              </div>

              {request.status === 'APPROVED' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Request Approved</p>
                    <p className="text-xs text-slate-500">
                      {request.updatedAt && formatDate(request.updatedAt)} 
                      {request.reviewedBy && ` by ${request.reviewedBy}`}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      An inspection work order has been created
                    </p>
                  </div>
                </div>
              )}

              {request.status === 'REJECTED' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Request Rejected</p>
                    <p className="text-xs text-slate-500">
                      {request.updatedAt && formatDate(request.updatedAt)} 
                      {request.reviewedBy && ` by ${request.reviewedBy}`}
                    </p>
                  </div>
                </div>
              )}

              {(request.status === 'PENDING' || request.status === 'PENDING_REVIEW') && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Pending Review</p>
                    <p className="text-xs text-slate-500">
                      Waiting for approval
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Action Required (for all users) */}
          {canTakeAction && (
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                Action Required
              </h3>
              <p className="text-sm text-slate-700 mb-4">
                This maintenance request is waiting for review and approval.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApprove}
                  className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 w-full"
                  disabled={actionLoading}
                  style={{ 
                    minHeight: '40px',
                    backgroundColor: '#16a34a',
                    borderColor: '#16a34a'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#15803d';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#16a34a';
                  }}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  {actionLoading ? 'Processing...' : 'Approve Request'}
                </button>
                <button
                  onClick={handleReject}
                  className="inline-flex items-center justify-center px-4 py-3 border text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 w-full"
                  disabled={actionLoading}
                  style={{ 
                    minHeight: '40px',
                    borderColor: '#fca5a5',
                    color: '#b91c1c',
                    backgroundColor: '#ffffff'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#fef2f2';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                  }}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  {actionLoading ? 'Processing...' : 'Reject Request'}
                </button>
              </div>
            </Card>
          )}

          {/* Status Information */}
          {request.status === 'APPROVED' && (
            <Alert className="bg-green-50 text-green-900 border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                This request has been approved and an inspection work order has been created. 
                You can track the progress in the Work Orders section.
              </AlertDescription>
            </Alert>
          )}

          {request.status === 'REJECTED' && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                This request has been rejected. If you believe this was in error, 
                please contact your maintenance manager or submit a new request with additional details.
              </AlertDescription>
            </Alert>
          )}

          {(request.status === 'PENDING' || request.status === 'PENDING_REVIEW') && !canTakeAction && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                This request is pending review. 
                You will be notified once a decision has been made.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

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
            <button
              onClick={() => setShowConfirmDialog(false)}
              disabled={actionLoading}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md border focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: '#ffffff',
                borderColor: '#d1d5db',
                color: '#374151'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                }
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmAction}
              disabled={actionLoading || (actionType === 'reject' && !rejectReason.trim())}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                backgroundColor: actionType === 'approve' ? '#16a34a' : '#dc2626',
                borderColor: actionType === 'approve' ? '#16a34a' : '#dc2626'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = actionType === 'approve' ? '#15803d' : '#b91c1c';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = actionType === 'approve' ? '#16a34a' : '#dc2626';
                }
              }}
            >
              {actionLoading ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
