import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Search, 
  Plus, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  FileText, 
  Download,
  Eye,
  Edit,
  MapPin,
  Calendar,
  Zap,
  AlertCircle
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type EquipmentStatus = 'operational' | 'standby' | 'pending_repair' | 'under_repair' | 'scrapped';

type Equipment = {
  id: string;
  name: string;
  model: string;
  manufacturer: string;
  installDate: string;
  location: string;
  status: EquipmentStatus;
  ratedPower?: string;
  serviceLife?: string;
  system: string;
  children?: Equipment[];
};

const equipmentData: Equipment[] = [
  {
    id: 'unit-1',
    name: 'Unit 1 - 600MW',
    model: 'U600-Gen5',
    manufacturer: 'Shanghai Electric',
    installDate: '2018-03-15',
    location: 'Main Building - Unit 1',
    status: 'operational',
    system: 'Power Generation Unit',
    children: [
      {
        id: 'turbine-1',
        name: 'Steam Turbine',
        model: 'ST-600-HP',
        manufacturer: 'Harbin Electric',
        installDate: '2018-03-15',
        location: 'Turbine Hall - Unit 1',
        status: 'operational',
        ratedPower: '600 MW',
        serviceLife: '30 years',
        system: 'Turbine System',
        children: [
          {
            id: 'hp-rotor',
            name: 'High Pressure Rotor',
            model: 'HPR-600',
            manufacturer: 'Harbin Electric',
            installDate: '2018-03-15',
            location: 'Turbine Hall - Unit 1',
            status: 'operational',
            system: 'Turbine System'
          },
          {
            id: 'lp-rotor',
            name: 'Low Pressure Rotor',
            model: 'LPR-600',
            manufacturer: 'Harbin Electric',
            installDate: '2018-03-15',
            location: 'Turbine Hall - Unit 1',
            status: 'pending_repair',
            system: 'Turbine System'
          }
        ]
      },
      {
        id: 'generator-1',
        name: 'Generator',
        model: 'GEN-600-3PH',
        manufacturer: 'Dongfang Electric',
        installDate: '2018-03-15',
        location: 'Generator Hall - Unit 1',
        status: 'operational',
        ratedPower: '600 MW',
        serviceLife: '30 years',
        system: 'Electrical System',
        children: [
          {
            id: 'exciter-1',
            name: 'Exciter System',
            model: 'EXC-600',
            manufacturer: 'ABB',
            installDate: '2018-03-15',
            location: 'Generator Hall - Unit 1',
            status: 'operational',
            system: 'Electrical System'
          },
          {
            id: 'cooling-1',
            name: 'Cooling System',
            model: 'GCS-600',
            manufacturer: 'Dongfang Electric',
            installDate: '2018-03-15',
            location: 'Generator Hall - Unit 1',
            status: 'operational',
            system: 'Cooling System'
          }
        ]
      },
      {
        id: 'boiler-1',
        name: 'Boiler',
        model: 'BLR-2000T',
        manufacturer: 'Wuhan Boiler',
        installDate: '2018-02-10',
        location: 'Boiler House - Unit 1',
        status: 'operational',
        system: 'Boiler System',
        children: [
          {
            id: 'feedpump-1',
            name: 'Boiler Feed Pump',
            model: 'BFP-2000',
            manufacturer: 'Shenyang Pumps',
            installDate: '2018-02-10',
            location: 'Boiler House - Unit 1',
            status: 'under_repair',
            system: 'Boiler System'
          }
        ]
      }
    ]
  },
  {
    id: 'unit-2',
    name: 'Unit 2 - 600MW',
    model: 'U600-Gen5',
    manufacturer: 'Shanghai Electric',
    installDate: '2019-08-20',
    location: 'Main Building - Unit 2',
    status: 'operational',
    system: 'Power Generation Unit',
    children: [
      {
        id: 'turbine-2',
        name: 'Steam Turbine',
        model: 'ST-600-HP',
        manufacturer: 'Harbin Electric',
        installDate: '2019-08-20',
        location: 'Turbine Hall - Unit 2',
        status: 'operational',
        ratedPower: '600 MW',
        serviceLife: '30 years',
        system: 'Turbine System'
      }
    ]
  },
  {
    id: 'transformer-1',
    name: 'Main Transformer T1',
    model: 'TRF-750MVA',
    manufacturer: 'Baoding Transformer',
    installDate: '2018-01-15',
    location: 'Transformer Yard',
    status: 'operational',
    ratedPower: '750 MVA',
    serviceLife: '25 years',
    system: 'Electrical System'
  }
];

const statusConfig: Record<EquipmentStatus, { label: string; color: string }> = {
  operational: { label: 'Operational', color: 'bg-green-100 text-green-700' },
  standby: { label: 'Standby', color: 'bg-blue-100 text-blue-700' },
  pending_repair: { label: 'Pending Repair', color: 'bg-orange-100 text-orange-700' },
  under_repair: { label: 'Under Repair', color: 'bg-red-100 text-red-700' },
  scrapped: { label: 'Scrapped', color: 'bg-gray-100 text-gray-700' }
};

