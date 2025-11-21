// API Service Layer for M2 Backend Integration
// This is a mock implementation that simulates API calls
// Replace with actual API endpoints when backend is ready

import axios from "axios";
import {
  Asset,
  AssetType,
  Location,
  SparePart,
  AssetTypePart,
  UserRole,
} from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";



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
    page?: number;
    limit?: number;
    status?: string;
    search?: string;
    userRole?: UserRole;
  }) {
    try {
      const response = await axios.get(`${API_BASE_URL}/assets`, { params });
      // Expecting backend to return { data: [...], pagination: { ... } }
      const resp = response.data;
      if (resp && (resp.data || Array.isArray(resp))) {
        return resp;
      }
      // Fallback: wrap array responses
      return {
        data: resp,
        pagination: {
          page: params?.page || 1,
          limit: params?.limit || (Array.isArray(resp) ? resp.length : 0),
          total: Array.isArray(resp) ? resp.length : 0,
          totalPages: 1,
        },
      };
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Failed to fetch assets";
      throw new Error(message);
    }
  },

  async getById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assets/${encodeURIComponent(id)}`
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Failed to fetch asset";
      throw new Error(message);
    }
  },

  async create(asset: Omit<Asset, "id" | "createdAt" | "updatedAt">) {
    try {
      const response = await axios.post(`${API_BASE_URL}/assets`, asset);
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Failed to create asset";
      throw new Error(message);
    }
  },

  async update(id: string, asset: Partial<Asset>) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/assets/${encodeURIComponent(id)}`,
        asset
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Failed to update asset";
      throw new Error(message);
    }
  },

  async delete(id: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/assets/${encodeURIComponent(id)}`
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Failed to delete asset";
      throw new Error(message);
    }
  },

  async getHierarchy() {
    try {
      const response = await axios.get(`${API_BASE_URL}/assets/hierarchies`);
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch asset hierarchy";
      throw new Error(message);
    }
  },

  async updateHierarchy(id: string, parentId: string | null) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/assets/${encodeURIComponent(id)}/hierarchy`,
        { parentId }
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to update asset hierarchy";
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
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch asset types";
      throw new Error(message);
    }
  },

  async getById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/asset-types/${encodeURIComponent(id)}`
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Asset type not found";
      throw new Error(message);
    }
  },

  async create(assetType: Omit<AssetType, "id" | "createdAt" | "updatedAt">) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/asset-types`,
        assetType
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to create asset type";
      throw new Error(message);
    }
  },

  async update(id: string, assetType: Partial<AssetType>) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/asset-types/${encodeURIComponent(id)}`,
        assetType
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to update asset type";
      throw new Error(message);
    }
  },

  async delete(id: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/asset-types/${encodeURIComponent(id)}`
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
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
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch locations";
      throw new Error(message);
    }
  },

  async getById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/locations/${encodeURIComponent(id)}`
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Location not found";
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
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch spare parts";
      throw new Error(message);
    }
  },

  async getById(id: string) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/spare-parts/${encodeURIComponent(id)}`
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err.message || "Spare part not found";
      throw new Error(message);
    }
  },

  async create(sparePart: Omit<SparePart, "id" | "createdAt" | "updatedAt">) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/spare-parts`,
        sparePart
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to create spare part";
      throw new Error(message);
    }
  },

  async update(id: string, sparePart: Partial<SparePart>) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/spare-parts/${encodeURIComponent(id)}`,
        sparePart
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to update spare part";
      throw new Error(message);
    }
  },

  async delete(id: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/spare-parts/${encodeURIComponent(id)}`
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to delete spare part";
      throw new Error(message);
    }
  },
};

// Asset Type Parts API (Many-to-Many)
export const assetTypePartApi = {
  async getAll() {
    try {
      const response = await axios.get(`${API_BASE_URL}/asset-type-parts`);
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch asset type parts";
      throw new Error(message);
    }
  },

  async getByAssetType(assetTypeId: string) {
    try {
      // Common REST pattern: /asset-types/:id/parts
      const response = await axios.get(
        `${API_BASE_URL}/asset-types/${encodeURIComponent(assetTypeId)}/parts`
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to fetch mappings for asset type";
      throw new Error(message);
    }
  },

  async create(mapping: Omit<AssetTypePart, "id" | "createdAt" | "updatedAt">) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/asset-type-parts`,
        mapping
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to create mapping";
      throw new Error(message);
    }
  },

  async update(id: string, mapping: Partial<AssetTypePart>) {
    try {
      const response = await axios.put(
        `${API_BASE_URL}/asset-type-parts/${encodeURIComponent(id)}`,
        mapping
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to update mapping";
      throw new Error(message);
    }
  },

  async delete(id: string) {
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/asset-type-parts/${encodeURIComponent(id)}`
      );
      return response.data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        err.message ||
        "Failed to delete mapping";
      throw new Error(message);
    }
  },
};
