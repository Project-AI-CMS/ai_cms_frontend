// API Service Layer for M2 Backend Integration
// This is a mock implementation that simulates API calls
// Replace with actual API endpoints when backend is ready

import axios from "axios";
import {
  Asset,
  AssetType,
  SparePart,
  AssetTypePart,
  Vendor,
  UserRole,
  WorkOrderType,
  WorkOrderStatus,
  WorkOrderPriority,
} from "@/types";

const API_ASSET_URL =
  process.env.NEXT_PUBLIC_ASSET_API_URL || "http://localhost:8001/api";
const API_WORK_ORDER_URL =
  process.env.NEXT_PUBLIC_WORK_ORDER_API_URL || "http://localhost:8002/api";

const API_BASE_URL = API_ASSET_URL;
// Configure axios defaults
axios.defaults.timeout = 10000; // 10 second timeout

// Add interceptor synchronously so child components' useEffects have it
axios.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("ai_cms_access_token") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Simulate API delay
// const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Asset API
/*
  The original `assetApi` used mock data for development and has been
  commented out below. The new implementation (following this comment)
  uses axios to call the real backend at `API_BASE_URL`.

  Keep the same method names and signatures to avoid breaking callers.
*/

/* export const assetApi = {
  // ... original mock implementation (commented out)
}; */

export const assetApi = {
  async getAll(params?: {
    assetTypeId?: string;
    locationId?: string;
    status?: string;
  }) {
    try {
      const response = await axios.get(`${API_BASE_URL}/assets`, {
        params: {
          assetTypeId: params?.assetTypeId,
          locationId: params?.locationId,
          status: params?.status,
        },
      });
      // Expecting backend to return { data: [...], pagination: { ... } }
      const resp = response.data;
      if (resp && (resp.data || Array.isArray(resp))) {
        return resp;
      }
      // Fallback: wrap array responses
      return {
        data: resp,
        pagination: {
          page: 1,
          limit: Array.isArray(resp) ? resp.length : 0,
          total: Array.isArray(resp) ? resp.length : 0,
          totalPages: 1,
        },
      };
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to fetch assets";

      if (axiosError.code === "ECONNABORTED") {
        message = "Request timeout. Please try again later.";
      } else if (
        axiosError.code === "ERR_NETWORK" ||
        axiosError.message?.includes("Network Error")
      ) {
        message =
          "Unable to connect to the server. Please check your connection and try again.";
      } else if (axiosError.response?.status === 404) {
        message = "The requested resource was not found.";
      } else if (axiosError.response?.status === 500) {
        message = "Server error. Please try again later.";
      } else if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      // Log error details for debugging (only in development)
      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_BASE_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async getById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assets/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch asset";
      throw new Error(message);
    }
  },

  async create(asset: Omit<Asset, "id" | "createdAt" | "updatedAt">) {
    try {
      const response = await axios.post(`${API_BASE_URL}/assets`, asset);
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to create asset";
      throw new Error(message);
    }
  },

  async update(id: string, asset: Partial<Asset>) {
    try {
      const { name, modelNumber, locationId, installationDate } = asset;
      const response = await axios.put(
        `${API_BASE_URL}/assets/${encodeURIComponent(id)}`,
        { name, modelNumber, locationId, installationDate },
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to update asset";
      throw new Error(message);
    }
  },

  async delete(id: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/assets/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to delete asset";
      throw new Error(message);
    }
  },

  async getHierarchy() {
    try {
      const response = await axios.get(`${API_BASE_URL}/assets/hierarchies`);
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch asset hierarchy";
      throw new Error(message);
    }
  },

  async getHierarchyById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assets/${encodeURIComponent(id)}/hierarchy`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch asset hierarchy";
      throw new Error(message);
    }
  },

  async updateHierarchy(id: string, parentId: string | null) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/assets/${encodeURIComponent(id)}/hierarchy`,
        { parentAssetId: parentId },
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to update asset hierarchy";
      throw new Error(message);
    }
  },

  async updateHealth(id: string, data: { healthScore: number; status: "HEALTHY" | "WARNING" | "CRITICAL" | "MAINTENANCE_MODE" }) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/assets/internal/${encodeURIComponent(id)}/health`,
        data,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to update asset health";
      throw new Error(message);
    }
  },

  async getInternalById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assets/internal/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch internal asset";
      throw new Error(message);
    }
  },

  async getBySerialNumber(serialNumber: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assets/by-serial/${encodeURIComponent(serialNumber)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Asset not found by serial number";
      throw new Error(message);
    }
  },
};

// Asset Type API
export const assetTypeApi = {
  async getAll() {
    try {
      const response = await axios.get(`${API_BASE_URL}/asset-types`);
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch asset types";
      throw new Error(message);
    }
  },

  async getById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/asset-types/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Asset type not found";
      throw new Error(message);
    }
  },

  async getByName(name: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/asset-types/by-name`, {
        params: { name },
      });
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Asset type not found";
      throw new Error(message);
    }
  },

  async create(assetType: Omit<AssetType, "id" | "createdAt" | "updatedAt">) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/asset-types`,
        assetType,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to create asset type";
      throw new Error(message);
    }
  },

  async update(id: string, assetType: Partial<AssetType>) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/asset-types/${encodeURIComponent(id)}`,
        assetType,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to update asset type";
      throw new Error(message);
    }
  },

  async delete(id: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/asset-types/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to delete asset type";
      throw new Error(message);
    }
  },
};

