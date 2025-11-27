"use client";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Clock,
  User,
  Calendar,
  FileText,
  Database,
} from "lucide-react";
import { MaintenanceRequest, UserInfo } from "@/types";

type MaintenanceRequestDetailProps = {
  request: MaintenanceRequest;
  user: UserInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const statusConfig = {
  PENDING_REVIEW: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', icon: Clock },
  APPROVED: { color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle2 },
  REJECTED: { color: 'text-red-600', bgColor: 'bg-red-100', icon: AlertCircle }
};

export function MaintenanceRequestDetail({ request, user, open, onOpenChange }: MaintenanceRequestDetailProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const StatusIcon = statusConfig[request.status as keyof typeof statusConfig]?.icon || Clock;
  const statusStyle = statusConfig[request.status as keyof typeof statusConfig];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Maintenance Request #{request.id.substring(0, 8)}</DialogTitle>
          <DialogDescription>
            Request details and current status
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <Badge className={`${statusStyle?.bgColor} ${statusStyle?.color} border-0 px-3 py-1`}>
              <StatusIcon className="w-4 h-4 mr-2" />
              {formatStatus(request.status)}
            </Badge>
            {request.status === 'PENDING_REVIEW' && (
              <span className="text-sm text-slate-600">Waiting for manager review</span>
            )}
          </div>

          {/* Request Information */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Request Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600 mb-1">Request ID</p>
                <p className="text-sm text-slate-900 font-mono">{request.id}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Asset ID</p>
                <p className="text-sm text-slate-900 font-mono">{request.assetId}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Requested By</p>
                <p className="text-sm text-slate-900">{request.requestedBy}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600 mb-1">Created Date</p>
                <p className="text-sm text-slate-900">{formatDate(request.createdAt)}</p>
              </div>
              {request.reviewedBy && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Reviewed By</p>
                  <p className="text-sm text-slate-900">{request.reviewedBy}</p>
                </div>
              )}
              {request.updatedAt && request.updatedAt !== request.createdAt && (
                <div>
                  <p className="text-sm text-slate-600 mb-1">Last Updated</p>
                  <p className="text-sm text-slate-900">{formatDate(request.updatedAt)}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Problem Description */}
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">Problem Description</h3>
            <div className="bg-slate-50 rounded-lg p-4">
              <p className="text-slate-700 whitespace-pre-wrap">{request.description}</p>
            </div>
          </Card>

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
                    <AlertCircle className="w-4 h-4 text-red-600" />
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

              {request.status === 'PENDING_REVIEW' && (
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Pending Review</p>
                    <p className="text-xs text-slate-500">
                      Waiting for maintenance manager approval
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Status-specific Information */}
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
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This request has been rejected. If you believe this was in error, 
                please contact your maintenance manager or submit a new request with additional details.
              </AlertDescription>
            </Alert>
          )}

          {request.status === 'PENDING_REVIEW' && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Your request is being reviewed by the maintenance team. 
                You will be notified once a decision has been made.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}