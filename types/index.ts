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
  modelNumber: string;
  serialNumber: string;
  assetTypeId: string;
  locationId: string;
  parentAssetId: string | null;
  installationDate: string;
  currentHealthScore: number;
  currentStatus: AssetStatus;
  manufacturer?: string;
  ratedPower?: string;
  serviceLife?: string;
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

export type Location = {
  id: string;
  name: string;
  description?: string;
  parent_location_id?: string | null;
  parentLocationId?: string | null;
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
  unit_cost?: number;
  supplier?: string;
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
