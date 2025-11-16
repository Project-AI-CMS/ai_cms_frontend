'use client'
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Package,
  Link as LinkIcon,
  Search,
  Settings
} from 'lucide-react';
import type { AssetTypePart, SparePart, AssetType, UserInfo } from '@/types';

type AssetTypePartsProps = {
  user: UserInfo;
};

type AssetTypePartFormData = Omit<AssetTypePart, 'id' | 'created_at' | 'updated_at'>;

const initialFormData: AssetTypePartFormData = {
  part_id: '',
  asset_type_id: '',
  quantity_per_asset: 1,
  position_reference: ''
};

// Mock data for demonstration
const mockAssetTypes: AssetType[] = [
  { id: '1', name: 'Steam Turbine', description: '600MW steam turbine unit' },
  { id: '2', name: 'Generator', description: 'Power generator unit' },
  { id: '3', name: 'Boiler', description: 'Steam boiler system' },
  { id: '4', name: 'Pump', description: 'Industrial pump' },
  { id: '5', name: 'Transformer', description: 'Power transformer' }
];

const mockSpareParts: SparePart[] = [
  { id: '1', part_number: 'TB-600-HS', name: 'Turbine Bearing Set', quantity_on_hand: 4, reorder_threshold: 2, unit_cost: 45000, supplier: 'SKF China' },
  { id: '2', part_number: 'GCF-600', name: 'Generator Cooling Fan', quantity_on_hand: 1, reorder_threshold: 2, unit_cost: 28000, supplier: 'Dongfang Electric' },
  { id: '3', part_number: 'PSK-2000', name: 'Pump Seal Kit', quantity_on_hand: 12, reorder_threshold: 5, unit_cost: 3500, supplier: 'John Crane' },
  { id: '4', part_number: 'HVI-220', name: 'High Voltage Insulator', quantity_on_hand: 3, reorder_threshold: 4, unit_cost: 8500, supplier: 'XD Electric' },
  { id: '5', part_number: 'CVA-DN100', name: 'Control Valve Actuator', quantity_on_hand: 6, reorder_threshold: 3, unit_cost: 15000, supplier: 'Fisher Controls' },
  { id: '6', part_number: 'LO-VG68-200L', name: 'Lubricating Oil ISO VG 68', quantity_on_hand: 450, reorder_threshold: 600, unit_cost: 85, supplier: 'Shell China' },
  { id: '7', part_number: 'CB-220-3P', name: 'Circuit Breaker 220kV', quantity_on_hand: 0, reorder_threshold: 1, unit_cost: 125000, supplier: 'ABB' }
];

const mockMappings: AssetTypePart[] = [
  { id: '1', part_id: '1', asset_type_id: '1', quantity_per_asset: 4, position_reference: 'HP/LP Rotor Bearings', created_at: '2025-01-15T08:00:00Z', updated_at: '2025-10-20T10:30:00Z' },
  { id: '2', part_id: '2', asset_type_id: '2', quantity_per_asset: 2, position_reference: 'Stator Cooling System', created_at: '2025-02-10T09:00:00Z', updated_at: '2025-09-15T14:20:00Z' },
  { id: '3', part_id: '3', asset_type_id: '4', quantity_per_asset: 1, position_reference: 'Main Shaft Seal', created_at: '2025-03-05T11:00:00Z', updated_at: '2025-10-01T16:45:00Z' },
  { id: '4', part_id: '4', asset_type_id: '5', quantity_per_asset: 6, position_reference: 'HV Bushing Insulators', created_at: '2025-04-12T13:00:00Z', updated_at: '2025-07-22T09:15:00Z' },
  { id: '5', part_id: '5', asset_type_id: '3', quantity_per_asset: 3, position_reference: 'Feed Water Control Valves', created_at: '2025-05-20T10:00:00Z', updated_at: '2025-09-05T11:30:00Z' },
  { id: '6', part_id: '6', asset_type_id: '1', quantity_per_asset: 200, position_reference: 'Bearing Lubrication System', created_at: '2025-06-01T08:00:00Z', updated_at: '2025-10-15T15:00:00Z' },
  { id: '7', part_id: '1', asset_type_id: '2', quantity_per_asset: 2, position_reference: 'Generator Bearings', created_at: '2025-07-10T12:00:00Z', updated_at: '2025-08-20T14:00:00Z' }
];

