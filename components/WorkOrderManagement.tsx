"use client";
import { useState } from "react";
import { WorkOrderList } from "./WorkOrderList";
import { WorkOrderDetail } from "./WorkOrderDetail";
import { WorkOrderForm } from "./WorkOrderForm";
import { UserInfo } from "@/types";

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
    <WorkOrderList
      user={user}
      onViewWorkOrder={handleViewWorkOrder}
      onEditWorkOrder={handleEditWorkOrder}
    />
  );
}