"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Plus, ClipboardList, UserCheck } from "lucide-react";
import { UserInfo } from "@/types";
import { MaintenanceRequestForm } from "./MaintenanceRequestForm";
import { MaintenanceRequestReview } from "./MaintenanceRequestReview";
import { MaintenanceRequestDetailPage } from "./MaintenanceRequestDetailPage";

type MaintenanceRequestManagementProps = {
  user: UserInfo;
};

type ViewMode = 'list' | 'detail';

export function MaintenanceRequestManagement({ user }: MaintenanceRequestManagementProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  // All users can review requests now
  const canReview = true;
  
  // Set default tab to review for all users
  const [activeTab, setActiveTab] = useState("review");

  const handleCreateSuccess = () => {
    // Refresh any lists if needed
    console.log("Maintenance request created successfully");
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
          <div className="text-center py-12">
            <ClipboardList className="w-16 h-16 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Request Maintenance</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Submit a maintenance request when you notice equipment issues, unusual sounds, 
              leaks, or any other problems that need attention.
            </p>
            <Button onClick={() => setShowCreateForm(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Create New Request
            </Button>
          </div>
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