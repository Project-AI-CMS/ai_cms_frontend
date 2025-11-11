import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Bell,
  Lock,
  FileText,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react';

const userRoles = [
  { 
    role: 'Administrator', 
    users: 2, 
    permissions: ['All system access', 'User management', 'System configuration', 'Data export'],
    color: 'bg-red-100 text-red-700'
  },
  { 
    role: 'Maintenance Manager', 
    users: 3, 
    permissions: ['View all data', 'Approve plans', 'Assign tasks', 'Cost reports'],
    color: 'bg-purple-100 text-purple-700'
  },
  { 
    role: 'Maintenance Worker', 
    users: 24, 
    permissions: ['View assigned tasks', 'Update progress', 'Report defects'],
    color: 'bg-blue-100 text-blue-700'
  },
  { 
    role: 'Safety Officer', 
    users: 4, 
    permissions: ['View all maintenance', 'Safety management', 'Issue work permits'],
    color: 'bg-orange-100 text-orange-700'
  },
  { 
    role: 'Viewer', 
    users: 8, 
    permissions: ['Read-only access', 'View reports'],
    color: 'bg-gray-100 text-gray-700'
  }
];

const activityLogs = [
  { timestamp: '2025-10-27 15:25:18', user: 'Zhang Wei', action: 'Approved maintenance plan MP-2025-001', type: 'approval' },
  { timestamp: '2025-10-27 14:52:43', user: 'Li Ming', action: 'Updated work progress for WP-2025-H-0045', type: 'update' },
  { timestamp: '2025-10-27 13:30:22', user: 'Wang Fang', action: 'Created new defect report DEF-2025-089', type: 'create' },
  { timestamp: '2025-10-27 11:15:08', user: 'Admin', action: 'Modified system configuration', type: 'config' },
  { timestamp: '2025-10-27 09:45:33', user: 'Liu Hong', action: 'Exported cost analysis report', type: 'export' },
  { timestamp: '2025-10-26 16:20:15', user: 'Chen Jian', action: 'Submitted spare parts request REQ-2025-045', type: 'create' },
  { timestamp: '2025-10-26 14:35:42', user: 'Zhou Yu', action: 'Completed safety inspection JSA-2025-046', type: 'completion' }
];

const dataBackups = [
  { date: '2025-10-27 02:00:00', size: '2.4 GB', status: 'success', type: 'Automatic' },
  { date: '2025-10-26 02:00:00', size: '2.3 GB', status: 'success', type: 'Automatic' },
  { date: '2025-10-25 02:00:00', size: '2.3 GB', status: 'success', type: 'Automatic' },
  { date: '2025-10-24 15:30:00', size: '2.2 GB', status: 'success', type: 'Manual' },
  { date: '2025-10-24 02:00:00', size: '2.2 GB', status: 'success', type: 'Automatic' }
];