// Location API
export const locationApi = {
  async getAll() {
    try {
      const response = await axios.get(`${API_BASE_URL}/locations`);
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch locations";
      throw new Error(message);
    }
  },

  async getById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/locations/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Location not found";
      throw new Error(message);
    }
  },

  async getHierarchyById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/locations/${encodeURIComponent(id)}/hierarchy`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch location hierarchy";
      throw new Error(message);
    }
  },

  async getHierarchies() {
    try {
      const response = await axios.get(`${API_BASE_URL}/locations/hierarchies`);
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch location hierarchies";
      throw new Error(message);
    }
  },

  async create(location: {
    name: string;
    description?: string;
    parentLocationId?: string | null;
  }) {
    try {
      const response = await axios.post(`${API_BASE_URL}/locations`, location);
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to create location";
      throw new Error(message);
    }
  },

  async update(
    id: string,
    location: {
      name?: string;
      description?: string;
      parentLocationId?: string | null;
    },
  ) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/locations/${encodeURIComponent(id)}`,
        location,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to update location";
      throw new Error(message);
    }
  },

  async delete(id: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/locations/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to delete location";
      throw new Error(message);
    }
  },
};

// Spare Part API
export const sparePartApi = {
  async getAll() {
    try {
      const response = await axios.get(`${API_BASE_URL}/spare-parts`);
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch spare parts";
      throw new Error(message);
    }
  },

  async getById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/spare-parts/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Spare part not found";
      throw new Error(message);
    }
  },

  async create(sparePart: Omit<SparePart, "id" | "createdAt" | "updatedAt">) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/spare-parts`,
        sparePart,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to create spare part";
      throw new Error(message);
    }
  },

  async update(id: string, sparePart: Partial<SparePart>) {
    try {
      const { name, description, reorderThreshold } = sparePart;
      const response = await axios.put(
        `${API_BASE_URL}/spare-parts/${encodeURIComponent(id)}`,
        { name, description, reorderThreshold },
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to update spare part";
      throw new Error(message);
    }
  },

  async delete(id: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/spare-parts/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to delete spare part";
      throw new Error(message);
    }
  },

  async adjustStock(id: string, adjustment: { changeInQuantity: number; notes?: string }) {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/spare-parts/${encodeURIComponent(id)}/stock`,
        adjustment
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Failed to adjust stock";
      throw new Error(message);
    }
  },

  async getInternalById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/spare-parts/internal/${encodeURIComponent(id)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch internal spare part";
      throw new Error(message);
    }
  },

  async adjustStockInternal(id: string, adjustment: { changeInQuantity: number; notes?: string }) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/spare-parts/internal/${encodeURIComponent(id)}/stock`,
        adjustment,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to adjust internal stock";
      throw new Error(message);
    }
  },
};

// Vendor API
export const vendorApi = {
  async getAll() {
    try {
      const response = await axios.get(`${API_BASE_URL}/vendors`);
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Failed to fetch vendors";
      throw new Error(message);
    }
  },

  async getById(id: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/vendors/${encodeURIComponent(id)}`);
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Vendor not found";
      throw new Error(message);
    }
  },

  async create(vendor: Omit<Vendor, "id">) {
    try {
      const response = await axios.post(`${API_BASE_URL}/vendors`, vendor);
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Failed to create vendor";
      throw new Error(message);
    }
  },

  async update(id: string, vendor: Partial<Vendor>) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/vendors/${encodeURIComponent(id)}`,
        vendor
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Failed to update vendor";
      throw new Error(message);
    }
  },

  async delete(id: string) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/vendors/${encodeURIComponent(id)}`);
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message ||
        (err as any)?.message ||
        "Failed to delete vendor";
      throw new Error(message);
    }
  },
};

