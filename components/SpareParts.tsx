import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Package, 
  Search, 
  AlertTriangle, 
  TrendingDown, 
  ShoppingCart,
  FileText,
  Plus,
  Check,
  Clock
} from 'lucide-react';

type SparePart = {
  id: string;
  name: string;
  partNumber: string;
  category: string;
  quantity: number;
  minStock: number;
  unit: string;
  location: string;
  supplier: string;
  unitPrice: number;
  lastOrder: string;
  leadTime: string;
};

const spareParts: SparePart[] = [
  {
    id: 'SP-001',
    name: 'Turbine Bearing Set',
    partNumber: 'TB-600-HS',
    category: 'Bearings',
    quantity: 4,
    minStock: 2,
    unit: 'set',
    location: 'Warehouse A - Shelf 12',
    supplier: 'SKF China',
    unitPrice: 45000,
    lastOrder: '2025-08-15',
    leadTime: '30 days'
  },
  {
    id: 'SP-002',
    name: 'Generator Cooling Fan',
    partNumber: 'GCF-600',
    category: 'Cooling Parts',
    quantity: 1,
    minStock: 2,
    unit: 'pcs',
    location: 'Warehouse A - Shelf 08',
    supplier: 'Dongfang Electric',
    unitPrice: 28000,
    lastOrder: '2025-09-20',
    leadTime: '45 days'
  },
  {
    id: 'SP-003',
    name: 'Pump Seal Kit',
    partNumber: 'PSK-2000',
    category: 'Seals',
    quantity: 12,
    minStock: 5,
    unit: 'kit',
    location: 'Warehouse B - Shelf 03',
    supplier: 'John Crane',
    unitPrice: 3500,
    lastOrder: '2025-10-01',
    leadTime: '20 days'
  },
  {
    id: 'SP-004',
    name: 'High Voltage Insulator',
    partNumber: 'HVI-220',
    category: 'Electrical',
    quantity: 3,
    minStock: 4,
    unit: 'pcs',
    location: 'Warehouse A - Shelf 15',
    supplier: 'XD Electric',
    unitPrice: 8500,
    lastOrder: '2025-07-10',
    leadTime: '25 days'
  },
  {
    id: 'SP-005',
    name: 'Control Valve Actuator',
    partNumber: 'CVA-DN100',
    category: 'Valves',
    quantity: 6,
    minStock: 3,
    unit: 'pcs',
    location: 'Warehouse B - Shelf 07',
    supplier: 'Fisher Controls',
    unitPrice: 15000,
    lastOrder: '2025-09-05',
    leadTime: '35 days'
  },
  {
    id: 'SP-006',
    name: 'Lubricating Oil ISO VG 68',
    partNumber: 'LO-VG68-200L',
    category: 'Lubricants',
    quantity: 450,
    minStock: 600,
    unit: 'L',
    location: 'Oil Storage Tank 2',
    supplier: 'Shell China',
    unitPrice: 85,
    lastOrder: '2025-10-15',
    leadTime: '10 days'
  },
  {
    id: 'SP-007',
    name: 'Gasket Set - Boiler',
    partNumber: 'GS-BLR-2000',
    category: 'Gaskets',
    quantity: 8,
    minStock: 4,
    unit: 'set',
    location: 'Warehouse B - Shelf 11',
    supplier: 'Garlock China',
    unitPrice: 2200,
    lastOrder: '2025-09-28',
    leadTime: '15 days'
  },
  {
    id: 'SP-008',
    name: 'Circuit Breaker 220kV',
    partNumber: 'CB-220-3P',
    category: 'Electrical',
    quantity: 0,
    minStock: 1,
    unit: 'pcs',
    location: 'Warehouse A - Shelf 20',
    supplier: 'ABB',
    unitPrice: 125000,
    lastOrder: '2024-12-10',
    leadTime: '60 days'
  }
];

const pendingRequests = [
  {
    id: 'REQ-2025-043',
    parts: 'Turbine Bearing Set × 2',
    requester: 'Li Ming',
    maintenancePlan: 'MP-2025-001',
    date: '2025-10-25',
    status: 'pending'
  },
  {
    id: 'REQ-2025-044',
    parts: 'Pump Seal Kit × 3',
    requester: 'Wang Fang',
    maintenancePlan: 'MP-2025-002',
    date: '2025-10-26',
    status: 'approved'
  },
  {
    id: 'REQ-2025-045',
    parts: 'Lubricating Oil × 200L',
    requester: 'Chen Jian',
    maintenancePlan: 'MP-2025-004',
    date: '2025-10-27',
    status: 'pending'
  }
];

