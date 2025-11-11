import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  User, 
  Award, 
  BookOpen, 
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  Search
} from 'lucide-react';

type Personnel = {
  id: string;
  name: string;
  position: string;
  team: string;
  skillLevel: string;
  certifications: string[];
  certExpiry: Record<string, string>;
  trainingCompleted: number;
  workload: number;
};

const personnel: Personnel[] = [
  {
    id: 'EMP-001',
    name: 'Li Ming',
    position: 'Senior Technician',
    team: 'Team A - Turbine Maintenance',
    skillLevel: 'Expert',
    certifications: ['Turbine Specialist', 'High Pressure Systems', 'Safety Supervisor'],
    certExpiry: {
      'Turbine Specialist': '2026-03-15',
      'High Pressure Systems': '2025-12-20',
      'Safety Supervisor': '2026-06-10'
    },
    trainingCompleted: 12,
    workload: 85
  },
  {
    id: 'EMP-002',
    name: 'Wang Fang',
    position: 'Electrical Engineer',
    team: 'Team B - Electrical Maintenance',
    skillLevel: 'Expert',
    certifications: ['High Voltage License', 'Electrical Safety', 'Generator Specialist'],
    certExpiry: {
      'High Voltage License': '2026-08-30',
      'Electrical Safety': '2025-11-15',
      'Generator Specialist': '2026-01-20'
    },
    trainingCompleted: 15,
    workload: 75
  },
  {
    id: 'EMP-003',
    name: 'Chen Jian',
    position: 'Mechanical Technician',
    team: 'Team A - Turbine Maintenance',
    skillLevel: 'Advanced',
    certifications: ['Boiler Operations', 'Pump Maintenance', 'Welding Class A'],
    certExpiry: {
      'Boiler Operations': '2026-02-10',
      'Pump Maintenance': '2025-10-30',
      'Welding Class A': '2026-04-15'
    },
    trainingCompleted: 10,
    workload: 90
  },
  {
    id: 'EMP-004',
    name: 'Liu Hong',
    position: 'QC Inspector',
    team: 'Team D - Quality Control',
    skillLevel: 'Advanced',
    certifications: ['Quality Inspector', 'NDT Level II', 'ISO 9001 Auditor'],
    certExpiry: {
      'Quality Inspector': '2026-05-20',
      'NDT Level II': '2025-12-01',
      'ISO 9001 Auditor': '2026-03-10'
    },
    trainingCompleted: 11,
    workload: 60
  },
  {
    id: 'EMP-005',
    name: 'Zhou Yu',
    position: 'Safety Officer',
    team: 'Team D - Safety & Training',
    skillLevel: 'Expert',
    certifications: ['Safety Engineer', 'Fire Safety', 'Emergency Response', 'Confined Space'],
    certExpiry: {
      'Safety Engineer': '2026-07-15',
      'Fire Safety': '2025-11-30',
      'Emergency Response': '2026-02-20',
      'Confined Space': '2025-12-15'
    },
    trainingCompleted: 18,
    workload: 70
  }
];

const teams = [
  { name: 'Team A - Turbine Maintenance', leader: 'Li Ming', members: 8, activeJobs: 3, specialization: 'Turbine & Boiler Systems' },
  { name: 'Team B - Electrical Maintenance', leader: 'Wang Fang', members: 6, activeJobs: 2, specialization: 'Electrical & Control Systems' },
  { name: 'Team C - Instrumentation', leader: 'Zhao Lei', members: 5, activeJobs: 1, specialization: 'Instrumentation & Automation' },
  { name: 'Team D - Quality & Safety', leader: 'Zhou Yu', members: 4, activeJobs: 5, specialization: 'QC, Safety, Training' }
];

const trainingPrograms = [
  {
    id: 'TRN-2025-015',
    title: 'Advanced Turbine Maintenance Techniques',
    type: 'Technical Skills',
    duration: '3 days',
    date: '2025-11-10',
    instructor: 'External - Shanghai Electric',
    capacity: 12,
    enrolled: 8,
    status: 'scheduled'
  },
  {
    id: 'TRN-2025-016',
    title: 'High Voltage Safety & Arc Flash Protection',
    type: 'Safety Training',
    duration: '2 days',
    date: '2025-11-15',
    instructor: 'Zhou Yu',
    capacity: 15,
    enrolled: 15,
    status: 'scheduled'
  },
  {
    id: 'TRN-2025-017',
    title: 'Predictive Maintenance & Vibration Analysis',
    type: 'Technical Skills',
    duration: '4 days',
    date: '2025-11-20',
    instructor: 'External - SKF',
    capacity: 10,
    enrolled: 6,
    status: 'scheduled'
  }
];