// Asset Type Parts API (Many-to-Many)
export const assetTypePartApi = {
  async getAll() {
    try {
      const response = await axios.get(`${API_BASE_URL}/boms`);
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch asset type parts";
      throw new Error(message);
    }
  },

  async getByAssetType(assetTypeId: string) {
    try {
      // Common REST pattern: /asset-types/:id/parts
      const response = await axios.get(
        `${API_BASE_URL}/boms/asset-types/${encodeURIComponent(assetTypeId)}/compatible-parts`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch mappings for asset type";
      throw new Error(message);
    }
  },

  async create(mapping: Omit<AssetTypePart, "id" | "createdAt" | "updatedAt">) {
    try {
      const response = await axios.post(`${API_BASE_URL}/boms`, mapping);
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to create mapping";
      throw new Error(message);
    }
  },

  async getAssetTypesByPart(partId: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/boms/parts/${encodeURIComponent(partId)}/asset-types`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to fetch asset types using part";
      throw new Error(message);
    }
  },

  async delete(assetTypeId: string, partId: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/boms/asset-types/${encodeURIComponent(
          assetTypeId,
        )}/parts/${encodeURIComponent(partId)}`,
      );
      return response.data;
    } catch (err: unknown) {
      const message =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as { message?: string })?.message ||
        "Failed to delete mapping";
      throw new Error(message);
    }
  },
};

type ApiErrorLike = {
  response?: { data?: { message?: string }; status?: number };
  message?: string;
  code?: string;
};

const getApiErrorMessage = (err: unknown, fallback: string): string => {
  const axiosError = err as ApiErrorLike;
  return axiosError.response?.data?.message || axiosError.message || fallback;
};

type CreateAssignmentPayload = { userId: string; assignmentRole?: string };
type CreateTaskPayload = { taskName: string; description?: string; sequenceOrder?: number };
type CreatePartRequestPayload = { taskId?: string; partId: string; requestedQuantity: number };
type CreateLaborLogPayload = { taskId: string; hoursWorked: number; logDate?: string; notes?: string };

