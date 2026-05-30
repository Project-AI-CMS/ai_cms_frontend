// Type definitions for the application

export type AssetStatus =
  | "operational"
  | "standby"
  | "pending_repair"
  | "under_repair"
  | "scrapped";

export type Asset = {
  id: string;
  name: string;
  serialNumber: string;
  modelNumber: string;
  parentAssetId?: string | null;
  assetTypeId: string;
  locationId: string;
  installationDate?: string;
  currentHealthScore?: number;
  currentStatus?: "HEALTHY" | "WARNING" | "CRITICAL" | "MAINTENANCE_MODE";
  lastStatusUpdate?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type AssetType = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Vendor = {
  id: string;
  name: string;
  contactPerson?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
};

export type Location = {
  id: string;
  name: string;
  description?: string;
  parentLocationId?: string | null;
  subLocations?: Location[];
  createdAt?: string;
  updatedAt?: string;
};

export type SparePart = {
  id: string;
  partNumber: string;
  name: string;
  description?: string;
  quantityOnHand: number;
  reorderThreshold: number;
  createdAt?: string;
  updatedAt?: string;
};

export type AssetTypePart = {
  id: string;
  partId: string;
  assetTypeId: string;
  quantityPerAsset: number;
  positionReference?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type UserRole =
  | "Administrator"
  | "Maintenance Manager"
  | "Maintenance Worker"
  | "Safety Officer"
  | "Viewer";

export type UserInfo = {
  id?: string;
  name: string;
  role: UserRole;
  email: string;
};

export type PaginationParams = {
  page: number;
  limit: number;
  total: number;
};

export type WorkOrderType =
  | "CORRECTIVE"
  | "PREVENTIVE"
  | "INSPECTION"
  | "REPAIR"
  | "OUTSOURCING";

export type WorkOrderStatus = 
  | "DRAFT"
  | "ASSIGNED"
  | "IN_PROGRESS" 
  | "ON_HOLD"
  | "PENDING_QC"
  | "CLOSED"
  | "CLOSED_WITH_FOLLOW_UP"
  | "OUTSOURCED_IN_PROGRESS"
  | "CANCELLED"
  | "REWORK_REQUIRED";

export type WorkOrderPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type WorkOrder = {
  id: string;
  workOrderType: WorkOrderType;
  status: WorkOrderStatus;
  priority?: WorkOrderPriority;
  assetId: string;
  assetTypeId?: string;
  assetType?: string;
  assetName?: string; // For display purposes
  description: string;
  originId?: string;
  originType?: string;
  createdAt: string;
  updatedAt: string;
  version: number;
};

export type WorkOrderTask = {
  id: string;
  workOrderId: string;
  taskName: string;
  description: string;
  sequenceOrder: number;
  status: string;
  createdAt: string;
  endedAt?: string;
  updatedAt?: string;
};

export type WorkOrderAssignment = {
  id: string;
  workOrderId: string;
  userId: string;
  userName?: string; // For display
  assignmentRole: string;
  createdAt: string;
};

export type LaborLog = {
  id: string;
  workOrderId?: string;
  assignmentId?: string;
  taskId: string;
  userId?: string;
  userName?: string; // For display
  hoursWorked: number;
  logDate?: string;
  notes?: string;
  createdAt?: string;
};

export type PartRequest = {
  id: string;
  workOrderId: string;
  taskId?: string;
  partId: string;
  partName?: string; // For display
  requestedQuantity: number;
  consumedQuantity?: number;
  status: string;
  createdAt?: string;
};

export type OutsourcingDetails = {
  id: string;
  workOrderId: string;
  vendorId: string;
  trackingEmployeeId?: string;
  estimatedCost?: number;
  actualCost?: number;
  sentToVendorAt?: string;
  returnedFromVendorAt?: string;
};

export type WorkOrderDetails = {
  workOrder: WorkOrder;
  tasks: WorkOrderTask[];
  assignments: WorkOrderAssignment[];
  partRequests: PartRequest[];
  laborLogs: LaborLog[];
  outsourcingDetails?: OutsourcingDetails[];
  activities: WorkOrderActivity[];
};

export type WorkOrderActivity = {
  id: string;
  workOrderId: string;
  taskId?: string;
  activityType: string;
  notes?: string;
  description?: string;
  metadata?: string;
  createdBy: string;
  createdByName?: string; // For display purposes
  createdAt: string;
  oldValue?: string;
  newValue?: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
};

export type MaintenanceRequestStatus =
  | "PENDING"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED";

export type MaintenanceRequest = {
  id: string;
  assetId: string;
  description: string;
  status: MaintenanceRequestStatus;
  requestedBy: string;
  reviewedBy?: string;
  createdAt: string;
  updatedAt?: string;
};

export type PlanStatusDto = {
  id: string;
  planId: string;
  planType: "ANNUAL" | "MONTHLY" | "PLAN_CHANGE";
  actionType: "DRAFT" | "PENDING_VERIFICATION" | "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  remark?: string;
  performedBy: string;
  timestamp: string;
  comments?: string;
  performedAt?: string;
};

export type MPMAnnualPlanDto = {
  id: string;
  fiscalYear: number;
  status: string;
  active: boolean;
  year?: number;
  description?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MPMMonthlyPlanDto = {
  id: string;
  planDetailsId: string;
  formanId: string;
  machineCondition?: string;
  lastMntDateFrom?: string;
  lastMntDateTo?: string;
  nextMntPlanFrom: string;
  nextMntPlanTo: string;
  remark?: string;
  status: string;
  workOrderCreated: boolean;
  annualPlanId?: string;
  month?: number;
  year?: number;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type MPMPlanDetailsDto = {
  id: string;
  annualPlanId: string;
  machineId: string;
  monthsOfMaintenance: string;
  description: string;
  plannerId: string;
  recordedAt?: string;
  maintenanceType?: string;
  estimatedDuration?: number;
  monthBreakdown?: Record<string, boolean>;
};

export type WorkOrderMetricsDto = {
  assetId: string;
  fromDate: string;
  toDate: string;
  totalWorkOrdersClosed: number;
  mttrHours: number;
  mtbfHours: number;
  workOrdersAnalyzed: Array<{
    id: string;
    createdAt: string;
    closedAt: string;
    durationHours: number;
  }>;
};

export type PlanChangeDto = {
  id: string;
  monthlyPlanId: string;
  originalSchedule?: string;
  reasonJustification: string;
  changeRequestedBy?: string;
  changeRequestedAt?: string;
  lastUpdatedAt?: string;
  status: string;
  newNextMntPlanFrom: string;
  newNextMntPlanTo: string;
};

export type MachineMaintenanceScheduleDto = {
  planDetailsId: string;
  machineId: string;
  machineName?: string;
  monthsOfMaintenance: string;
  nextMaintenanceMonth: string;
  daysUntilMaintenance: number;
  description?: string;
};