const attendanceData = [
  { name: 'Li Ming', present: 22, absent: 0, late: 1 },
  { name: 'Wang Fang', present: 21, absent: 1, late: 0 },
  { name: 'Chen Jian', present: 23, absent: 0, late: 0 },
  { name: 'Liu Hong', present: 20, absent: 2, late: 1 },
  { name: 'Zhou Yu', present: 22, absent: 1, late: 0 }
];

function PersonnelCard({ person }: { person: Personnel }) {
  const expiringCerts = Object.entries(person.certExpiry).filter(([_, expiry]) => {
    const daysUntilExpiry = Math.floor((new Date(expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry < 90;
  });

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-white">{person.name.split(' ').map(n => n[0]).join('')}</span>
          </div>
          <div>
            <h3 className="text-slate-900">{person.name}</h3>
            <p className="text-sm text-slate-600">{person.position}</p>
            <p className="text-xs text-slate-500">{person.id}</p>
          </div>
        </div>
        <Badge variant="outline" className={
          person.skillLevel === 'Expert' ? 'bg-purple-50 text-purple-700' :
          person.skillLevel === 'Advanced' ? 'bg-blue-50 text-blue-700' :
          'bg-green-50 text-green-700'
        }>
          {person.skillLevel}
        </Badge>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-xs text-slate-600 mb-1">Team</p>
          <p className="text-sm text-slate-900">{person.team}</p>
        </div>

        <div>
          <p className="text-xs text-slate-600 mb-2">Certifications</p>
          <div className="flex flex-wrap gap-1">
            {person.certifications.map((cert, i) => {
              const isExpiring = expiringCerts.some(([name]) => name === cert);
              return (
                <Badge 
                  key={i} 
                  variant="outline" 
                  className={`text-xs ${isExpiring ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-green-50 text-green-700'}`}
                >
                  <Award className="w-3 h-3 mr-1" />
                  {cert}
                </Badge>
              );
            })}
          </div>
        </div>

        {expiringCerts.length > 0 && (
          <div className="p-2 bg-orange-50 border border-orange-200 rounded text-xs">
            <p className="text-orange-700">
              <Clock className="w-3 h-3 inline mr-1" />
              {expiringCerts.length} certification(s) expiring soon
            </p>
          </div>
        )}

        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-600">Current Workload</span>
            <span className="text-slate-900">{person.workload}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                person.workload > 85 ? 'bg-red-500' :
                person.workload > 70 ? 'bg-orange-500' :
                'bg-green-500'
              }`}
              style={{ width: `${person.workload}%` }}
            />
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full" size="sm">View Profile</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{person.name} - Personnel Profile</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">Information</TabsTrigger>
                <TabsTrigger value="certs">Certifications</TabsTrigger>
                <TabsTrigger value="training">Training</TabsTrigger>
              </TabsList>
              
              <TabsContent value="info" className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Employee ID</Label>
                    <p className="text-sm text-slate-900 mt-1">{person.id}</p>
                  </div>
                  <div>
                    <Label>Position</Label>
                    <p className="text-sm text-slate-900 mt-1">{person.position}</p>
                  </div>
                  <div>
                    <Label>Team</Label>
                    <p className="text-sm text-slate-900 mt-1">{person.team}</p>
                  </div>
                  <div>
                    <Label>Skill Level</Label>
                    <p className="text-sm text-slate-900 mt-1">{person.skillLevel}</p>
                  </div>
                  <div>
                    <Label>Training Completed</Label>
                    <p className="text-sm text-slate-900 mt-1">{person.trainingCompleted} courses</p>
                  </div>
                  <div>
                    <Label>Current Workload</Label>
                    <p className="text-sm text-slate-900 mt-1">{person.workload}%</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="certs" className="space-y-2">
                {person.certifications.map((cert, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-slate-900">{cert}</span>
                    </div>
                    <span className="text-sm text-slate-600">
                      Expires: {person.certExpiry[cert]}
                    </span>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="training">
                <p className="text-sm text-slate-600">Training history and upcoming courses will be displayed here.</p>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
    </Card>
  );
}

export function HRManagement() {
  const [activeTab, setActiveTab] = useState('personnel');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPersonnel = personnel.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'personnel' ? 'default' : 'outline'}
            onClick={() => setActiveTab('personnel')}
          >
            <Users className="w-4 h-4 mr-2" />
            Personnel
          </Button>
          <Button
            variant={activeTab === 'teams' ? 'default' : 'outline'}
            onClick={() => setActiveTab('teams')}
          >
            <User className="w-4 h-4 mr-2" />
            Teams
          </Button>
          <Button
            variant={activeTab === 'training' ? 'default' : 'outline'}
            onClick={() => setActiveTab('training')}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Training
          </Button>
          <Button
            variant={activeTab === 'attendance' ? 'default' : 'outline'}
            onClick={() => setActiveTab('attendance')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Attendance
          </Button>
        </div>
      </Card>

      {/* Personnel */}
      {activeTab === 'personnel' && (
        <div className="space-y-4">
          <Card className="p-4">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search personnel..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Personnel
              </Button>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPersonnel.map(person => (
              <PersonnelCard key={person.id} person={person} />
            ))}
          </div>
        </div>
      )}

      {/* Teams */}
      {activeTab === 'teams' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teams.map((team, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-slate-900 mb-1">{team.name}</h3>
                    <p className="text-sm text-slate-600">Team Leader: {team.leader}</p>
                  </div>
                  <Badge variant="outline">{team.members} members</Badge>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Specialization:</span>
                    <span className="text-slate-900">{team.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Active Jobs:</span>
                    <span className="text-slate-900">{team.activeJobs}</span>
                  </div>
                </div>

                <Button variant="outline" className="w-full" size="sm">
                  View Team Details
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Training */}
      {activeTab === 'training' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Training Programs</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Schedule Training
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Schedule Training Program</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Training Title</Label>
                    <Input placeholder="Enter training title" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Type</Label>
                      <select className="w-full px-3 py-2 border rounded">
                        <option>Technical Skills</option>
                        <option>Safety Training</option>
                        <option>Compliance</option>
                        <option>Leadership</option>
                      </select>
                    </div>
                    <div>
                      <Label>Duration</Label>
                      <Input placeholder="e.g., 3 days" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Schedule</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {trainingPrograms.map(program => (
              <Card key={program.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-slate-900">{program.title}</h3>
                      <Badge variant="outline">{program.type}</Badge>
                    </div>
                    <p className="text-sm text-slate-600">{program.id}</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">
                    <Calendar className="w-3 h-3 mr-1" />
                    {program.status.charAt(0).toUpperCase() + program.status.slice(1)}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date:</span>
                    <span className="text-slate-900">{program.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Duration:</span>
                    <span className="text-slate-900">{program.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Instructor:</span>
                    <span className="text-slate-900">{program.instructor}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Enrollment:</span>
                    <span className="text-slate-900">{program.enrolled}/{program.capacity}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(program.enrolled / program.capacity) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    View Details
                  </Button>
                  {program.enrolled < program.capacity && (
                    <Button size="sm" className="flex-1">
                      Enroll Personnel
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Attendance */}
      {activeTab === 'attendance' && (
        <div className="space-y-4">
          <Card className="p-4">
            <h3 className="text-slate-900 mb-4">Monthly Attendance Summary - October 2025</h3>
            <div className="space-y-3">
              {attendanceData.map((record, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-sm">{record.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <span className="text-sm text-slate-900">{record.name}</span>
                  </div>
                  <div className="flex items-center gap-6 text-sm">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span className="text-slate-600">{record.present} days</span>
                    </div>
                    {record.absent > 0 && (
                      <div className="flex items-center gap-1">
                        <span className="text-red-600">{record.absent} absent</span>
                      </div>
                    )}
                    {record.late > 0 && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-orange-600" />
                        <span className="text-orange-600">{record.late} late</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
