import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  AlertTriangle, 
  AlertCircle,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  TrendingUp,
  Wrench
} from 'lucide-react';

type DefectLevel = 'urgent' | 'major' | 'general';
type DefectStatus = 'reported' | 'assigned' | 'in_progress' | 'resolved' | 'verified';

type Defect = {
  id: string;
  title: string;
  equipment: string;
  location: string;
  level: DefectLevel;
  status: DefectStatus;
  description: string;
  reportedBy: string;
  reportedDate: string;
  assignedTo?: string;
  dueDate?: string;
  resolution?: string;
};

const defects: Defect[] = [
  {
    id: 'DEF-2025-089',
    title: 'Generator Bearing Temperature High',
    equipment: 'Generator GEN-600-3PH',
    location: 'Generator Hall - Unit 1',
    level: 'urgent',
    status: 'in_progress',
    description: 'Bearing temperature reading 85°C, exceeding normal range of 65-75°C. Vibration levels slightly elevated.',
    reportedBy: 'Wang Fang',
    reportedDate: '2025-10-27 08:30',
    assignedTo: 'Team B - Chen Jian',
    dueDate: '2025-10-27 18:00'
  },
  {
    id: 'DEF-2025-088',
    title: 'Boiler Feed Pump Seal Leakage',
    equipment: 'Boiler Feed Pump BFP-2000',
    location: 'Boiler House - Unit 1',
    level: 'major',
    status: 'in_progress',
    description: 'Minor seal leakage observed during routine inspection. Approximately 2L/hour water loss.',
    reportedBy: 'Li Ming',
    reportedDate: '2025-10-26 14:20',
    assignedTo: 'Team A - Li Ming',
    dueDate: '2025-10-30 17:00'
  },
  {
    id: 'DEF-2025-087',
    title: 'Control Panel Display Flickering',
    equipment: 'DCS Control Panel',
    location: 'Control Room',
    level: 'general',
    status: 'assigned',
    description: 'HMI display intermittently flickering. Functionality not affected but needs attention.',
    reportedBy: 'Zhang Wei',
    reportedDate: '2025-10-26 09:15',
    assignedTo: 'Team C - Zhao Lei',
    dueDate: '2025-10-31 17:00'
  },
  {
    id: 'DEF-2025-086',
    title: 'Cooling Tower Fan Noise',
    equipment: 'Cooling Tower CT-1',
    location: 'Cooling Area',
    level: 'general',
    status: 'reported',
    description: 'Unusual noise from cooling tower fan motor. Requires inspection.',
    reportedBy: 'Liu Hong',
    reportedDate: '2025-10-25 16:45',
    dueDate: '2025-11-05 17:00'
  },
  {
    id: 'DEF-2025-085',
    title: 'Turbine Oil Filter Pressure Drop',
    equipment: 'Steam Turbine ST-600-HP',
    location: 'Turbine Hall - Unit 1',
    level: 'major',
    status: 'resolved',
    description: 'Oil filter differential pressure increased to 0.8 bar. Filter replacement required.',
    reportedBy: 'Chen Jian',
    reportedDate: '2025-10-24 11:00',
    assignedTo: 'Team A - Li Ming',
    resolution: 'Oil filter replaced. Differential pressure now 0.2 bar. System normal.'
  }
];

const defectByTypeData = [
  { name: 'Mechanical', count: 35, color: '#3b82f6' },
  { name: 'Electrical', count: 28, color: '#ef4444' },
  { name: 'Control', count: 18, color: '#f59e0b' },
  { name: 'Lubrication', count: 12, color: '#10b981' },
  { name: 'Other', count: 7, color: '#6b7280' }
];

const defectTrendData = [
  { month: 'Apr', reported: 42, resolved: 38 },
  { month: 'May', reported: 38, resolved: 40 },
  { month: 'Jun', reported: 45, resolved: 42 },
  { month: 'Jul', reported: 35, resolved: 38 },
  { month: 'Aug', reported: 40, resolved: 37 },
  { month: 'Sep', reported: 32, resolved: 35 },
  { month: 'Oct', reported: 28, resolved: 30 }
];

