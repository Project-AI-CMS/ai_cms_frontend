"use client";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, ClipboardList, UserCheck, RefreshCw, AlertCircle, Clock, CheckCircle2, XCircle, Calendar, FileText, Eye } from "lucide-react";
import { MaintenanceRequest, UserInfo } from "@/types";
import { maintenanceRequestApi } from "@/lib/api";
import { MaintenanceRequestForm } from "./MaintenanceRequestForm";
import { MaintenanceRequestReview } from "./MaintenanceRequestReview";
import { MaintenanceRequestDetailPage } from "./MaintenanceRequestDetailPage";

type MaintenanceRequestManagementProps = {
  user: UserInfo;
};

type ViewMode = 'list' | 'detail';

type MyMaintenanceRequestsProps = {
  refreshKey: number;
  onViewRequest: (requestId: string) => void;
  onCreateRequest: () => void;
};

const requestStatusConfig = {
  PENDING: { color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
  PENDING_REVIEW: { color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock },
  APPROVED: { color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle2 },
  REJECTED: { color: "text-red-600", bgColor: "bg-red-100", icon: XCircle },
};

function MyMaintenanceRequests({ refreshKey, onViewRequest, onCreateRequest }: MyMaintenanceRequestsProps) {
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchMyRequests = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await maintenanceRequestApi.getMyRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || "Failed to fetch your maintenance requests";
      setError(message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const formatDate = (dateString: string) => new Date(dateString).toLocaleString();
  const formatStatus = (status: string) => status.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">My Requests</h2>
          <p className="text-slate-600">Maintenance requests submitted by your account.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchMyRequests} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={onCreateRequest}>
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            <p className="text-slate-600 mt-4">Loading your requests...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">No Requests Found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              You have not submitted any maintenance requests yet.
            </p>
            <Button onClick={onCreateRequest} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create New Request
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const statusStyle = requestStatusConfig[request.status as keyof typeof requestStatusConfig] ?? requestStatusConfig.PENDING;
              const StatusIcon = statusStyle.icon;

              return (
                <Card key={request.id} className="p-4 border-l-4 border-l-yellow-400 bg-yellow-50/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-slate-900">Request #{request.id.substring(0, 8)}</h3>
                        <Badge className={`${statusStyle.bgColor} ${statusStyle.color} border-0`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {formatStatus(request.status)}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          <span>Asset: {request.assetId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{formatDate(request.createdAt)}</span>
                        </div>
                      </div>
                      <div className="bg-white rounded-lg p-3">
                        <p className="text-sm text-slate-700">
                          {request.description.length > 200 ? `${request.description.substring(0, 200)}...` : request.description}
                        </p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => onViewRequest(request.id)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

export function MaintenanceRequestManagement({ user }: MaintenanceRequestManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [requestRefreshKey, setRequestRefreshKey] = useState(0);
  
  // All users can review requests now
  const canReview = true;
  
  // Set default tab to review for all users
  const [activeTab, setActiveTab] = useState("review");

  const handleCreateSuccess = () => {
    setRequestRefreshKey((key) => key + 1);
    setActiveTab("create");
  };

  const handleViewRequest = (requestId: string) => {
    setSelectedRequestId(requestId);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setSelectedRequestId(null);
    setViewMode('list');
  };

  const handleDetailSuccess = () => {
    // Go back to list after successful action
    handleBackToList();
  };

  // Show detail page if viewing a specific request
  if (viewMode === 'detail' && selectedRequestId) {
    return (
      <MaintenanceRequestDetailPage
        requestId={selectedRequestId}
        onBack={handleBackToList}
        onSuccess={handleDetailSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Maintenance Requests</h2>
          <p className="text-slate-600">
            Submit and manage maintenance requests for equipment issues
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Request
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className={`grid w-full ${canReview ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <ClipboardList className="w-4 h-4" />
            My Requests
          </TabsTrigger>
          {canReview && (
            <TabsTrigger value="review" className="flex items-center gap-2">
              <UserCheck className="w-4 h-4" />
              Review Requests
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="create" className="mt-6">
          <MyMaintenanceRequests
            refreshKey={requestRefreshKey}
            onViewRequest={handleViewRequest}
            onCreateRequest={() => setShowCreateForm(true)}
          />
        </TabsContent>

        {canReview && (
          <TabsContent value="review" className="mt-6">
            <MaintenanceRequestReview user={user} onViewRequest={handleViewRequest} />
          </TabsContent>
        )}
      </Tabs>

      {/* Create Form Modal */}
      <MaintenanceRequestForm
        user={user}
        open={showCreateForm}
        onOpenChange={setShowCreateForm}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