// Work Order API
export const workOrderApi = {
  async getAll(params?: {
    statuses?: string[];
    workOrderTypes?: string[];
    assetId?: string;
    assignedToUserId?: string;
  }) {
    try {
      const queryParams = new URLSearchParams();
      if (params?.statuses?.length) {
        params.statuses.forEach((status) =>
          queryParams.append("statuses", status),
        );
      }
      if (params?.workOrderTypes?.length) {
        params.workOrderTypes.forEach((type) =>
          queryParams.append("workOrderTypes", type),
        );
      }
      if (params?.assetId) {
        queryParams.append("assetId", params.assetId);
      }
      if (params?.assignedToUserId) {
        queryParams.append("assignedToUserId", params.assignedToUserId);
      }

      const url = `${API_WORK_ORDER_URL}/work-orders${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await axios.get(url);

      // API returns array directly
      return {
        data: response.data || [],
        pagination: {
          page: 1,
          limit: response.data?.length || 0,
          total: response.data?.length || 0,
          totalPages: 1,
        },
      };
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to fetch work orders";

      if (axiosError.code === "ECONNABORTED") {
        message = "Request timeout. Please try again later.";
      } else if (
        axiosError.code === "ERR_NETWORK" ||
        axiosError.message?.includes("Network Error")
      ) {
        message =
          "Unable to connect to the server. Please check your connection and try again.";
      } else if (axiosError.response?.status === 404) {
        message = "The requested resource was not found.";
      } else if (axiosError.response?.status === 500) {
        message = "Server error. Please try again later.";
      } else if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async getById(id: string) {
    try {
      const response = await axios.get(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(id)}`,
      );
      return response.data; // Returns WorkOrderDetails
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to fetch work order";

      if (axiosError.response?.status === 404) {
        message = "Work order not found.";
      } else if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  // Work orders are created from maintenance requests or plans, not directly
  async createFromPlan(data: {
    monthlyPlanId: string;
    assignments: CreateAssignmentPayload[];
  }) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/from-plan`,
        data,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to create work order from plan";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async create() {
    throw new Error(
      "Direct work order creation is not supported by the Work Order Service. Create work orders by approving maintenance requests or generating them from monthly plans.",
    );
  },

  async update(id: string, data: { description?: string; priority?: string }) {
    try {
      const response = await axios.patch(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(id)}`,
        data,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to update work order";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async hold(id: string, data: { reason: string }) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(id)}/hold`,
        data,
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to place work order on hold"));
    }
  },

  async resume(id: string) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(id)}/resume`,
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to resume work order"));
    }
  },

  async getMetrics(assetId: string, from: string, to: string) {
    try {
      const response = await axios.get(
        `${API_WORK_ORDER_URL}/work-orders/reports/metrics`,
        { params: { assetId, from, to } }
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch work order metrics"));
    }
  },

  async cancel(id: string, reason: string) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(id)}/cancel`,
        { reason },
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to cancel work order";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async complete(id: string, data: { faultFound: boolean; notes?: string }) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(id)}/complete`,
        data,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to complete work order";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async submitInspectionResults(
    id: string,
    data: { findings: string; recommendation: string },
  ) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(
          id,
        )}/inspection-results`,
        data,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to submit inspection results";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async approveOutsourcing(
    id: string,
    data: { vendorId: string; estimatedCost: number },
  ) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(
          id,
        )}/approve-outsourcing`,
        data,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to approve outsourcing";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async submitQualityReview(
    id: string,
    data: { isApproved: boolean; comment: string },
  ) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(
          id,
        )}/quality-review`,
        data,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to submit quality review";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  // Task Management
  async addTask(
    workOrderId: string,
    task: CreateTaskPayload,
  ) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(
          workOrderId,
        )}/tasks`,
        task,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to add task";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async updateTask(taskId: string, data: { taskName?: string; description?: string; sequenceOrder?: number }) {
    try {
      const response = await axios.patch(
        `${API_WORK_ORDER_URL}/work-orders/tasks/${encodeURIComponent(taskId)}`,
        data,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to update task";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async updateTaskStatus(taskId: string, newStatus: string) {
    try {
      const response = await axios.patch(
        `${API_WORK_ORDER_URL}/work-orders/tasks/${encodeURIComponent(
          taskId,
        )}/status`,
        { newStatus },
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to update task status";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  // Assignment Management
  async addAssignment(
    workOrderId: string,
    assignment: CreateAssignmentPayload,
  ) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(
          workOrderId,
        )}/assignments`,
        assignment,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to add assignment";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async removeAssignment(assignmentId: string) {
    try {
      await axios.delete(
        `${API_WORK_ORDER_URL}/work-orders/assignments/${encodeURIComponent(
          assignmentId,
        )}`,
      );
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to remove assignment";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  // Labor Logging
  async logLabor(
    workOrderId: string,
    laborLog: CreateLaborLogPayload,
  ) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(
          workOrderId,
        )}/labor-logs`,
        laborLog,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to add labor log";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  // Parts Management
  async requestParts(workOrderId: string, partRequests: CreatePartRequestPayload[]) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/work-orders/${encodeURIComponent(
          workOrderId,
        )}/parts-requests`,
        partRequests,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to request parts";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async updatePartRequestStatus(partRequestId: string, newStatus: string) {
    try {
      const response = await axios.patch(
        `${API_WORK_ORDER_URL}/work-orders/parts-requests/${encodeURIComponent(
          partRequestId,
        )}/status`,
        { newStatus },
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to update part request status";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

};

// Maintenance Request API
export const maintenanceRequestApi = {
  async create(request: {
    assetId: string;
    description: string;
    requestedBy: string;
  }) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/maintenance-requests`,
        request,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to create maintenance request";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_BASE_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async getPending() {
    try {
      const response = await axios.get(
        `${API_WORK_ORDER_URL}/maintenance-requests/pending`,
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to fetch pending maintenance requests";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async getMyRequests() {
    try {
      const response = await axios.get(
        `${API_WORK_ORDER_URL}/maintenance-requests/my`,
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch your maintenance requests"));
    }
  },

  async approve(requestId: string) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/maintenance-requests/${encodeURIComponent(
          requestId,
        )}/approve`,
      );
      return response.data; // Returns the newly created WorkOrder
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to approve maintenance request";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },

  async reject(requestId: string, reason: string) {
    try {
      const response = await axios.post(
        `${API_WORK_ORDER_URL}/maintenance-requests/${encodeURIComponent(
          requestId,
        )}/reject`,
        { reason },
      );
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to reject maintenance request";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },
};

// Users API
export const userApi = {
  async getAll(params?: { role?: UserRole }) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/users`, {
        params,
      });
      return response.data;
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string }; status?: number };
        message?: string;
        code?: string;
      };

      let message = "Failed to fetch users";

      if (axiosError.response?.data?.message) {
        message = axiosError.response.data.message;
      } else if (axiosError.message && !axiosError.message.includes("http")) {
        message = axiosError.message;
      }

      if (process.env.NODE_ENV === "development") {
        console.error("API Error:", { url: API_WORK_ORDER_URL, error: err });
      }
      throw new Error(message);
    }
  },
};

