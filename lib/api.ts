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

// Mock data for development
const mockAssets: Asset[] = [
  {
    id: "asset-1",
    name: "Steam Turbine Unit 1",
    modelNumber: "ST-600-HP",
    serialNumber: "ST600HP-2018-001",
    assetTypeId: "type-1",
    locationId: "loc-1",
    parentAssetId: null,
    installationDate: "2018-03-15",
    currentHealthScore: 92,
    currentStatus: "operational",
    manufacturer: "Harbin Electric",
    ratedPower: "600 MW",
    serviceLife: "30 years",
  },
  {
    id: "asset-2",
    name: "High Pressure Rotor",
    modelNumber: "HPR-600",
    serialNumber: "HPR600-2018-001",
    assetTypeId: "type-2",
    locationId: "loc-1",
    parentAssetId: "asset-1",
    installationDate: "2018-03-15",
    currentHealthScore: 45,
    currentStatus: "pending_repair",
    manufacturer: "Harbin Electric",
  },
  {
    id: "asset-3",
    name: "Generator Unit 1",
    modelNumber: "GEN-600-3PH",
    serialNumber: "GEN600-2018-002",
    assetTypeId: "type-3",
    locationId: "loc-2",
    parentAssetId: null,
    installationDate: "2018-03-15",
    currentHealthScore: 87,
    currentStatus: "operational",
    manufacturer: "Dongfang Electric",
    ratedPower: "600 MW",
  },
  {
    id: "asset-4",
    name: "Boiler Feed Pump",
    modelNumber: "BFP-2000",
    serialNumber: "BFP2000-2018-003",
    assetTypeId: "type-4",
    locationId: "loc-3",
    parentAssetId: null,
    installationDate: "2018-02-10",
    currentHealthScore: 68,
    currentStatus: "under_repair",
    manufacturer: "Shenyang Pumps",
  },
];

const mockAssetTypes: AssetType[] = [
  {
    id: "type-1",
    name: "Steam Turbine",
    description: "High-pressure steam turbines for power generation",
  },
  {
    id: "type-2",
    name: "Rotor Assembly",
    description: "Turbine rotor components",
  },
  {
    id: "type-3",
    name: "Generator",
    description: "Electrical power generators",
  },
  {
    id: "type-4",
    name: "Pump",
    description: "Industrial pumps for various applications",
  },
  { id: "type-5", name: "Transformer", description: "Electrical transformers" },
];

const mockLocations: Location[] = [
  {
    id: "loc-1",
    name: "Turbine Hall - Unit 1",
    description: "Main turbine hall for Unit 1",
  },
  {
    id: "loc-2",
    name: "Generator Hall - Unit 1",
    description: "Generator hall for Unit 1",
  },
  {
    id: "loc-3",
    name: "Boiler House - Unit 1",
    description: "Boiler house for Unit 1",
  },
  {
    id: "loc-4",
    name: "Transformer Yard",
    description: "Main transformer yard",
  },
];

const mockSpareParts: SparePart[] = [
  {
    id: "part-1",
    partNumber: "BRG-001",
    name: "Turbine Bearing",
    description: "High-speed turbine bearing",
    quantityOnHand: 5,
    reorderThreshold: 2,
    unit_cost: 15000,
    supplier: "SKF Bearings",
  },
  {
    id: "part-2",
    partNumber: "SEAL-002",
    name: "Steam Seal",
    description: "High-temperature steam seal",
    quantityOnHand: 12,
    reorderThreshold: 5,
    unit_cost: 2500,
    supplier: "John Crane",
  },
  {
    id: "part-3",
    partNumber: "BLADE-003",
    name: "Turbine Blade",
    description: "HP turbine blade set",
    quantityOnHand: 1,
    reorderThreshold: 1,
    unit_cost: 85000,
    supplier: "Harbin Electric",
  },
];

const mockAssetTypeParts: AssetTypePart[] = [
  {
    id: "atp-1",
    partId: "part-1",
    assetTypeId: "type-1",
    quantityPerAsset: 4,
    positionReference: "Main shaft bearings",
  },
  {
    id: "atp-2",
    partId: "part-2",
    assetTypeId: "type-1",
    quantityPerAsset: 8,
    positionReference: "Steam inlet/outlet seals",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

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
      const response = await axios.get(`${API_BASE_URL}/assets/hierarchy`);
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