export function AssetTypePartsMapping({ user }: AssetTypePartsProps) {
  const [mappings, setMappings] = useState<AssetTypePart[]>(mockMappings);
  const [assetTypes, setAssetTypes] = useState<AssetType[]>(mockAssetTypes);
  const [spareParts, setSpareParts] = useState<SparePart[]>(mockSpareParts);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAssetType, setFilterAssetType] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<AssetTypePart | null>(null);
  const [formData, setFormData] = useState<AssetTypePartFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AssetTypePartFormData, string>>>({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Check if user has admin access
  const hasAccess = user.role === 'Administrator';

  // Get asset type name by id
  const getAssetTypeName = (id: string) => {
    return assetTypes.find(t => t.id === id)?.name || 'Unknown';
  };

  // Get spare part by id
  const getSparePart = (id: string) => {
    return spareParts.find(p => p.id === id);
  };

  // Filter mappings
  const filteredMappings = mappings.filter(mapping => {
    const part = getSparePart(mapping.part_id);
    const assetType = getAssetTypeName(mapping.asset_type_id);
    
    const matchesSearch = 
      part?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part?.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assetType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mapping.position_reference?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterAssetType === 'all' || mapping.asset_type_id === filterAssetType;
    
    return matchesSearch && matchesFilter;
  });

  // Calculate statistics
  const totalMappings = mappings.length;
  const uniqueAssetTypes = new Set(mappings.map(m => m.asset_type_id)).size;
  const uniqueParts = new Set(mappings.map(m => m.part_id)).size;

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof AssetTypePartFormData, string>> = {};

    if (!formData.part_id) {
      errors.part_id = 'Spare part is required';
    }
    if (!formData.asset_type_id) {
      errors.asset_type_id = 'Asset type is required';
    }
    if (formData.quantity_per_asset <= 0) {
      errors.quantity_per_asset = 'Quantity must be greater than 0';
    }

    // Check for duplicate mapping (same part + asset type combination)
    const isDuplicate = mappings.some(m => 
      m.part_id === formData.part_id && 
      m.asset_type_id === formData.asset_type_id &&
      (!selectedMapping || m.id !== selectedMapping.id)
    );

    if (isDuplicate) {
      errors.part_id = 'This spare part is already mapped to this asset type';
      setErrorMessage('Duplicate mapping: This spare part is already mapped to the selected asset type');
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create
  const handleCreate = () => {
    if (!validateForm()) return;

    const newMapping: AssetTypePart = {
      id: Date.now().toString(),
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setMappings([...mappings, newMapping]);
    setSuccessMessage('Mapping created successfully');
    setIsCreateDialogOpen(false);
    setFormData(initialFormData);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle edit
  const handleEdit = () => {
    if (!selectedMapping || !validateForm()) return;

    const updatedMappings = mappings.map(mapping =>
      mapping.id === selectedMapping.id
        ? { ...mapping, ...formData, updated_at: new Date().toISOString() }
        : mapping
    );

    setMappings(updatedMappings);
    setSuccessMessage('Mapping updated successfully');
    setIsEditDialogOpen(false);
    setSelectedMapping(null);
    setFormData(initialFormData);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle delete
  const handleDelete = () => {
    if (!selectedMapping) return;

    setMappings(mappings.filter(mapping => mapping.id !== selectedMapping.id));
    setSuccessMessage('Mapping deleted successfully');
    setIsDeleteDialogOpen(false);
    setSelectedMapping(null);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Open edit dialog
  const openEditDialog = (mapping: AssetTypePart) => {
    setSelectedMapping(mapping);
    setFormData({
      part_id: mapping.part_id,
      asset_type_id: mapping.asset_type_id,
      quantity_per_asset: mapping.quantity_per_asset,
      position_reference: mapping.position_reference
    });
    setFormErrors({});
    setErrorMessage('');
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (mapping: AssetTypePart) => {
    setSelectedMapping(mapping);
    setIsDeleteDialogOpen(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setErrorMessage('');
    setIsCreateDialogOpen(true);
  };

  if (!hasAccess) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You do not have permission to access this page. Administrator access required.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Asset Type Parts Mapping</h2>
          <p className="text-slate-600">Manage spare parts requirements for each asset type</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 mr-2" />
          Add Mapping
        </Button>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <LinkIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Mappings</p>
              <p className="text-2xl text-slate-900">{totalMappings}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Settings className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Asset Types Mapped</p>
              <p className="text-2xl text-slate-900">{uniqueAssetTypes}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Unique Parts Used</p>
              <p className="text-2xl text-slate-900">{uniqueParts}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by part name, asset type, or position..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterAssetType} onValueChange={setFilterAssetType}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Filter by Asset Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Asset Types</SelectItem>
              {assetTypes.map(type => (
                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Mappings Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm text-slate-600">Asset Type</th>
                <th className="text-left p-4 text-sm text-slate-600">Spare Part</th>
                <th className="text-left p-4 text-sm text-slate-600">Part Number</th>
                <th className="text-right p-4 text-sm text-slate-600">Qty per Asset</th>
                <th className="text-left p-4 text-sm text-slate-600">Position Reference</th>
                <th className="text-center p-4 text-sm text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMappings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center p-8 text-slate-500">
                    No mappings found
                  </td>
                </tr>
              ) : (
                filteredMappings.map((mapping) => {
                  const part = getSparePart(mapping.part_id);
                  const assetTypeName = getAssetTypeName(mapping.asset_type_id);
                  
                  return (
                    <tr key={mapping.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-slate-900 font-medium">{assetTypeName}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-900">{part?.name || 'Unknown'}</p>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className="text-xs">
                          {part?.part_number || 'N/A'}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-sm text-slate-900 font-medium">
                          {mapping.quantity_per_asset}
                        </span>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-600">
                          {mapping.position_reference || '-'}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(mapping)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(mapping)}
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Mapping</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="asset_type_id">Asset Type *</Label>
              <Select
                value={formData.asset_type_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, asset_type_id: value });
                  setFormErrors({ ...formErrors, asset_type_id: undefined });
                  setErrorMessage('');
                }}
              >
                <SelectTrigger className={formErrors.asset_type_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select asset type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                      {type.description && <span className="text-xs text-slate-500"> - {type.description}</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.asset_type_id && (
                <p className="text-xs text-red-600 mt-1">{formErrors.asset_type_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="part_id">Spare Part *</Label>
              <Select
                value={formData.part_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, part_id: value });
                  setFormErrors({ ...formErrors, part_id: undefined });
                  setErrorMessage('');
                }}
              >
                <SelectTrigger className={formErrors.part_id ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select spare part" />
                </SelectTrigger>
                <SelectContent>
                  {spareParts.map(part => (
                    <SelectItem key={part.id} value={part.id}>
                      <div className="flex items-center gap-2">
                        <span>{part.name}</span>
                        <Badge variant="outline" className="text-xs">{part.part_number}</Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.part_id && (
                <p className="text-xs text-red-600 mt-1">{formErrors.part_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="quantity_per_asset">Quantity per Asset *</Label>
              <Input
                id="quantity_per_asset"
                type="number"
                value={formData.quantity_per_asset}
                onChange={(e) => setFormData({ ...formData, quantity_per_asset: parseInt(e.target.value) || 0 })}
                min="1"
                placeholder="e.g., 4"
              />
              {formErrors.quantity_per_asset && (
                <p className="text-xs text-red-600 mt-1">{formErrors.quantity_per_asset}</p>
              )}
            </div>

            <div>
              <Label htmlFor="position_reference">Position Reference</Label>
              <Input
                id="position_reference"
                value={formData.position_reference}
                onChange={(e) => setFormData({ ...formData, position_reference: e.target.value })}
                placeholder="e.g., HP/LP Rotor Bearings, Stator Cooling System"
              />
              <p className="text-xs text-slate-500 mt-1">
                Optional: Specify where this part is used in the asset
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Mapping</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit_asset_type_id">Asset Type *</Label>
              <Select
                value={formData.asset_type_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, asset_type_id: value });
                  setFormErrors({ ...formErrors, asset_type_id: undefined });
                  setErrorMessage('');
                }}
              >
                <SelectTrigger className={formErrors.asset_type_id ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.asset_type_id && (
                <p className="text-xs text-red-600 mt-1">{formErrors.asset_type_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit_part_id">Spare Part *</Label>
              <Select
                value={formData.part_id}
                onValueChange={(value) => {
                  setFormData({ ...formData, part_id: value });
                  setFormErrors({ ...formErrors, part_id: undefined });
                  setErrorMessage('');
                }}
              >
                <SelectTrigger className={formErrors.part_id ? 'border-red-500' : ''}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {spareParts.map(part => (
                    <SelectItem key={part.id} value={part.id}>
                      {part.name} ({part.part_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.part_id && (
                <p className="text-xs text-red-600 mt-1">{formErrors.part_id}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit_quantity_per_asset">Quantity per Asset *</Label>
              <Input
                id="edit_quantity_per_asset"
                type="number"
                value={formData.quantity_per_asset}
                onChange={(e) => setFormData({ ...formData, quantity_per_asset: parseInt(e.target.value) || 0 })}
                min="1"
              />
              {formErrors.quantity_per_asset && (
                <p className="text-xs text-red-600 mt-1">{formErrors.quantity_per_asset}</p>
              )}
            </div>

            <div>
              <Label htmlFor="edit_position_reference">Position Reference</Label>
              <Input
                id="edit_position_reference"
                value={formData.position_reference}
                onChange={(e) => setFormData({ ...formData, position_reference: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Mapping</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this mapping? 
              <br /><br />
              <strong>Asset Type:</strong> {selectedMapping && getAssetTypeName(selectedMapping.asset_type_id)}
              <br />
              <strong>Spare Part:</strong> {selectedMapping && getSparePart(selectedMapping.part_id)?.name}
              <br /><br />
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
