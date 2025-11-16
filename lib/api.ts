// API Service Layer for M2 Backend Integration
// This is a mock implementation that simulates API calls
// Replace with actual API endpoints when backend is ready

import { Asset, AssetType, Location, SparePart, AssetTypePart, UserRole } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

// Mock data for development
const mockAssets: Asset[] = [
  {
    id: 'asset-1',
    name: 'Steam Turbine Unit 1',
    model_number: 'ST-600-HP',
    serial_number: 'ST600HP-2018-001',
    asset_type_id: 'type-1',
    location_id: 'loc-1',
    parent_asset_id: null,
    installation_date: '2018-03-15',
    current_health_score: 92,
    current_status: 'operational',
    manufacturer: 'Harbin Electric',
    rated_power: '600 MW',
    service_life: '30 years'
  },
  {
    id: 'asset-2',
    name: 'High Pressure Rotor',
    model_number: 'HPR-600',
    serial_number: 'HPR600-2018-001',
    asset_type_id: 'type-2',
    location_id: 'loc-1',
    parent_asset_id: 'asset-1',
    installation_date: '2018-03-15',
    current_health_score: 45,
    current_status: 'pending_repair',
    manufacturer: 'Harbin Electric'
  },
  {
    id: 'asset-3',
    name: 'Generator Unit 1',
    model_number: 'GEN-600-3PH',
    serial_number: 'GEN600-2018-002',
    asset_type_id: 'type-3',
    location_id: 'loc-2',
    parent_asset_id: null,
    installation_date: '2018-03-15',
    current_health_score: 87,
    current_status: 'operational',
    manufacturer: 'Dongfang Electric',
    rated_power: '600 MW'
  },
  {
    id: 'asset-4',
    name: 'Boiler Feed Pump',
    model_number: 'BFP-2000',
    serial_number: 'BFP2000-2018-003',
    asset_type_id: 'type-4',
    location_id: 'loc-3',
    parent_asset_id: null,
    installation_date: '2018-02-10',
    current_health_score: 68,
    current_status: 'under_repair',
    manufacturer: 'Shenyang Pumps'
  }
];

const mockAssetTypes: AssetType[] = [
  { id: 'type-1', name: 'Steam Turbine', description: 'High-pressure steam turbines for power generation' },
  { id: 'type-2', name: 'Rotor Assembly', description: 'Turbine rotor components' },
  { id: 'type-3', name: 'Generator', description: 'Electrical power generators' },
  { id: 'type-4', name: 'Pump', description: 'Industrial pumps for various applications' },
  { id: 'type-5', name: 'Transformer', description: 'Electrical transformers' }
];

const mockLocations: Location[] = [
  { id: 'loc-1', name: 'Turbine Hall - Unit 1', description: 'Main turbine hall for Unit 1' },
  { id: 'loc-2', name: 'Generator Hall - Unit 1', description: 'Generator hall for Unit 1' },
  { id: 'loc-3', name: 'Boiler House - Unit 1', description: 'Boiler house for Unit 1' },
  { id: 'loc-4', name: 'Transformer Yard', description: 'Main transformer yard' }
];

const mockSpareParts: SparePart[] = [
  {
    id: 'part-1',
    part_number: 'BRG-001',
    name: 'Turbine Bearing',
    description: 'High-speed turbine bearing',
    quantity_on_hand: 5,
    reorder_threshold: 2,
    unit_cost: 15000,
    supplier: 'SKF Bearings'
  },
  {
    id: 'part-2',
    part_number: 'SEAL-002',
    name: 'Steam Seal',
    description: 'High-temperature steam seal',
    quantity_on_hand: 12,
    reorder_threshold: 5,
    unit_cost: 2500,
    supplier: 'John Crane'
  },
  {
    id: 'part-3',
    part_number: 'BLADE-003',
    name: 'Turbine Blade',
    description: 'HP turbine blade set',
    quantity_on_hand: 1,
    reorder_threshold: 1,
    unit_cost: 85000,
    supplier: 'Harbin Electric'
  }
];

