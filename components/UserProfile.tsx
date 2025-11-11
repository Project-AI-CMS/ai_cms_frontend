import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar,
  Lock,
  Activity,
  Award,
  Clock
} from 'lucide-react';

type UserProfileProps = {
  user: {
    name: string;
    role: string;
    email: string;
  };
};

export function UserProfile({ user }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: '+86 138 0000 1234',
    location: 'Shanghai, China',
    department: 'Maintenance Department',
    employeeId: 'EMP-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    joinDate: '2020-03-15'
  });

  const sessionHistory = [
    { date: '2025-10-27 15:30', device: 'Chrome on Windows', location: 'Shanghai, China', status: 'Active' },
    { date: '2025-10-27 08:15', device: 'Chrome on Windows', location: 'Shanghai, China', status: 'Ended' },
    { date: '2025-10-26 09:00', device: 'Chrome on Windows', location: 'Shanghai, China', status: 'Ended' },
    { date: '2025-10-25 14:20', device: 'Mobile App on Android', location: 'Shanghai, China', status: 'Ended' }
  ];

  const certifications = [
    { name: 'Turbine Specialist Certification', issuer: 'Shanghai Electric', date: '2023-03-15', expiry: '2026-03-15', status: 'valid' },
    { name: 'High Pressure Systems License', issuer: 'National Safety Board', date: '2022-12-20', expiry: '2025-12-20', status: 'expiring' },
    { name: 'Safety Supervisor Certificate', issuer: 'Industrial Safety Council', date: '2023-06-10', expiry: '2026-06-10', status: 'valid' }
  ];

  const activityLog = [
    { action: 'Updated maintenance plan MP-2025-001', timestamp: '2025-10-27 14:30' },
    { action: 'Approved work permit WP-2025-H-0045', timestamp: '2025-10-27 11:15' },
    { action: 'Completed safety inspection JSA-2025-046', timestamp: '2025-10-26 16:20' },
    { action: 'Created defect report DEF-2025-089', timestamp: '2025-10-26 09:45' },
    { action: 'Submitted spare parts request REQ-2025-045', timestamp: '2025-10-25 13:30' }
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    // In real app, save to backend
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start gap-6">
          <Avatar className="w-24 h-24">
            <AvatarFallback className="text-2xl bg-blue-600 text-white">
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl text-slate-900 mb-1">{profileData.name}</h1>
                <p className="text-slate-600 mb-2">{user.role}</p>
                <Badge variant="outline" className="bg-green-50 text-green-700">
                  Active
                </Badge>
              </div>
              <Button 
                variant={isEditing ? 'default' : 'outline'}
                onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
              >
                {isEditing ? 'Save Changes' : 'Edit Profile'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Mail className="w-4 h-4" />
                <span>{profileData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Phone className="w-4 h-4" />
                <span>{profileData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <MapPin className="w-4 h-4" />
                <span>{profileData.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Briefcase className="w-4 h-4" />
                <span>{profileData.department}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <User className="w-4 h-4" />
                <span>ID: {profileData.employeeId}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>Joined {profileData.joinDate}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabbed Content */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="personal">Personal Info</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input 
                  id="name" 
                  value={profileData.name}
                  onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  value={profileData.phone}
                  onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input 
                  id="location" 
                  value={profileData.location}
                  onChange={(e) => setProfileData({...profileData, location: e.target.value})}
                  disabled={!isEditing}
                />
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input 
                  id="department" 
                  value={profileData.department}
                  disabled
                />
              </div>
              <div>
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input 
                  id="employeeId" 
                  value={profileData.employeeId}
                  disabled
                />
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">Security Settings</h3>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm text-slate-900 mb-3">Change Password</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" placeholder="Enter current password" />
                  </div>
                  <div>
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" placeholder="Enter new password" />
                  </div>
                  <div>
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" placeholder="Confirm new password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-sm text-slate-900 mb-3">Two-Factor Authentication</h4>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="text-sm text-slate-900">2FA Status</p>
                    <p className="text-xs text-slate-500">Add an extra layer of security to your account</p>
                  </div>
                  <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                    Not Enabled
                  </Badge>
                </div>
                <Button variant="outline" className="mt-3">
                  Enable 2FA
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Certifications */}
        <TabsContent value="certifications">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900">Professional Certifications</h3>
              <Button variant="outline" size="sm">
                <Award className="w-4 h-4 mr-2" />
                Add Certification
              </Button>
            </div>
            <div className="space-y-3">
              {certifications.map((cert, index) => (
                <div key={index} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="text-sm text-slate-900 mb-1">{cert.name}</h4>
                      <p className="text-xs text-slate-600">Issued by {cert.issuer}</p>
                    </div>
                    <Badge className={
                      cert.status === 'valid' ? 'bg-green-100 text-green-700' :
                      cert.status === 'expiring' ? 'bg-orange-100 text-orange-700' :
                      'bg-red-100 text-red-700'
                    }>
                      {cert.status === 'valid' ? 'Valid' : 
                       cert.status === 'expiring' ? 'Expiring Soon' : 'Expired'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>Issued: {cert.date}</span>
                    <span>•</span>
                    <span>Expires: {cert.expiry}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Activity Log */}
        <TabsContent value="activity">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-slate-900">Recent Activity</h3>
              <Button variant="outline" size="sm">
                <Activity className="w-4 h-4 mr-2" />
                Export Log
              </Button>
            </div>
            <div className="space-y-3">
              {activityLog.map((log, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{log.action}</p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {log.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>

        {/* Session History */}
        <TabsContent value="sessions">
          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">Active Sessions</h3>
            <div className="space-y-3">
              {sessionHistory.map((session, index) => (
                <div key={index} className="flex items-start justify-between p-4 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm text-slate-900">{session.device}</p>
                      <Badge variant="outline" className={
                        session.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700'
                      }>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-600">{session.location}</p>
                    <p className="text-xs text-slate-500 mt-1">{session.date}</p>
                  </div>
                  {session.status === 'Active' && (
                    <Button variant="outline" size="sm">
                      End Session
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
