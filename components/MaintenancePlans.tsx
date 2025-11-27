import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Calendar as CalendarIcon, Plus, CheckCircle2, XCircle, Clock, AlertCircle, Users, FileText } from 'lucide-react';

type PlanStatus = 'draft' | 'pending_approval' | 'approved' | 'in_progress' | 'completed' | 'rejected';

type MaintenancePlan = {
  id: string;
  title: string;
  type: string;
  equipment: string;
  scheduledDate: string;
  duration: string;
  status: PlanStatus;
  assignedTo: string;
  approvalLevel: number;
  progress: number;
  description: string;
};

const plans: MaintenancePlan[] = [
  {
    id: 'MP-2025-001',
    title: 'Unit 1 Turbine - Class A Maintenance',
    type: 'Class A',
    equipment: 'Steam Turbine ST-600-HP',
    scheduledDate: '2025-11-05',
    duration: '7 days',
    status: 'approved',
    assignedTo: 'Team A - Li Ming',
    approvalLevel: 3,
    progress: 0,
    description: 'Comprehensive Class A maintenance including rotor inspection, bearing replacement, and efficiency testing.'
  },
  {
    id: 'MP-2025-002',
    title: 'Generator Cooling System - Minor Repair',
    type: 'Minor Repair',
    equipment: 'Cooling System GCS-600',
    scheduledDate: '2025-10-28',
    duration: '2 days',
    status: 'in_progress',
    assignedTo: 'Team B - Wang Fang',
    approvalLevel: 2,
    progress: 65,
    description: 'Replace cooling water pump seals and clean heat exchanger.'
  },
  {
    id: 'MP-2025-003',
    title: 'Main Transformer - Preventive Maintenance',
    type: 'Preventive',
    equipment: 'Main Transformer T1',
    scheduledDate: '2025-11-15',
    duration: '3 days',
    status: 'pending_approval',
    assignedTo: 'Team C - Chen Jian',
    approvalLevel: 1,
    progress: 0,
    description: 'Oil analysis, insulation testing, and bushing inspection.'
  },
  {
    id: 'MP-2025-004',
    title: 'Boiler Feed Pump - Class B Maintenance',
    type: 'Class B',
    equipment: 'Boiler Feed Pump BFP-2000',
    scheduledDate: '2025-10-30',
    duration: '5 days',
    status: 'in_progress',
    assignedTo: 'Team A - Li Ming',
    approvalLevel: 3,
    progress: 40,
    description: 'Impeller inspection, shaft alignment, vibration analysis, and seal replacement.'
  },
  {
    id: 'MP-2025-005',
    title: 'Emergency Generator - Routine Inspection',
    type: 'Routine',
    equipment: 'Emergency Gen EG-500',
    scheduledDate: '2025-11-01',
    duration: '1 day',
    status: 'approved',
    assignedTo: 'Team D - Liu Hong',
    approvalLevel: 2,
    progress: 0,
    description: 'Monthly routine inspection and load testing.'
  }
];

const statusConfig: Record<PlanStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  draft: { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: FileText },
  pending_approval: { label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
  completed: { label: 'Completed', color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle }
};

