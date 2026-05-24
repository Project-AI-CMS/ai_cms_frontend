export interface PredictionRequest {
  asset_id: string;
  asset_type: string;
  features: number[];
}

export interface PredictionResponse {
  asset_id: string;
  status: string;
  health_score_or_class: string;
  confidence: number;
  prediction_id?: string | null;
}

export interface PredictionResultResponse {
  prediction_id: string;
  asset_id: string;
  asset_type: string;
  status: string;
  health_score_or_class: string;
  confidence: number;
  predicted_at: string;
}

export interface DashboardResponse {
  totalPredictions: number;
  healthyCount: number;
  warningCount: number;
  criticalCount: number;
  lastUpdated?: string | null;
}

export interface HealthCheckResponse {
  status: string;
  message?: string;
  timestamp?: string;
}

export const ASSET_TYPE_FEATURE_COUNTS = {
  hydraulic_valve: 8,
  water_pump: 52,
  battery: 5,
  bearing: 28,
} as const;

export const ASSET_TYPES = Object.keys(ASSET_TYPE_FEATURE_COUNTS) as Array<
  keyof typeof ASSET_TYPE_FEATURE_COUNTS
>;

export const STATUS_COLORS = {
  healthy: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
} as const;

export const STATUS_BADGE_COLORS = {
  healthy: "text-green-600 bg-green-50",
  warning: "text-yellow-600 bg-yellow-50",
  critical: "text-red-600 bg-red-50",
} as const;
