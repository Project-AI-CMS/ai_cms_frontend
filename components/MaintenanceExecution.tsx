import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Shield, 
  CheckCircle2, 
  Clock, 
  Camera, 
  Upload,
  AlertTriangle,
  Edit,
  QrCode
} from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

type WorkPermit = {
  id: string;
  type: string;
  equipment: string;
  location: string;
  startDate: string;
  endDate: string;
  status: 'draft' | 'active' | 'suspended' | 'closed';
  issuedBy: string;
  approvedBy: string;
  safetyMeasures: string[];
  workers: string[];
};

const workPermits: WorkPermit[] = [
  {
    id: 'WP-2025-H-0045',
    type: 'Thermal Mechanical Work Permit',
    equipment: 'Boiler Feed Pump BFP-2000',
    location: 'Boiler House - Unit 1',
    startDate: '2025-10-27 08:00',
    endDate: '2025-10-30 18:00',
    status: 'active',
    issuedBy: 'Zhang Wei',
    approvedBy: 'Wang Jun',
    safetyMeasures: ['Equipment isolation', 'Lockout/Tagout', 'Gas detection', 'Fire extinguisher ready'],
    workers: ['Li Ming', 'Chen Jian', 'Zhou Yu']
  },
  {
    id: 'WP-2025-E-0032',
    type: 'Electrical Work Permit',
    equipment: 'Generator Exciter EXC-600',
    location: 'Generator Hall - Unit 1',
    startDate: '2025-10-28 09:00',
    endDate: '2025-10-28 17:00',
    status: 'active',
    issuedBy: 'Liu Hong',
    approvedBy: 'Wang Jun',
    safetyMeasures: ['Power isolation', 'Voltage testing', 'Grounding', 'Insulated tools'],
    workers: ['Wang Fang', 'Zhao Lei']
  }
];

const sops = [
  {
    id: 'SOP-TB-001',
    title: 'Turbine Rotor Inspection Procedure',
    equipment: 'Steam Turbine',
    steps: 8,
    lastUpdated: '2025-08-15'
  },
  {
    id: 'SOP-BP-002',
    title: 'Boiler Feed Pump Maintenance Procedure',
    equipment: 'Boiler Feed Pump',
    steps: 12,
    lastUpdated: '2025-09-10'
  },
  {
    id: 'SOP-GEN-003',
    title: 'Generator Cooling System Service',
    equipment: 'Generator',
    steps: 6,
    lastUpdated: '2025-10-01'
  }
];

const maintenanceTasks = [
  {
    id: 'MT-001',
    title: 'Boiler Feed Pump - Impeller Inspection',
    permit: 'WP-2025-H-0045',
    progress: 65,
    currentStep: 'Disassembly and inspection',
    assignedTo: 'Li Ming',
    photos: 3,
    issues: 1
  },
  {
    id: 'MT-002',
    title: 'Generator Cooling - Water Pump Seal Replacement',
    permit: 'WP-2025-E-0032',
    progress: 80,
    currentStep: 'Seal installation',
    assignedTo: 'Wang Fang',
    photos: 5,
    issues: 0
  }
];

function WorkPermitCard({ permit }: { permit: WorkPermit }) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    active: 'bg-green-100 text-green-700',
    suspended: 'bg-orange-100 text-orange-700',
    closed: 'bg-slate-100 text-slate-700'
  };

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-slate-900">{permit.id}</h3>
            <Badge className={statusColors[permit.status]}>
              {permit.status.charAt(0).toUpperCase() + permit.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-slate-600">{permit.type}</p>
        </div>
        <Button variant="outline" size="sm">
          <FileText className="w-4 h-4 mr-2" />
          View
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">Equipment:</span>
          <span className="text-slate-900">{permit.equipment}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Location:</span>
          <span className="text-slate-900">{permit.location}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Duration:</span>
          <span className="text-slate-900">{permit.startDate.split(' ')[0]} - {permit.endDate.split(' ')[0]}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Issued by:</span>
          <span className="text-slate-900">{permit.issuedBy}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-slate-600 mb-2">Safety Measures:</p>
        <div className="flex flex-wrap gap-1">
          {permit.safetyMeasures.slice(0, 3).map((measure, i) => (
            <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700">
              {measure}
            </Badge>
          ))}
          {permit.safetyMeasures.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{permit.safetyMeasures.length - 3} more
            </Badge>
          )}
        </div>
      </div>
    </Card>
  );
}