export function SystemSettings() {
  const [activeTab, setActiveTab] = useState('permissions');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'permissions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('permissions')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Permissions
          </Button>
          <Button
            variant={activeTab === 'logs' ? 'default' : 'outline'}
            onClick={() => setActiveTab('logs')}
          >
            <FileText className="w-4 h-4 mr-2" />
            Activity Logs
          </Button>
          <Button
            variant={activeTab === 'backup' ? 'default' : 'outline'}
            onClick={() => setActiveTab('backup')}
          >
            <Database className="w-4 h-4 mr-2" />
            Data Backup
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'outline'}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </Button>
          <Button
            variant={activeTab === 'general' ? 'default' : 'outline'}
            onClick={() => setActiveTab('general')}
          >
            <Settings className="w-4 h-4 mr-2" />
            General
          </Button>
        </div>
      </Card>

      {/* Permission Management */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Role-Based Access Control</h3>
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {userRoles.map((role, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-slate-900">{role.role}</h3>
                      <Badge className={role.color}>{role.users} users</Badge>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">Permissions:</p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.map((permission, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {permission}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Role
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <h3 className="text-slate-900 mb-4">Data Access Control</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-sm text-slate-900 mb-1">Team-based Equipment Access</p>
                  <p className="text-xs text-slate-500">Users can only view equipment assigned to their team</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-sm text-slate-900 mb-1">Restrict Cost Data</p>
                  <p className="text-xs text-slate-500">Only managers and above can view cost analysis</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-sm text-slate-900 mb-1">Enable Audit Trail</p>
                  <p className="text-xs text-slate-500">Track all data modifications for compliance</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Activity Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">System Activity Logs</h3>
            <div className="flex gap-2">
              <Input type="date" className="w-40" />
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Export Logs
              </Button>
            </div>
          </div>

          <Card className="p-4">
            <div className="space-y-3">
              {activityLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    log.type === 'approval' ? 'bg-green-500' :
                    log.type === 'create' ? 'bg-blue-500' :
                    log.type === 'update' ? 'bg-yellow-500' :
                    log.type === 'config' ? 'bg-red-500' :
                    log.type === 'export' ? 'bg-purple-500' :
                    'bg-gray-500'
                  }`} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-slate-900">{log.action}</p>
                        <p className="text-xs text-slate-500 mt-1">by {log.user}</p>
                      </div>
                      <span className="text-xs text-slate-500">{log.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-blue-50 border-blue-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-blue-900 mb-1">Log Retention Policy</p>
                <p className="text-xs text-blue-700">
                  Activity logs are retained for 365 days. Logs older than this will be automatically archived.
                  Contact administrator to access archived logs.
                </p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Data Backup */}
      {activeTab === 'backup' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Data Backup & Recovery</h3>
            <Button>
              <Upload className="w-4 h-4 mr-2" />
              Create Manual Backup
            </Button>
          </div>

          <Card className="p-6">
            <h4 className="text-sm text-slate-900 mb-4">Automatic Backup Schedule</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-sm text-slate-900 mb-1">Enable Automatic Backup</p>
                  <p className="text-xs text-slate-500">Daily backup at 02:00 AM</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Backup Frequency</Label>
                  <select className="w-full px-3 py-2 border rounded mt-1">
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>
                <div>
                  <Label>Backup Time</Label>
                  <Input type="time" defaultValue="02:00" />
                </div>
              </div>
              <div>
                <Label>Retention Period</Label>
                <select className="w-full px-3 py-2 border rounded mt-1">
                  <option>7 days</option>
                  <option>30 days</option>
                  <option>90 days</option>
                  <option>365 days</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <h4 className="text-sm text-slate-900 mb-4">Backup History</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Date & Time</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Type</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Size</th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">Status</th>
                    <th className="text-right py-3 px-4 text-sm text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dataBackups.map((backup, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-slate-900">{backup.date}</td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className={
                          backup.type === 'Automatic' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                        }>
                          {backup.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">{backup.size}</td>
                      <td className="py-3 px-4">
                        <Badge className="bg-green-100 text-green-700">
                          {backup.status.charAt(0).toUpperCase() + backup.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm">
                            <Download className="w-3 h-3 mr-1" />
                            Download
                          </Button>
                          <Button variant="outline" size="sm">
                            Restore
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* Notifications */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          <h3 className="text-slate-900">Notification Settings</h3>

          <Card className="p-6">
            <h4 className="text-sm text-slate-900 mb-4">Email Notifications</h4>
            <div className="space-y-3">
              {[
                { label: 'Equipment defect reported', description: 'Get notified when new defects are reported' },
                { label: 'Maintenance plan approval required', description: 'Notification when plans need your approval' },
                { label: 'Spare parts low stock warning', description: 'Alert when parts fall below minimum level' },
                { label: 'Safety tool inspection due', description: 'Reminder for upcoming safety tool inspections' },
                { label: 'Certification expiry alert', description: 'Notification 90 days before cert expiration' },
                { label: 'Daily maintenance summary', description: 'Daily digest of maintenance activities' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="text-sm text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <Switch defaultChecked={i < 4} />
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-sm text-slate-900 mb-4">System Notifications</h4>
            <div className="space-y-3">
              {[
                { label: 'Browser notifications', description: 'Show desktop notifications in browser' },
                { label: 'Sound alerts', description: 'Play sound for urgent notifications' },
                { label: 'Mobile push notifications', description: 'Send notifications to mobile app' }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="text-sm text-slate-900">{item.label}</p>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>
                  <Switch defaultChecked={i < 2} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="space-y-4">
          <h3 className="text-slate-900">General System Settings</h3>

          <Card className="p-6">
            <h4 className="text-sm text-slate-900 mb-4">Company Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Company Name</Label>
                <Input defaultValue="Power Generation Plant - Unit 1 & 2" />
              </div>
              <div>
                <Label>Plant Location</Label>
                <Input defaultValue="Shanghai Industrial Zone" />
              </div>
              <div>
                <Label>Primary Contact</Label>
                <Input defaultValue="Zhang Wei" />
              </div>
              <div>
                <Label>Contact Email</Label>
                <Input defaultValue="maintenance@powerplant.com" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-sm text-slate-900 mb-4">Regional Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Language</Label>
                <select className="w-full px-3 py-2 border rounded mt-1">
                  <option>English</option>
                  <option>中文 (Chinese)</option>
                </select>
              </div>
              <div>
                <Label>Time Zone</Label>
                <select className="w-full px-3 py-2 border rounded mt-1">
                  <option>Asia/Shanghai (UTC+8)</option>
                  <option>Asia/Tokyo (UTC+9)</option>
                  <option>UTC</option>
                </select>
              </div>
              <div>
                <Label>Currency</Label>
                <select className="w-full px-3 py-2 border rounded mt-1">
                  <option>CNY (¥)</option>
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                </select>
              </div>
              <div>
                <Label>Date Format</Label>
                <select className="w-full px-3 py-2 border rounded mt-1">
                  <option>YYYY-MM-DD</option>
                  <option>DD/MM/YYYY</option>
                  <option>MM/DD/YYYY</option>
                </select>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h4 className="text-sm text-slate-900 mb-4">Security Settings</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-sm text-slate-900">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Require 2FA for all users</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-sm text-slate-900">Session Timeout</p>
                  <p className="text-xs text-slate-500">Auto logout after inactivity</p>
                </div>
                <select className="px-3 py-2 border rounded">
                  <option>15 minutes</option>
                  <option>30 minutes</option>
                  <option>1 hour</option>
                  <option>2 hours</option>
                </select>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div>
                  <p className="text-sm text-slate-900">Password Complexity</p>
                  <p className="text-xs text-slate-500">Enforce strong password requirements</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline">Reset to Defaults</Button>
            <Button>Save Settings</Button>
          </div>
        </div>
      )}
    </div>
  );
}
