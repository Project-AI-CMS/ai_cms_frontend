'use client'
import { useState } from 'react';
import { Login } from './components/Login';
import { UserProfile } from './components/UserProfile';
import { Dashboard } from './components/Dashboard';
import { EquipmentLedger } from './components/EquipmentLedger';
import { MaintenancePlans } from './components/MaintenancePlans';
import { MaintenanceExecution } from './components/MaintenanceExecution';
import { SpareParts } from './components/SpareParts';
import { DefectManagement } from './components/DefectManagement';
import { SafetyQuality } from './components/SafetyQuality';
import { HRManagement } from './components/HRManagement';
import { CostAnalysis } from './components/CostAnalysis';
import { SystemSettings } from './components/SystemSettings';
import { AssetMonitoring } from './components/AssetMonitoring';
import { AlertsNotifications } from './components/AlertsNotifications';
import { 
  LayoutDashboard, 
  Database, 
  Calendar, 
  ClipboardList, 
  Package, 
  AlertTriangle, 
  Shield, 
  Users, 
  DollarSign, 
  Settings,
  Menu,
  X,
  User,
  LogOut,
  Activity,
  Bell
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';

type UserInfo = {
  name: string;
  role: string;
  email: string;
};

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  component: React.ComponentType<any>;
  roles?: string[]; // Roles that can access this page
};

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, component: Dashboard },
  { id: 'monitoring', label: 'Asset Monitoring', icon: Activity, component: AssetMonitoring },
  { id: 'alerts', label: 'Alerts & Notifications', icon: Bell, component: AlertsNotifications },
  { id: 'equipment', label: 'Asset Management', icon: Database, component: EquipmentLedger },
  { id: 'plans', label: 'Maintenance Plans', icon: Calendar, component: MaintenancePlans },
  { id: 'execution', label: 'Maintenance Execution', icon: ClipboardList, component: MaintenanceExecution },
  { id: 'spareparts', label: 'Spare Parts', icon: Package, component: SpareParts },
  { id: 'defects', label: 'Defect Management', icon: AlertTriangle, component: DefectManagement },
  { id: 'safety', label: 'Safety & Quality', icon: Shield, component: SafetyQuality },
  { id: 'hr', label: 'HR & Teams', icon: Users, component: HRManagement, roles: ['Administrator', 'Maintenance Manager'] },
  { id: 'cost', label: 'Cost Analysis', icon: DollarSign, component: CostAnalysis, roles: ['Administrator', 'Maintenance Manager'] },
  { id: 'settings', label: 'System Settings', icon: Settings, component: SystemSettings, roles: ['Administrator'] },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showProfile, setShowProfile] = useState(false);

  const handleLogin = (user: UserInfo) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    setShowProfile(false);
  };

  // Filter menu items based on user role
  const filteredMenuItems = currentUser 
    ? menuItems.filter(item => !item.roles || item.roles.includes(currentUser.role))
    : menuItems;

  // Show login if not authenticated
  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Show user profile if requested
  if (showProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button variant="ghost" onClick={() => setShowProfile(false)}>
              ← Back to Dashboard
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <main className="p-6">
          <UserProfile user={currentUser} />
        </main>
      </div>
    );
  }

  const ActiveComponent = filteredMenuItems.find(item => item.id === activeTab)?.component || Dashboard;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-0'} bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}>
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl text-white">Equipment Maintenance System</h1>
          <p className="text-sm text-slate-400 mt-1">Power Plant Operations</p>
        </div>
        
        <nav className="flex-1 p-4 overflow-y-auto">
          {filteredMenuItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeTab === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.id === 'alerts' && (
                  <Badge className="ml-auto bg-red-600 text-white">2</Badge>
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button 
            onClick={() => setShowProfile(true)}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm">{currentUser.name.split(' ').map(n => n[0]).join('')}</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-white">{currentUser.name}</p>
              <p className="text-xs text-slate-400">{currentUser.role}</p>
            </div>
            <User className="w-4 h-4 text-slate-400" />
          </button>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 mt-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
              <div>
                <h2 className="text-slate-900">
                  {filteredMenuItems.find(item => item.id === activeTab)?.label}
                </h2>
                <p className="text-sm text-slate-500">
                  {activeTab === 'monitoring' ? 'Real-time asset health monitoring and predictions' :
                   activeTab === 'alerts' ? 'System alerts and notifications management' :
                   activeTab === 'equipment' ? 'Comprehensive asset and equipment management' :
                   'Manage and monitor equipment maintenance operations'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setActiveTab('alerts')}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
              </button>
              <div className="text-right">
                <p className="text-sm text-slate-600">October 27, 2025</p>
                <p className="text-xs text-slate-500">15:30 CST</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          <ActiveComponent user={currentUser} />
        </main>
      </div>
    </div>
  );
}