// Maintenance Planning API
export const maintenancePlanningApi = {
  async getAllAnnualPlans() {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/annual-plans`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch annual plans"));
    }
  },

  async getAnnualPlanById(id: string) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/annual-plans/${encodeURIComponent(id)}`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch annual plan"));
    }
  },

  async createAnnualPlan(data: { fiscalYear: number; status?: string; active?: boolean }) {
    try {
      const response = await axios.post(`${API_WORK_ORDER_URL}/maintenance-planning/annual-plans`, data);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to create annual plan"));
    }
  },

  async activateAnnualPlan(id: string) {
    try {
      const response = await axios.post(`${API_WORK_ORDER_URL}/maintenance-planning/annual-plans/${encodeURIComponent(id)}/activate`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to activate annual plan"));
    }
  },

  async deactivateAnnualPlan(id: string) {
    try {
      const response = await axios.post(`${API_WORK_ORDER_URL}/maintenance-planning/annual-plans/${encodeURIComponent(id)}/deactivate`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to deactivate annual plan"));
    }
  },

  async getAllMonthlyPlans() {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/monthly-plans`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch monthly plans"));
    }
  },

  async getMonthlyPlanById(id: string) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/monthly-plans/${encodeURIComponent(id)}`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch monthly plan"));
    }
  },

  async getMonthlyPlansByForman(formanId: string) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/monthly-plans/forman/${encodeURIComponent(formanId)}`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch foreman monthly plans"));
    }
  },

  async getMonthlyPlansByConfirmedBy(confirmedById: string) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/monthly-plans/confirmed-by/${encodeURIComponent(confirmedById)}`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch confirmed monthly plans"));
    }
  },

  async getMonthlyPlansByAnnualPlan(annualPlanId: string) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/monthly-plans/annual-plan/${encodeURIComponent(annualPlanId)}`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch annual plan monthly plans"));
    }
  },

  async createMonthlyPlan(data: {
    planDetailsId: string;
    formanId: string;
    machineCondition?: string;
    remark?: string;
    nextMntPlanFrom: string;
    nextMntPlanTo: string;
  }) {
    try {
      const response = await axios.post(`${API_WORK_ORDER_URL}/maintenance-planning/monthly-plans`, data);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to create monthly plan"));
    }
  },

  async requestMonthlyPlanScheduleChange(data: {
    monthlyPlanId: string;
    newNextMntPlanFrom: string;
    newNextMntPlanTo: string;
    reasonJustification: string;
    changeRequestedBy?: string;
  }) {
    try {
      const response = await axios.post(`${API_WORK_ORDER_URL}/maintenance-planning/monthly-plans/request-schedule-change`, data);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to request schedule change"));
    }
  },

  async searchPlanDetails(params: {
    id?: string;
    annualPlanId?: string;
    plannerId?: string;
    machineId?: string;
    descriptionContains?: string;
  }) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/plan-details/search`, { params });
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to search plan details"));
    }
  },

  async createPlanDetails(data: {
    annualPlanId: string;
    plannerId: string;
    machineId: string;
    monthsOfMaintenance: string;
    description?: string;
  }) {
    try {
      const response = await axios.post(`${API_WORK_ORDER_URL}/maintenance-planning/plan-details`, data);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to create plan details"));
    }
  },

  async searchPlanStatuses(params: {
    planType?: string;
    actionType?: string;
    planId?: string;
    performedBy?: string;
    from?: string;
    to?: string;
  }) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/plan-status/search`, { params });
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to search plan statuses"));
    }
  },

  async changePlanStatus(data: {
    planId: string;
    planType: string;
    actionType: string;
    performedBy: string;
    remark?: string;
  }) {
    try {
      const response = await axios.post(`${API_WORK_ORDER_URL}/maintenance-planning/plan-status/change`, data);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to change plan status"));
    }
  },

  async getAllPlanChanges() {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/plan-changes`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch plan changes"));
    }
  },

  async getPlanChangeById(id: string) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/plan-changes/${encodeURIComponent(id)}`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch plan change"));
    }
  },

  async getPlanChangesByRequestedBy(requestedBy: string) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/plan-changes/requested-by/${encodeURIComponent(requestedBy)}`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch requester plan changes"));
    }
  },

  async getPlanChangesByMonthlyPlan(monthlyPlanId: string) {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/plan-changes/monthly-plan/${encodeURIComponent(monthlyPlanId)}`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch monthly plan changes"));
    }
  },

  async getMachinesNeedingMonthlyPlans() {
    try {
      const response = await axios.get(`${API_WORK_ORDER_URL}/maintenance-planning/machines/needing-monthly-plans`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(getApiErrorMessage(err, "Failed to fetch machines needing monthly plans"));
    }
  },
};
