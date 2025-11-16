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
import { Textarea } from './ui/textarea';
import { 
  Plus,
  Edit,
  Trash2,
  AlertCircle,
  Search,
  Package,
  TrendingDown,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import type { SparePart } from '@/types';

type SparePartFormData = Omit<SparePart, 'id' | 'created_at' | 'updated_at'>;

const initialFormData: SparePartFormData = {
  part_number: '',
  name: '',
  description: '',
  quantity_on_hand: 0,
  reorder_threshold: 0,
  unit_cost: 0,
  supplier: ''
};

// Mock data for demonstration
const mockSpareParts: SparePart[] = [
  {
    id: '1',
    part_number: 'TB-600-HS',
    name: 'Turbine Bearing Set',
    description: 'High-speed bearing set for 600MW turbine',
    quantity_on_hand: 4,
    reorder_threshold: 2,
    unit_cost: 45000,
    supplier: 'SKF China',
    created_at: '2025-01-15T08:00:00Z',
    updated_at: '2025-10-20T10:30:00Z'
  },
  {
    id: '2',
    part_number: 'GCF-600',
    name: 'Generator Cooling Fan',
    description: 'Cooling fan assembly for generator unit',
    quantity_on_hand: 1,
    reorder_threshold: 2,
    unit_cost: 28000,
    supplier: 'Dongfang Electric',
    created_at: '2025-02-10T09:00:00Z',
    updated_at: '2025-09-15T14:20:00Z'
  },
  {
    id: '3',
    part_number: 'PSK-2000',
    name: 'Pump Seal Kit',
    description: 'Complete seal kit for boiler feed pump',
    quantity_on_hand: 12,
    reorder_threshold: 5,
    unit_cost: 3500,
    supplier: 'John Crane',
    created_at: '2025-03-05T11:00:00Z',
    updated_at: '2025-10-01T16:45:00Z'
  },
  {
    id: '4',
    part_number: 'HVI-220',
    name: 'High Voltage Insulator',
    description: '220kV ceramic insulator',
    quantity_on_hand: 3,
    reorder_threshold: 4,
    unit_cost: 8500,
    supplier: 'XD Electric',
    created_at: '2025-04-12T13:00:00Z',
    updated_at: '2025-07-22T09:15:00Z'
  },
  {
    id: '5',
    part_number: 'CVA-DN100',
    name: 'Control Valve Actuator',
    description: 'Pneumatic actuator for DN100 control valve',
    quantity_on_hand: 6,
    reorder_threshold: 3,
    unit_cost: 15000,
    supplier: 'Fisher Controls',
    created_at: '2025-05-20T10:00:00Z',
    updated_at: '2025-09-05T11:30:00Z'
  },
  {
    id: '6',
    part_number: 'LO-VG68-200L',
    name: 'Lubricating Oil ISO VG 68',
    description: 'Industrial lubricating oil, 200L drum',
    quantity_on_hand: 450,
    reorder_threshold: 600,
    unit_cost: 85,
    supplier: 'Shell China',
    created_at: '2025-06-01T08:00:00Z',
    updated_at: '2025-10-15T15:00:00Z'
  },
  {
    id: '7',
    part_number: 'CB-220-3P',
    name: 'Circuit Breaker 220kV',
    description: '3-phase circuit breaker for 220kV system',
    quantity_on_hand: 0,
    reorder_threshold: 1,
    unit_cost: 125000,
    supplier: 'ABB',
    created_at: '2025-07-10T12:00:00Z',
    updated_at: '2024-12-10T14:00:00Z'
  }
];

export function SparePartsManagement() {
  const [spareParts, setSpareParts] = useState<SparePart[]>(mockSpareParts);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const [formData, setFormData] = useState<SparePartFormData>(initialFormData);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof SparePartFormData, string>>>({});
  const [successMessage, setSuccessMessage] = useState('');

  // Filter spare parts based on search
  const filteredParts = spareParts.filter(part =>
    part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.part_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    part.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics
  const totalParts = spareParts.length;
  const lowStockParts = spareParts.filter(p => p.quantity_on_hand <= p.reorder_threshold && p.quantity_on_hand > 0).length;
  const outOfStockParts = spareParts.filter(p => p.quantity_on_hand === 0).length;
  const totalValue = spareParts.reduce((sum, p) => sum + (p.quantity_on_hand * (p.unit_cost || 0)), 0);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof SparePartFormData, string>> = {};

    if (!formData.part_number.trim()) {
      errors.part_number = 'Part number is required';
    }
    if (!formData.name.trim()) {
      errors.name = 'Part name is required';
    }
    if (formData.quantity_on_hand < 0) {
      errors.quantity_on_hand = 'Quantity cannot be negative';
    }
    if (formData.reorder_threshold < 0) {
      errors.reorder_threshold = 'Reorder threshold cannot be negative';
    }
    if (formData.unit_cost && formData.unit_cost < 0) {
      errors.unit_cost = 'Unit cost cannot be negative';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle create
  const handleCreate = () => {
    if (!validateForm()) return;

    const newPart: SparePart = {
      id: Date.now().toString(),
      ...formData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setSpareParts([...spareParts, newPart]);
    setSuccessMessage('Spare part created successfully');
    setIsCreateDialogOpen(false);
    setFormData(initialFormData);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle edit
  const handleEdit = () => {
    if (!selectedPart || !validateForm()) return;

    const updatedParts = spareParts.map(part =>
      part.id === selectedPart.id
        ? { ...part, ...formData, updated_at: new Date().toISOString() }
        : part
    );

    setSpareParts(updatedParts);
    setSuccessMessage('Spare part updated successfully');
    setIsEditDialogOpen(false);
    setSelectedPart(null);
    setFormData(initialFormData);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle delete
  const handleDelete = () => {
    if (!selectedPart) return;

    setSpareParts(spareParts.filter(part => part.id !== selectedPart.id));
    setSuccessMessage('Spare part deleted successfully');
    setIsDeleteDialogOpen(false);
    setSelectedPart(null);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Open edit dialog
  const openEditDialog = (part: SparePart) => {
    setSelectedPart(part);
    setFormData({
      part_number: part.part_number,
      name: part.name,
      description: part.description,
      quantity_on_hand: part.quantity_on_hand,
      reorder_threshold: part.reorder_threshold,
      unit_cost: part.unit_cost,
      supplier: part.supplier
    });
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (part: SparePart) => {
    setSelectedPart(part);
    setIsDeleteDialogOpen(true);
  };

  // Open create dialog
  const openCreateDialog = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setIsCreateDialogOpen(true);
  };

  // Get stock status
  const getStockStatus = (part: SparePart) => {
    if (part.quantity_on_hand === 0) {
      return { label: 'Out of Stock', color: 'bg-red-100 text-red-700', icon: AlertTriangle };
    }
    if (part.quantity_on_hand <= part.reorder_threshold) {
      return { label: 'Low Stock', color: 'bg-orange-100 text-orange-700', icon: TrendingDown };
    }
    return { label: 'In Stock', color: 'bg-green-100 text-green-700', icon: CheckCircle };
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Parts</p>
              <p className="text-2xl text-slate-900">{totalParts}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Low Stock</p>
              <p className="text-2xl text-slate-900">{lowStockParts}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Out of Stock</p>
              <p className="text-2xl text-slate-900">{outOfStockParts}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Value</p>
              <p className="text-xl text-slate-900">¥{(totalValue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Search and Actions */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by part name, number, or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="w-4 h-4 mr-2" />
            Add Spare Part
          </Button>
        </div>
      </Card>

      {/* Spare Parts Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="text-left p-4 text-sm text-slate-600">Part Number</th>
                <th className="text-left p-4 text-sm text-slate-600">Name</th>
                <th className="text-left p-4 text-sm text-slate-600">Supplier</th>
                <th className="text-right p-4 text-sm text-slate-600">Quantity</th>
                <th className="text-right p-4 text-sm text-slate-600">Reorder Level</th>
                <th className="text-right p-4 text-sm text-slate-600">Unit Cost</th>
                <th className="text-center p-4 text-sm text-slate-600">Status</th>
                <th className="text-center p-4 text-sm text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredParts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center p-8 text-slate-500">
                    No spare parts found
                  </td>
                </tr>
              ) : (
                filteredParts.map((part) => {
                  const status = getStockStatus(part);
                  const StatusIcon = status.icon;
                  return (
                    <tr key={part.id} className="border-b hover:bg-slate-50">
                      <td className="p-4">
                        <p className="text-sm text-slate-900">{part.part_number}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-900">{part.name}</p>
                        {part.description && (
                          <p className="text-xs text-slate-500 mt-1">{part.description}</p>
                        )}
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-slate-600">{part.supplier || '-'}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm text-slate-900">{part.quantity_on_hand}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm text-slate-900">{part.reorder_threshold}</p>
                      </td>
                      <td className="p-4 text-right">
                        <p className="text-sm text-slate-900">
                          {part.unit_cost ? `¥${part.unit_cost.toLocaleString()}` : '-'}
                        </p>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <Badge className={status.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(part)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openDeleteDialog(part)}
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
            <DialogTitle>Add New Spare Part</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                placeholder="e.g., TB-600-HS"
              />
              {formErrors.part_number && (
                <p className="text-xs text-red-600 mt-1">{formErrors.part_number}</p>
              )}
            </div>
            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Turbine Bearing Set"
              />
              {formErrors.name && (
                <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter part description"
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="quantity_on_hand">Quantity on Hand *</Label>
              <Input
                id="quantity_on_hand"
                type="number"
                value={formData.quantity_on_hand}
                onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseInt(e.target.value) || 0 })}
                min="0"
              />
              {formErrors.quantity_on_hand && (
                <p className="text-xs text-red-600 mt-1">{formErrors.quantity_on_hand}</p>
              )}
            </div>
            <div>
              <Label htmlFor="reorder_threshold">Reorder Threshold *</Label>
              <Input
                id="reorder_threshold"
                type="number"
                value={formData.reorder_threshold}
                onChange={(e) => setFormData({ ...formData, reorder_threshold: parseInt(e.target.value) || 0 })}
                min="0"
              />
              {formErrors.reorder_threshold && (
                <p className="text-xs text-red-600 mt-1">{formErrors.reorder_threshold}</p>
              )}
            </div>
            <div>
              <Label htmlFor="unit_cost">Unit Cost (¥)</Label>
              <Input
                id="unit_cost"
                type="number"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
              {formErrors.unit_cost && (
                <p className="text-xs text-red-600 mt-1">{formErrors.unit_cost}</p>
              )}
            </div>
            <div>
              <Label htmlFor="supplier">Supplier</Label>
              <Input
                id="supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g., SKF China"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Spare Part</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Spare Part</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit_part_number">Part Number *</Label>
              <Input
                id="edit_part_number"
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
              />
              {formErrors.part_number && (
                <p className="text-xs text-red-600 mt-1">{formErrors.part_number}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit_name">Part Name *</Label>
              <Input
                id="edit_name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {formErrors.name && (
                <p className="text-xs text-red-600 mt-1">{formErrors.name}</p>
              )}
            </div>
            <div className="col-span-2">
              <Label htmlFor="edit_description">Description</Label>
              <Textarea
                id="edit_description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit_quantity_on_hand">Quantity on Hand *</Label>
              <Input
                id="edit_quantity_on_hand"
                type="number"
                value={formData.quantity_on_hand}
                onChange={(e) => setFormData({ ...formData, quantity_on_hand: parseInt(e.target.value) || 0 })}
                min="0"
              />
              {formErrors.quantity_on_hand && (
                <p className="text-xs text-red-600 mt-1">{formErrors.quantity_on_hand}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit_reorder_threshold">Reorder Threshold *</Label>
              <Input
                id="edit_reorder_threshold"
                type="number"
                value={formData.reorder_threshold}
                onChange={(e) => setFormData({ ...formData, reorder_threshold: parseInt(e.target.value) || 0 })}
                min="0"
              />
              {formErrors.reorder_threshold && (
                <p className="text-xs text-red-600 mt-1">{formErrors.reorder_threshold}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit_unit_cost">Unit Cost (¥)</Label>
              <Input
                id="edit_unit_cost"
                type="number"
                value={formData.unit_cost}
                onChange={(e) => setFormData({ ...formData, unit_cost: parseFloat(e.target.value) || 0 })}
                min="0"
                step="0.01"
              />
              {formErrors.unit_cost && (
                <p className="text-xs text-red-600 mt-1">{formErrors.unit_cost}</p>
              )}
            </div>
            <div>
              <Label htmlFor="edit_supplier">Supplier</Label>
              <Input
                id="edit_supplier"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Spare Part</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Spare Part</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{selectedPart?.name}</strong> ({selectedPart?.part_number})?
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