const levelConfig: Record<DefectLevel, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  urgent: { label: 'Urgent', color: 'bg-red-100 text-red-700', icon: AlertTriangle },
  major: { label: 'Major', color: 'bg-orange-100 text-orange-700', icon: AlertCircle },
  general: { label: 'General', color: 'bg-blue-100 text-blue-700', icon: AlertCircle }
};

const statusConfig: Record<DefectStatus, { label: string; color: string }> = {
  reported: { label: 'Reported', color: 'bg-yellow-100 text-yellow-700' },
  assigned: { label: 'Assigned', color: 'bg-blue-100 text-blue-700' },
  in_progress: { label: 'In Progress', color: 'bg-purple-100 text-purple-700' },
  resolved: { label: 'Resolved', color: 'bg-green-100 text-green-700' },
  verified: { label: 'Verified', color: 'bg-emerald-100 text-emerald-700' }
};

function DefectCard({ defect }: { defect: Defect }) {
  const LevelIcon = levelConfig[defect.level].icon;

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-slate-900">{defect.title}</h3>
            <Badge className={levelConfig[defect.level].color}>
              <LevelIcon className="w-3 h-3 mr-1" />
              {levelConfig[defect.level].label}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-1">{defect.equipment}</p>
          <p className="text-xs text-slate-500">{defect.location}</p>
        </div>
        <Badge className={statusConfig[defect.status].color}>
          {statusConfig[defect.status].label}
        </Badge>
      </div>

      <p className="text-sm text-slate-700 mb-4 line-clamp-2">{defect.description}</p>

      <div className="space-y-2 text-sm mb-4">
        <div className="flex justify-between">
          <span className="text-slate-600">Reported by:</span>
          <span className="text-slate-900">{defect.reportedBy}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">Date:</span>
          <span className="text-slate-900">{defect.reportedDate.split(' ')[0]}</span>
        </div>
        {defect.assignedTo && (
          <div className="flex justify-between">
            <span className="text-slate-600">Assigned to:</span>
            <span className="text-slate-900">{defect.assignedTo}</span>
          </div>
        )}
        {defect.dueDate && defect.status !== 'resolved' && defect.status !== 'verified' && (
          <div className="flex justify-between">
            <span className="text-slate-600">Due date:</span>
            <span className="text-slate-900">{defect.dueDate.split(' ')[0]}</span>
          </div>
        )}
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">View Details</Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{defect.title}</DialogTitle>
          </DialogHeader>
          <DefectDetails defect={defect} />
        </DialogContent>
      </Dialog>
    </Card>
  );
}

