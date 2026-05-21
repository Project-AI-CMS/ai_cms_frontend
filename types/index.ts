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
  | "INSPECTION"
  | "REPAIR" 
  | "PREVENTIVE"
  | "OUTSOURCING";

export type WorkOrderStatus = 
  | "DRAFT"
  | "NEW"
  | "ASSIGNED"
  | "IN_PROGRESS" 
  | "ON_HOLD"
  | "PENDING_QC"
  | "COMPLETED"
  | "CANCELLED"
  | "REWORK_REQUIRED";

export type WorkOrderPriority = 
  | "LOW"
  | "MEDIUM" 
  | "HIGH"
  | "CRITICAL";

export type WorkOrder = {
  id: string;
  workOrderType: WorkOrderType;
  status: WorkOrderStatus;
  priority?: WorkOrderPriority;
  assetId: string;
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
  updatedAt: string;
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
  workOrderId: string;
  taskId: string;
  userId: string;
  userName?: string; // For display
  hoursWorked: number;
  notes?: string;
  createdAt: string;
};

export type PartRequest = {
  id: string;
  workOrderId: string;
  taskId?: string;
  partId: string;
  partName?: string; // For display
  requestedQuantity: number;
  status: string;
  createdAt: string;
};

export type WorkOrderDetails = {
  workOrder: WorkOrder;
  tasks: WorkOrderTask[];
  assignments: WorkOrderAssignment[];
  partRequests: PartRequest[];
  laborLogs: LaborLog[];
  outsourcingDetails?: any;
  activities: WorkOrderActivity[];
};

export type WorkOrderActivity = {
  id: string;
  workOrderId: string;
  activityType: "comment" | "status_change" | "assignment" | "completion";
  description: string;
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
  planType: "ANNUAL" | "MONTHLY";
  actionType: "VERIFY" | "APPROVE" | "CONFIRM" | "REJECT" | "OTHER";
  comments?: string;
  performedBy: string;
  performedAt: string;
};

export type MPMAnnualPlanDto = {
  id: string;
  year: number;
  description: string;
  isActive: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type MPMMonthlyPlanDto = {
  id: string;
  annualPlanId: string;
  month: number;
  year: number;
  description: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type MPMPlanDetailsDto = {
  id: string;
  annualPlanId: string;
  machineId: string;
  description: string;
  maintenanceType: string;
  estimatedDuration: number;
  plannerId: string;
  monthBreakdown?: Record<string, boolean>;
};

export type WorkOrderMetricsDto = {
  assetId: string;
  mttr: number;
  mtbf: number;
  totalBreakdowns: number;
  periodStart: string;
  periodEnd: string;
};