function MaintenanceTaskCard({ task }: { task: typeof maintenanceTasks[0] }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-slate-900 mb-1">{task.title}</h3>
          <p className="text-sm text-slate-600">Work Permit: {task.permit}</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <Edit className="w-4 h-4 mr-2" />
              Update
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Update Maintenance Progress - {task.id}</DialogTitle>
            </DialogHeader>
            <ProgressUpdateForm task={task} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-slate-600">Progress</span>
            <span className="text-slate-900">{task.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Current Step:</span>
          <span className="text-slate-900">{task.currentStep}</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600">Assigned To:</span>
          <span className="text-slate-900">{task.assignedTo}</span>
        </div>

        <div className="flex items-center gap-4 pt-3 border-t text-sm">
          <div className="flex items-center gap-1 text-slate-600">
            <Camera className="w-4 h-4" />
            <span>{task.photos} photos</span>
          </div>
          {task.issues > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              <span>{task.issues} issue</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function ProgressUpdateForm({ task }: { task: typeof maintenanceTasks[0] }) {
  return (
    <Tabs defaultValue="progress" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="progress">Progress</TabsTrigger>
        <TabsTrigger value="photos">Photos</TabsTrigger>
        <TabsTrigger value="issues">Issues</TabsTrigger>
      </TabsList>

      <TabsContent value="progress" className="space-y-4">
        <div>
          <Label>Current Progress (%)</Label>
          <input 
            type="range" 
            min="0" 
            max="100" 
            defaultValue={task.progress}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer mt-2"
          />
          <p className="text-sm text-slate-600 mt-1">Current: {task.progress}%</p>
        </div>

        <div>
          <Label>Current Step/Activity</Label>
          <Textarea 
            placeholder="Describe the current work being performed..."
            defaultValue={task.currentStep}
            rows={3}
          />
        </div>

        <div>
          <Label>Work Summary</Label>
          <Textarea 
            placeholder="Summarize work completed today..."
            rows={4}
          />
        </div>

        <div>
          <Label>Next Steps</Label>
          <Textarea 
            placeholder="Describe planned work for next session..."
            rows={3}
          />
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline">Save Draft</Button>
          <Button>Submit Update</Button>
        </div>
      </TabsContent>

      <TabsContent value="photos" className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-slate-600 mb-2">Upload photos of work progress</p>
          <Button variant="outline" size="sm">
            <Camera className="w-4 h-4 mr-2" />
            Take Photo / Upload
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="relative group">
              <ImageWithFallback 
                src="https://images.unsplash.com/photo-1759692072150-166d6387c616?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZXF1aXBtZW50JTIwbWFpbnRlbmFuY2V8ZW58MXx8fHwxNzYxNTU2NTQwfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                alt="Maintenance photo"
                className="w-full h-32 object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                <Button variant="secondary" size="sm">View</Button>
              </div>
              <p className="text-xs text-slate-500 mt-1">Photo {i} - Oct 27, 10:3{i} AM</p>
            </div>
          ))}
        </div>
      </TabsContent>

      <TabsContent value="issues" className="space-y-4">
        <div>
          <Label>Report Issue or Defect</Label>
          <Textarea 
            placeholder="Describe any issues, defects, or concerns discovered during maintenance..."
            rows={4}
          />
        </div>

        <div>
          <Label>Severity</Label>
          <div className="flex gap-2 mt-2">
            {['Low', 'Medium', 'High', 'Critical'].map((severity) => (
              <Button key={severity} variant="outline" size="sm">
                {severity}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <Label>Required Action</Label>
          <Textarea 
            placeholder="Describe required corrective actions..."
            rows={3}
          />
        </div>

        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline">Cancel</Button>
          <Button>
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report Issue
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export function MaintenanceExecution() {
  const [activeTab, setActiveTab] = useState('permits');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'permits' ? 'default' : 'outline'}
            onClick={() => setActiveTab('permits')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Work Permits
          </Button>
          <Button
            variant={activeTab === 'tasks' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tasks')}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Active Tasks
          </Button>
          <Button
            variant={activeTab === 'sops' ? 'default' : 'outline'}
            onClick={() => setActiveTab('sops')}
          >
            <FileText className="w-4 h-4 mr-2" />
            SOPs
          </Button>
        </div>
      </Card>

      {/* Work Permits */}
      {activeTab === 'permits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Active Work Permits</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Work Permit
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Work Permit</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Permit Type</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <Button variant="outline" className="justify-start">
                        Thermal Mechanical
                      </Button>
                      <Button variant="outline" className="justify-start">
                        Electrical Work
                      </Button>
                      <Button variant="outline" className="justify-start">
                        Hot Work
                      </Button>
                      <Button variant="outline" className="justify-start">
                        Confined Space
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label>Equipment</Label>
                    <Textarea placeholder="Enter equipment details..." rows={2} />
                  </div>
                  <div>
                    <Label>Safety Measures</Label>
                    <div className="space-y-2 mt-2">
                      {['Equipment isolation', 'Lockout/Tagout', 'Gas detection', 'Fire safety'].map((measure) => (
                        <label key={measure} className="flex items-center gap-2">
                          <input type="checkbox" className="rounded" />
                          <span className="text-sm text-slate-700">{measure}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Permit</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workPermits.map(permit => (
              <WorkPermitCard key={permit.id} permit={permit} />
            ))}
          </div>
        </div>
      )}

      {/* Active Tasks */}
      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Ongoing Maintenance Tasks</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceTasks.map(task => (
              <MaintenanceTaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* SOPs */}
      {activeTab === 'sops' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Standard Operating Procedures</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {sops.map(sop => (
              <Card key={sop.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-slate-900">{sop.title}</h3>
                      <Badge variant="outline">{sop.id}</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">Equipment: {sop.equipment}</p>
                    <p className="text-xs text-slate-500">
                      {sop.steps} steps • Last updated: {sop.lastUpdated}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <QrCode className="w-4 h-4 mr-2" />
                      QR Code
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      View SOP
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