function DefectDetails({ defect }: { defect: Defect }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Badge className={levelConfig[defect.level].color}>
          {levelConfig[defect.level].label}
        </Badge>
        <Badge className={statusConfig[defect.status].color}>
          {statusConfig[defect.status].label}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <Label>Defect ID</Label>
          <p className="text-slate-900 mt-1">{defect.id}</p>
        </div>
        <div>
          <Label>Equipment</Label>
          <p className="text-slate-900 mt-1">{defect.equipment}</p>
        </div>
        <div>
          <Label>Location</Label>
          <p className="text-slate-900 mt-1">{defect.location}</p>
        </div>
        <div>
          <Label>Reported By</Label>
          <p className="text-slate-900 mt-1">{defect.reportedBy}</p>
        </div>
        <div>
          <Label>Reported Date</Label>
          <p className="text-slate-900 mt-1">{defect.reportedDate}</p>
        </div>
        {defect.assignedTo && (
          <div>
            <Label>Assigned To</Label>
            <p className="text-slate-900 mt-1">{defect.assignedTo}</p>
          </div>
        )}
        {defect.dueDate && (
          <div>
            <Label>Due Date</Label>
            <p className="text-slate-900 mt-1">{defect.dueDate}</p>
          </div>
        )}
      </div>

      <div>
        <Label>Description</Label>
        <p className="text-sm text-slate-700 mt-2 leading-relaxed">{defect.description}</p>
      </div>

      {defect.resolution && (
        <div className="border-t pt-4">
          <Label>Resolution</Label>
          <p className="text-sm text-slate-700 mt-2 leading-relaxed">{defect.resolution}</p>
        </div>
      )}

      {defect.status === 'reported' && (
        <div className="flex gap-2 pt-4 border-t">
          <Select>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Assign to team..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="team-a">Team A - Li Ming</SelectItem>
              <SelectItem value="team-b">Team B - Wang Fang</SelectItem>
              <SelectItem value="team-c">Team C - Chen Jian</SelectItem>
            </SelectContent>
          </Select>
          <Button>Assign</Button>
        </div>
      )}

      {(defect.status === 'assigned' || defect.status === 'in_progress') && (
        <div className="space-y-3 pt-4 border-t">
          <div>
            <Label>Update Status</Label>
            <Textarea placeholder="Enter work progress or resolution details..." rows={4} className="mt-2" />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              <Clock className="w-4 h-4 mr-2" />
              Update Progress
            </Button>
            <Button className="flex-1">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Mark Resolved
            </Button>
          </div>
        </div>
      )}

      {defect.status === 'resolved' && (
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" className="flex-1">Reopen</Button>
          <Button className="flex-1">
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Verify & Close
          </Button>
        </div>
      )}
    </div>
  );
}

export function DefectManagement() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterLevel, setFilterLevel] = useState<string>('all');

  const filteredDefects = defects.filter(defect => {
    const matchesStatus = filterStatus === 'all' || defect.status === filterStatus;
    const matchesLevel = filterLevel === 'all' || defect.level === filterLevel;
    return matchesStatus && matchesLevel;
  });

  const activeDefects = defects.filter(d => d.status !== 'resolved' && d.status !== 'verified').length;
  const urgentDefects = defects.filter(d => d.level === 'urgent' && d.status !== 'resolved').length;
  const resolvedThisMonth = defects.filter(d => d.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Defects</p>
              <p className="text-2xl text-slate-900">{activeDefects}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Urgent</p>
              <p className="text-2xl text-slate-900">{urgentDefects}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Resolved (Oct)</p>
              <p className="text-2xl text-slate-900">{resolvedThisMonth}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Resolution Rate</p>
              <p className="text-2xl text-slate-900">94%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Defect Trend Analysis</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={defectTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="reported" fill="#94a3b8" name="Reported" />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Defects by Type</h3>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="45%" height={250}>
              <PieChart>
                <Pie
                  data={defectByTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {defectByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {defectByTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Search defects..." className="pl-10" />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="reported">Reported</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterLevel} onValueChange={setFilterLevel}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Levels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
              <SelectItem value="major">Major</SelectItem>
              <SelectItem value="general">General</SelectItem>
            </SelectContent>
          </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Report Defect
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Report New Defect</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Defect Title</Label>
                  <Input placeholder="Brief description of the defect" />
                </div>
                <div>
                  <Label>Equipment</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select equipment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="turbine">Steam Turbine ST-600-HP</SelectItem>
                      <SelectItem value="generator">Generator GEN-600-3PH</SelectItem>
                      <SelectItem value="boiler">Boiler BLR-2000T</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Defect Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="urgent">Urgent - Immediate attention required</SelectItem>
                      <SelectItem value="major">Major - Affects operation</SelectItem>
                      <SelectItem value="general">General - Routine repair</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Detailed Description</Label>
                  <Textarea placeholder="Provide detailed description of the defect..." rows={4} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline">Cancel</Button>
                  <Button>Submit Report</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Defects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDefects.map(defect => (
          <DefectCard key={defect.id} defect={defect} />
        ))}
      </div>
    </div>
  );
}
