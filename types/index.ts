// Type definitions for the application

export type AssetStatus = 'operational' | 'standby' | 'pending_repair' | 'under_repair' | 'scrapped';

export type Asset = {
  id: string;
  name: string;
  model_number: string;
  serial_number: string;
  asset_type_id: string;
  location_id: string;
  parent_asset_id: string | null;
  installation_date: string;
  current_health_score: number;
  current_status: AssetStatus;
  manufacturer?: string;
  rated_power?: string;
  service_life?: string;
  created_at?: string;
  updated_at?: string;
};

export type AssetType = {
  id: string;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
};

export type Location = {
  id: string;
  name: string;
  description?: string;
  parent_location_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SparePart = {
  id: string;
  part_number: string;
  name: string;
  description?: string;
  quantity_on_hand: number;
  reorder_threshold: number;
  unit_cost?: number;
  supplier?: string;
  created_at?: string;
  updated_at?: string;
};

export type AssetTypePart = {
  id: string;
  part_id: string;
  asset_type_id: string;
  quantity_per_asset: number;
  position_reference?: string;
  created_at?: string;
  updated_at?: string;
};

export type UserRole = 'Administrator' | 'Maintenance Manager' | 'Maintenance Worker' | 'Safety Officer' | 'Viewer';

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
