"use client";
import { useState } from "react";
import { WorkOrderList } from "./WorkOrderList";
import { WorkOrderDetail } from "./WorkOrderDetail";
import { WorkOrderForm } from "./WorkOrderForm";
import { WorkOrderMetrics } from "./WorkOrderMetrics";
import { UserInfo } from "@/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

type WorkOrderManagementProps = {
  user: UserInfo;
};

type ViewMode = 'list' | 'detail' | 'form';

export function WorkOrderManagement({ user }: WorkOrderManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState<string | null>(null);

  const handleViewWorkOrder = (workOrderId: string) => {
    setSelectedWorkOrderId(workOrderId);
    setViewMode('detail');
  };

  const handleEditWorkOrder = (workOrderId: string) => {
    setSelectedWorkOrderId(workOrderId);
    setViewMode('form');
  };

  const handleBackToList = () => {
    setSelectedWorkOrderId(null);
    setViewMode('list');
  };

  const handleSuccess = () => {
    // Go back to list after successful create/update
    handleBackToList();
  };

  if (viewMode === 'detail' && selectedWorkOrderId) {
    return (
      <WorkOrderDetail
        workOrderId={selectedWorkOrderId}
        user={user}
        onBack={handleBackToList}
        onEdit={handleEditWorkOrder}
      />
    );
  }

  if (viewMode === 'form') {
    return (
      <WorkOrderForm
        workOrderId={selectedWorkOrderId || undefined}
        user={user}
        onBack={handleBackToList}
        onSuccess={handleSuccess}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Work Orders</h2>
      </div>
      
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="list">All Work Orders</TabsTrigger>
          <TabsTrigger value="metrics">Metrics & Reports</TabsTrigger>
        </TabsList>
        <TabsContent value="list">
          <WorkOrderList
            user={user}
            onViewWorkOrder={handleViewWorkOrder}
            onEditWorkOrder={handleEditWorkOrder}
          />
        </TabsContent>
        <TabsContent value="metrics">
          <WorkOrderMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
}