const mockAssetTypeParts: AssetTypePart[] = [
  {
    id: 'atp-1',
    part_id: 'part-1',
    asset_type_id: 'type-1',
    quantity_per_asset: 4,
    position_reference: 'Main shaft bearings'
  },
  {
    id: 'atp-2',
    part_id: 'part-2',
    asset_type_id: 'type-1',
    quantity_per_asset: 8,
    position_reference: 'Steam inlet/outlet seals'
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Asset API
export const assetApi = {
  async getAll(params?: { page?: number; limit?: number; status?: string; search?: string; userRole?: UserRole }) {
    await delay(300);
    let filtered = [...mockAssets];
    
    // Filter by status
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter(a => a.current_status === params.status);
    }
    
    // Search
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(a => 
        a.name.toLowerCase().includes(search) ||
        a.model_number.toLowerCase().includes(search) ||
        a.serial_number.toLowerCase().includes(search)
      );
    }
    
    // RBAC: Technicians see only assigned assets (simplified)
    if (params?.userRole === 'Maintenance Worker') {
      filtered = filtered.slice(0, 2); // Mock: show only first 2 assets
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: filtered.slice(start, end),
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit)
      }
    };
  },
  
  async getById(id: string) {
    await delay(200);
    const asset = mockAssets.find(a => a.id === id);
    if (!asset) throw new Error('Asset not found');
    return asset;
  },
  
  async create(asset: Omit<Asset, 'id' | 'created_at' | 'updated_at'>) {
    await delay(400);
    const newAsset: Asset = {
      ...asset,
      id: `asset-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockAssets.push(newAsset);
    return newAsset;
  },
  
  async update(id: string, asset: Partial<Asset>) {
    await delay(400);
    const index = mockAssets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    mockAssets[index] = { ...mockAssets[index], ...asset, updated_at: new Date().toISOString() };
    return mockAssets[index];
  },
  
  async delete(id: string) {
    await delay(300);
    const index = mockAssets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    mockAssets.splice(index, 1);
    return { success: true };
  },
  
  async getHierarchy() {
    await delay(300);
    return mockAssets;
  },
  
  async updateHierarchy(id: string, parentId: string | null) {
    await delay(400);
    const index = mockAssets.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Asset not found');
    mockAssets[index].parent_asset_id = parentId;
    return mockAssets[index];
  }
};

// Asset Type API
export const assetTypeApi = {
  async getAll() {
    await delay(200);
    return mockAssetTypes;
  },
  
  async getById(id: string) {
    await delay(200);
    const type = mockAssetTypes.find(t => t.id === id);
    if (!type) throw new Error('Asset type not found');
    return type;
  },
  
  async create(assetType: Omit<AssetType, 'id' | 'created_at' | 'updated_at'>) {
    await delay(400);
    const newType: AssetType = {
      ...assetType,
      id: `type-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockAssetTypes.push(newType);
    return newType;
  },
  
  async update(id: string, assetType: Partial<AssetType>) {
    await delay(400);
    const index = mockAssetTypes.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Asset type not found');
    mockAssetTypes[index] = { ...mockAssetTypes[index], ...assetType, updated_at: new Date().toISOString() };
    return mockAssetTypes[index];
  },
  
  async delete(id: string) {
    await delay(300);
    // Check if in use
    const inUse = mockAssets.some(a => a.asset_type_id === id);
    if (inUse) throw new Error('Cannot delete asset type that is in use');
    
    const index = mockAssetTypes.findIndex(t => t.id === id);
    if (index === -1) throw new Error('Asset type not found');
    mockAssetTypes.splice(index, 1);
    return { success: true };
  }
};

// Location API
export const locationApi = {
  async getAll() {
    await delay(200);
    return mockLocations;
  },
  
  async getById(id: string) {
    await delay(200);
    const location = mockLocations.find(l => l.id === id);
    if (!location) throw new Error('Location not found');
    return location;
  }
};

// Spare Part API
export const sparePartApi = {
  async getAll() {
    await delay(200);
    return mockSpareParts;
  },
  
  async getById(id: string) {
    await delay(200);
    const part = mockSpareParts.find(p => p.id === id);
    if (!part) throw new Error('Spare part not found');
    return part;
  },
  
  async create(sparePart: Omit<SparePart, 'id' | 'created_at' | 'updated_at'>) {
    await delay(400);
    const newPart: SparePart = {
      ...sparePart,
      id: `part-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockSpareParts.push(newPart);
    return newPart;
  },
  
  async update(id: string, sparePart: Partial<SparePart>) {
    await delay(400);
    const index = mockSpareParts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Spare part not found');
    mockSpareParts[index] = { ...mockSpareParts[index], ...sparePart, updated_at: new Date().toISOString() };
    return mockSpareParts[index];
  },
  
  async delete(id: string) {
    await delay(300);
    // Check if in use
    const inUse = mockAssetTypeParts.some(atp => atp.part_id === id);
    if (inUse) throw new Error('Cannot delete spare part that is in use');
    
    const index = mockSpareParts.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Spare part not found');
    mockSpareParts.splice(index, 1);
    return { success: true };
  }
};

// Asset Type Parts API (Many-to-Many)
export const assetTypePartApi = {
  async getAll() {
    await delay(200);
    return mockAssetTypeParts;
  },
  
  async getByAssetType(assetTypeId: string) {
    await delay(200);
    return mockAssetTypeParts.filter(atp => atp.asset_type_id === assetTypeId);
  },
  
  async create(mapping: Omit<AssetTypePart, 'id' | 'created_at' | 'updated_at'>) {
    await delay(400);
    // Check for duplicate
    const exists = mockAssetTypeParts.some(
      atp => atp.part_id === mapping.part_id && atp.asset_type_id === mapping.asset_type_id
    );
    if (exists) throw new Error('This mapping already exists');
    
    const newMapping: AssetTypePart = {
      ...mapping,
      id: `atp-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockAssetTypeParts.push(newMapping);
    return newMapping;
  },
  
  async update(id: string, mapping: Partial<AssetTypePart>) {
    await delay(400);
    const index = mockAssetTypeParts.findIndex(atp => atp.id === id);
    if (index === -1) throw new Error('Mapping not found');
    mockAssetTypeParts[index] = { ...mockAssetTypeParts[index], ...mapping, updated_at: new Date().toISOString() };
    return mockAssetTypeParts[index];
  },
  
  async delete(id: string) {
    await delay(300);
    const index = mockAssetTypeParts.findIndex(atp => atp.id === id);
    if (index === -1) throw new Error('Mapping not found');
    mockAssetTypeParts.splice(index, 1);
    return { success: true };
  }
};