function PlanCard({ plan }: { plan: MaintenancePlan }) {
  const StatusIcon = statusConfig[plan.status].icon;
  
  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-slate-900">{plan.title}</h3>
            <Badge variant="outline">{plan.type}</Badge>
          </div>
          <p className="text-sm text-slate-600">{plan.equipment}</p>
        </div>
        <Badge className={statusConfig[plan.status].color}>
          <StatusIcon className="w-3 h-3 mr-1" />
          {statusConfig[plan.status].label}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <CalendarIcon className="w-4 h-4" />
          <span>{plan.scheduledDate}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Clock className="w-4 h-4" />
          <span>{plan.duration}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <Users className="w-4 h-4" />
          <span>{plan.assignedTo}</span>
        </div>
        <div className="text-slate-600">
          Approval: Level {plan.approvalLevel}/3
        </div>
      </div>

      {plan.status === 'in_progress' && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-600">Progress</span>
            <span className="text-slate-900">{plan.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${plan.progress}%` }}
            />
          </div>
        </div>
      )}
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">View Details</Button>
        </DialogTrigger>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{plan.title}</DialogTitle>
          </DialogHeader>
          <PlanDetails plan={plan} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function PlanDetails({ plan }: { plan: MaintenancePlan }) {
  return (
    <Tabs defaultValue="info" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="info">Plan Info</TabsTrigger>
        <TabsTrigger value="approval">Approval Flow</TabsTrigger>
        <TabsTrigger value="resources">Resources</TabsTrigger>
        <TabsTrigger value="tracking">Tracking</TabsTrigger>
      </TabsList>
      
      <TabsContent value="info" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Plan ID</Label>
            <p className="text-sm text-slate-900 mt-1">{plan.id}</p>
          </div>
          <div>
            <Label>Maintenance Type</Label>
            <p className="text-sm text-slate-900 mt-1">{plan.type}</p>
          </div>
          <div>
            <Label>Equipment</Label>
            <p className="text-sm text-slate-900 mt-1">{plan.equipment}</p>
          </div>
          <div>
            <Label>Scheduled Date</Label>
            <p className="text-sm text-slate-900 mt-1">{plan.scheduledDate}</p>
          </div>
          <div>
            <Label>Duration</Label>
            <p className="text-sm text-slate-900 mt-1">{plan.duration}</p>
          </div>
          <div>
            <Label>Assigned Team</Label>
            <p className="text-sm text-slate-900 mt-1">{plan.assignedTo}</p>
          </div>
        </div>
        <div>
          <Label>Description</Label>
          <p className="text-sm text-slate-700 mt-1 leading-relaxed">{plan.description}</p>
        </div>
        <div>
          <Label>Maintenance Tasks</Label>
          <ul className="mt-2 space-y-2">
            {['Pre-maintenance safety briefing and equipment isolation', 'Disassembly and component inspection', 'Parts replacement and reassembly', 'Testing and commissioning', 'Documentation and handover'].map((task, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{task}</span>
              </li>
            ))}
          </ul>
        </div>
      </TabsContent>
      
      <TabsContent value="approval" className="space-y-4">
        <div className="space-y-3">
          {[
            { level: 'Team Leader', name: 'Li Ming', status: 'approved', date: '2025-10-20 09:30', comment: 'Plan reviewed and approved' },
            { level: 'Workshop Manager', name: 'Zhang Wei', status: 'approved', date: '2025-10-21 14:15', comment: 'Resources confirmed, approved' },
            { level: 'Production Director', name: 'Wang Jun', status: plan.status === 'pending_approval' ? 'pending' : 'approved', date: plan.status === 'pending_approval' ? 'Pending' : '2025-10-22 10:00', comment: plan.status === 'pending_approval' ? 'Awaiting approval' : 'Final approval granted' }
          ].map((approval, index) => (
            <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
              <div className="flex-shrink-0 mt-1">
                {approval.status === 'approved' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                {approval.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600" />}
                {approval.status === 'rejected' && <XCircle className="w-5 h-5 text-red-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-slate-900">{approval.level}</p>
                  <Badge variant="outline" className={
                    approval.status === 'approved' ? 'bg-green-50 text-green-700' :
                    approval.status === 'pending' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-red-50 text-red-700'
                  }>
                    {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-1">{approval.name}</p>
                <p className="text-xs text-slate-500">{approval.date}</p>
                <p className="text-sm text-slate-700 mt-2 italic">&ldquo;{approval.comment}&rdquo;</p>
              </div>
            </div>
          ))}
        </div>
        {plan.status === 'pending_approval' && (
          <div className="flex gap-2 pt-4 border-t">
            <Button className="flex-1" variant="outline">
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button className="flex-1">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approve
            </Button>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="resources" className="space-y-4">
        <div>
          <h4 className="text-sm text-slate-900 mb-3">Personnel Requirements</h4>
          <div className="space-y-2">
            {[
              { role: 'Senior Technician', count: 2, skills: 'Turbine maintenance certification' },
              { role: 'Electrician', count: 1, skills: 'High voltage license' },
              { role: 'Safety Officer', count: 1, skills: 'Safety supervision' }
            ].map((req, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-900">{req.role} × {req.count}</p>
                  <p className="text-xs text-slate-500">{req.skills}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm text-slate-900 mb-3">Spare Parts & Materials</h4>
          <div className="space-y-2">
            {[
              { item: 'Turbine Bearing Set', quantity: '2 sets', status: 'In Stock' },
              { item: 'Seal Kit', quantity: '1 set', status: 'In Stock' },
              { item: 'Lubricating Oil', quantity: '50L', status: 'Ordered' }
            ].map((part, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-slate-900">{part.item}</p>
                  <p className="text-xs text-slate-500">Qty: {part.quantity}</p>
                </div>
                <Badge variant="outline" className={part.status === 'In Stock' ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}>
                  {part.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm text-slate-900 mb-3">Tools & Equipment</h4>
          <div className="space-y-2">
            {['Torque Wrench Set', 'Alignment Equipment', 'Vibration Analyzer', 'Hoisting Equipment'].map((tool, i) => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-slate-900">{tool}</p>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="tracking" className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm text-slate-900">Overall Progress</h4>
            <span className="text-sm text-slate-900">{plan.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all" 
              style={{ width: `${plan.progress}%` }}
            />
          </div>
        </div>
        <div>
          <h4 className="text-sm text-slate-900 mb-3">Milestones</h4>
          <div className="space-y-3">
            {[
              { name: 'Safety briefing completed', completed: true, date: '2025-10-27 08:00' },
              { name: 'Equipment isolation and lockout', completed: true, date: '2025-10-27 09:30' },
              { name: 'Component disassembly', completed: plan.progress > 40, date: plan.progress > 40 ? '2025-10-27 14:00' : 'In Progress' },
              { name: 'Inspection and testing', completed: false, date: 'Pending' },
              { name: 'Final acceptance', completed: false, date: 'Pending' }
            ].map((milestone, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {milestone.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm ${milestone.completed ? 'text-slate-900' : 'text-slate-500'}`}>
                    {milestone.name}
                  </p>
                  <p className="text-xs text-slate-500">{milestone.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export function MaintenancePlans() {
  const [filter, setFilter] = useState<string>('all');

  const filteredPlans = filter === 'all' 
    ? plans 
    : plans.filter(plan => plan.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All Plans ({plans.length})
            </Button>
            <Button
              variant={filter === 'pending_approval' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending_approval')}
            >
              Pending Approval
            </Button>
            <Button
              variant={filter === 'in_progress' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('in_progress')}
            >
              In Progress
            </Button>
            <Button
              variant={filter === 'approved' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('approved')}
            >
              Approved
            </Button>
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Plan
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Maintenance Plan</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Plan Title</Label>
                  <Input placeholder="Enter maintenance plan title" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Maintenance Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="class-a">Class A Maintenance</SelectItem>
                        <SelectItem value="class-b">Class B Maintenance</SelectItem>
                        <SelectItem value="minor">Minor Repair</SelectItem>
                        <SelectItem value="preventive">Preventive Maintenance</SelectItem>
                        <SelectItem value="routine">Routine Inspection</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Equipment</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select equipment" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="turbine-1">Steam Turbine ST-600-HP</SelectItem>
                        <SelectItem value="gen-1">Generator GEN-600-3PH</SelectItem>
                        <SelectItem value="boiler-1">Boiler BLR-2000T</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Scheduled Date</Label>
                    <Input type="date" />
                  </div>
                  <div>
                    <Label>Duration (days)</Label>
                    <Input type="number" placeholder="Enter duration" />
                  </div>
                </div>
                <div>
                  <Label>Assign To</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="team-a">Team A - Li Ming</SelectItem>
                      <SelectItem value="team-b">Team B - Wang Fang</SelectItem>
                      <SelectItem value="team-c">Team C - Chen Jian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea placeholder="Enter detailed maintenance plan description..." rows={4} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">Save as Draft</Button>
                  <Button>Submit for Approval</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPlans.map(plan => (
          <PlanCard key={plan.id} plan={plan} />
        ))}
      </div>

      {filteredPlans.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-slate-500">No maintenance plans found</p>
        </Card>
      )}
    </div>
  );
}