function EquipmentTreeNode({ equipment, level = 0 }: { equipment: Equipment; level?: number }) {
  const [expanded, setExpanded] = useState(level === 0);
  const hasChildren = equipment.children && equipment.children.length > 0;

  return (
    <div>
      <div 
        className={`flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer`}
        style={{ paddingLeft: `${level * 24 + 12}px` }}
      >
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="flex-shrink-0">
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        ) : (
          <div className="w-4" />
        )}
        
        <div className="flex-1 grid grid-cols-5 gap-4 items-center">
          <div>
            <p className="text-sm text-slate-900">{equipment.name}</p>
            <p className="text-xs text-slate-500">{equipment.model}</p>
          </div>
          <div className="text-sm text-slate-600">{equipment.manufacturer}</div>
          <div className="text-sm text-slate-600">{equipment.system}</div>
          <div className="text-sm text-slate-600 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {equipment.location}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={statusConfig[equipment.status].color}>
              {statusConfig[equipment.status].label}
            </Badge>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Eye className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Equipment Details - {equipment.name}</DialogTitle>
                </DialogHeader>
                <EquipmentDetails equipment={equipment} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
      
      {hasChildren && expanded && (
        <div>
          {equipment.children!.map(child => (
            <EquipmentTreeNode key={child.id} equipment={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

function EquipmentDetails({ equipment }: { equipment: Equipment }) {
  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Basic Info</TabsTrigger>
        <TabsTrigger value="documents">Documents</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="basic" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Equipment Name</Label>
            <p className="text-sm text-slate-900 mt-1">{equipment.name}</p>
          </div>
          <div>
            <Label>Model</Label>
            <p className="text-sm text-slate-900 mt-1">{equipment.model}</p>
          </div>
          <div>
            <Label>Manufacturer</Label>
            <p className="text-sm text-slate-900 mt-1">{equipment.manufacturer}</p>
          </div>
          <div>
            <Label>Installation Date</Label>
            <p className="text-sm text-slate-900 mt-1">{equipment.installDate}</p>
          </div>
          <div>
            <Label>System</Label>
            <p className="text-sm text-slate-900 mt-1">{equipment.system}</p>
          </div>
          <div>
            <Label>Location</Label>
            <p className="text-sm text-slate-900 mt-1">{equipment.location}</p>
          </div>
          {equipment.ratedPower && (
            <div>
              <Label>Rated Power</Label>
              <p className="text-sm text-slate-900 mt-1">{equipment.ratedPower}</p>
            </div>
          )}
          {equipment.serviceLife && (
            <div>
              <Label>Service Life</Label>
              <p className="text-sm text-slate-900 mt-1">{equipment.serviceLife}</p>
            </div>
          )}
          <div>
            <Label>Status</Label>
            <Badge className={`${statusConfig[equipment.status].color} mt-1`}>
              {statusConfig[equipment.status].label}
            </Badge>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <Label>Equipment Image</Label>
          <ImageWithFallback 
            src="https://images.unsplash.com/photo-1635145613344-3e59b1e8afd0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3dlciUyMHBsYW50JTIwdHVyYmluZXxlbnwxfHx8fDE3NjE1NTY1Mzl8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt={equipment.name}
            className="w-full h-48 object-cover rounded-lg mt-2"
          />
        </div>
      </TabsContent>
      
      <TabsContent value="documents" className="space-y-3">
        {['Technical Manual', 'Maintenance Handbook', 'Installation Drawing', 'Specification Sheet'].map((doc, index) => (
          <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-slate-900">{doc} - {equipment.model}</p>
                <p className="text-xs text-slate-500">Version 2.{index + 1} • Updated Oct {15 + index}, 2025</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">
                <Eye className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </TabsContent>
      
      <TabsContent value="history" className="space-y-3">
        {[
          { date: '2025-10-15', event: 'Status changed to Operational', user: 'Zhang Wei' },
          { date: '2025-10-10', event: 'Class A Maintenance completed', user: 'Li Ming' },
          { date: '2025-09-25', event: 'Routine inspection completed', user: 'Wang Fang' },
          { date: '2025-09-01', event: 'Minor repair completed', user: 'Chen Jian' }
        ].map((record, index) => (
          <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
            <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
            <div className="flex-1">
              <p className="text-sm text-slate-900">{record.event}</p>
              <p className="text-xs text-slate-500 mt-1">{record.date} • {record.user}</p>
            </div>
          </div>
        ))}
      </TabsContent>
    </Tabs>
  );
}

export function EquipmentLedger() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search equipment by name, model, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Equipment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Equipment</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Equipment Name</Label>
                  <Input placeholder="Enter equipment name" />
                </div>
                <div>
                  <Label>Model</Label>
                  <Input placeholder="Enter model number" />
                </div>
                <div>
                  <Label>System</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select system" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="turbine">Turbine System</SelectItem>
                      <SelectItem value="electrical">Electrical System</SelectItem>
                      <SelectItem value="boiler">Boiler System</SelectItem>
                      <SelectItem value="cooling">Cooling System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">Cancel</Button>
                  <Button>Add Equipment</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Equipment Tree */}
      <Card className="p-4">
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-4 px-3 pb-3 border-b">
            <div className="text-sm text-slate-600">Equipment Name</div>
            <div className="text-sm text-slate-600">Manufacturer</div>
            <div className="text-sm text-slate-600">System</div>
            <div className="text-sm text-slate-600">Location</div>
            <div className="text-sm text-slate-600">Status</div>
          </div>
        </div>
        <div className="space-y-1">
          {equipmentData.map(equipment => (
            <EquipmentTreeNode key={equipment.id} equipment={equipment} />
          ))}
        </div>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Operational</p>
              <p className="text-2xl text-slate-900">156</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Pending Repair</p>
              <p className="text-2xl text-slate-900">8</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Under Repair</p>
              <p className="text-2xl text-slate-900">3</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Assets</p>
              <p className="text-2xl text-slate-900">167</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
