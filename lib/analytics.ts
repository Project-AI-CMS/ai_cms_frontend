import axios from "axios";
import {
  PredictionRequest,
  PredictionResponse,
  PredictionResultResponse,
  DashboardResponse,
  HealthCheckResponse,
} from "@/types/analytics";

const API_ANALYTICS_URL =
  process.env.NEXT_PUBLIC_ANALYTICS_API_URL ||
  "http://localhost:8000/api/v1/analytics";

const handleApiError = (err: unknown): string => {
  const axiosError = err as {
    response?: {
      data?: { detail?: string; message?: string };
      status?: number;
    };
    message?: string;
    code?: string;
  };

  if (axiosError.code === "ECONNABORTED") {
    return "Request timeout. Please try again later.";
  }

  if (
    axiosError.code === "ERR_NETWORK" ||
    axiosError.message?.includes("Network Error")
  ) {
    return "Unable to connect to the analytics service. Please check your connection and try again.";
  }

  if (axiosError.response?.status === 404) {
    return "The requested resource was not found.";
  }

  if (axiosError.response?.status === 422) {
    const detail = axiosError.response.data?.detail;
    if (Array.isArray(detail) && detail.length > 0) {
      return `Validation error: ${detail.map((d: any) => d.msg).join(", ")}`;
    }
    return "Invalid request. Please check your input.";
  }

  if (axiosError.response?.status === 500) {
    return "Analytics service error. Please try again later.";
  }

  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }

  if (axiosError.response?.data?.detail) {
    return axiosError.response.data.detail;
  }

  return "An error occurred. Please try again.";
};

export const analyticsApi = {
  async health(): Promise<HealthCheckResponse> {
    try {
      const response = await axios.get(`${API_ANALYTICS_URL}/health`);
      return response.data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  async getDashboard(): Promise<DashboardResponse> {
    try {
      const response = await axios.get(`${API_ANALYTICS_URL}/dashboard`);
      return response.data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  async predictSingle(request: PredictionRequest): Promise<PredictionResponse> {
    try {
      const response = await axios.post(
        `${API_ANALYTICS_URL}/predict`,
        request,
      );
      return response.data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  async predictBatch(
    requests: PredictionRequest[],
  ): Promise<PredictionResponse[]> {
    try {
      const response = await axios.post(
        `${API_ANALYTICS_URL}/predict/batch`,
        requests,
      );
      return response.data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  async getLatestPrediction(
    assetId: string,
  ): Promise<PredictionResultResponse> {
    try {
      const response = await axios.get(
        `${API_ANALYTICS_URL}/predictions/${assetId}/latest`,
      );
      return response.data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },

  async getPredictionHistory(
    assetId: string,
    limit: number = 50,
  ): Promise<PredictionResultResponse[]> {
    try {
      const response = await axios.get(
        `${API_ANALYTICS_URL}/predictions/${assetId}/history`,
        { params: { limit } },
      );
      return response.data;
    } catch (err) {
      throw new Error(handleApiError(err));
    }
  },
};