function SparePartCard({ part }: { part: SparePart }) {
  const isLowStock = part.quantity <= part.minStock;
  const isOutOfStock = part.quantity === 0;
  const stockPercentage = (part.quantity / (part.minStock * 2)) * 100;

  return (
    <Card className={`p-4 ${isOutOfStock ? 'border-red-300 bg-red-50/30' : isLowStock ? 'border-orange-300 bg-orange-50/30' : ''}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-slate-900">{part.name}</h3>
            {isOutOfStock && (
              <Badge className="bg-red-100 text-red-700">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Out of Stock
              </Badge>
            )}
            {!isOutOfStock && isLowStock && (
              <Badge className="bg-orange-100 text-orange-700">
                <TrendingDown className="w-3 h-3 mr-1" />
                Low Stock
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600">{part.partNumber}</p>
        </div>
        <Badge variant="outline">{part.category}</Badge>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Current Stock:</span>
          <span className={`${isOutOfStock ? 'text-red-600' : isLowStock ? 'text-orange-600' : 'text-slate-900'}`}>
            {part.quantity} {part.unit}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Min Stock Level:</span>
          <span className="text-slate-900">{part.minStock} {part.unit}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all ${
              isOutOfStock ? 'bg-red-600' : 
              isLowStock ? 'bg-orange-500' : 
              'bg-green-500'
            }`}
            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="space-y-1 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-slate-600">Location:</span>
          <span className="text-slate-900">{part.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Supplier:</span>
          <span className="text-slate-900">{part.supplier}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Lead Time:</span>
          <span className="text-slate-900">{part.leadTime}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Unit Price:</span>
          <span className="text-slate-900">¥{part.unitPrice.toLocaleString()}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              Details
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{part.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <Label>Part Number</Label>
                  <p className="text-slate-900 mt-1">{part.partNumber}</p>
                </div>
                <div>
                  <Label>Category</Label>
                  <p className="text-slate-900 mt-1">{part.category}</p>
                </div>
                <div>
                  <Label>Current Stock</Label>
                  <p className="text-slate-900 mt-1">{part.quantity} {part.unit}</p>
                </div>
                <div>
                  <Label>Min Stock</Label>
                  <p className="text-slate-900 mt-1">{part.minStock} {part.unit}</p>
                </div>
                <div>
                  <Label>Storage Location</Label>
                  <p className="text-slate-900 mt-1">{part.location}</p>
                </div>
                <div>
                  <Label>Supplier</Label>
                  <p className="text-slate-900 mt-1">{part.supplier}</p>
                </div>
                <div>
                  <Label>Unit Price</Label>
                  <p className="text-slate-900 mt-1">¥{part.unitPrice.toLocaleString()}</p>
                </div>
                <div>
                  <Label>Lead Time</Label>
                  <p className="text-slate-900 mt-1">{part.leadTime}</p>
                </div>
                <div>
                  <Label>Last Order</Label>
                  <p className="text-slate-900 mt-1">{part.lastOrder}</p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        <Button size="sm" className="flex-1" disabled={!isLowStock && !isOutOfStock}>
          <ShoppingCart className="w-4 h-4 mr-2" />
          Order
        </Button>
      </div>
    </Card>
  );
}

export function SpareParts() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredParts = spareParts.filter(part => {
    const matchesSearch = part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         part.partNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || part.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const lowStockCount = spareParts.filter(p => p.quantity <= p.minStock && p.quantity > 0).length;
  const outOfStockCount = spareParts.filter(p => p.quantity === 0).length;
  const totalValue = spareParts.reduce((sum, p) => sum + (p.quantity * p.unitPrice), 0);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Items</p>
              <p className="text-2xl text-slate-900">{spareParts.length}</p>
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
              <p className="text-2xl text-slate-900">{lowStockCount}</p>
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
              <p className="text-2xl text-slate-900">{outOfStockCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Value</p>
              <p className="text-xl text-slate-900">¥{(totalValue / 1000000).toFixed(1)}M</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search spare parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="Bearings">Bearings</SelectItem>
              <SelectItem value="Seals">Seals</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Valves">Valves</SelectItem>
              <SelectItem value="Lubricants">Lubricants</SelectItem>
              <SelectItem value="Gaskets">Gaskets</SelectItem>
              <SelectItem value="Cooling Parts">Cooling Parts</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Part
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Spare Part</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Part Name</Label>
                  <Input placeholder="Enter part name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Part Number</Label>
                    <Input placeholder="Enter part number" />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bearings">Bearings</SelectItem>
                        <SelectItem value="seals">Seals</SelectItem>
                        <SelectItem value="electrical">Electrical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">Cancel</Button>
                  <Button>Add Part</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Pending Requests */}
      <Card className="p-4">
        <h3 className="text-slate-900 mb-4">Pending Parts Requests</h3>
        <div className="space-y-3">
          {pendingRequests.map(req => (
            <div key={req.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-slate-900">{req.id}</p>
                  <Badge className={req.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {req.status === 'approved' ? <Check className="w-3 h-3 mr-1" /> : <Clock className="w-3 h-3 mr-1" />}
                    {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600">{req.parts} • {req.maintenancePlan}</p>
                <p className="text-xs text-slate-500">{req.requester} • {req.date}</p>
              </div>
              <div className="flex gap-2">
                {req.status === 'pending' && (
                  <>
                    <Button variant="outline" size="sm">Reject</Button>
                    <Button size="sm">Approve</Button>
                  </>
                )}
                {req.status === 'approved' && (
                  <Button size="sm" variant="outline">Issue Parts</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Parts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredParts.map(part => (
          <SparePartCard key={part.id} part={part} />
        ))}
      </div>
    </div>
  );
}
