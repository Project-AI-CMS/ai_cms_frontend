import { Card } from './ui/card';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TrendingUp,
  Wrench,
  Calendar,
  Package
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

const kpiData = [
  { title: 'Equipment in Operation', value: '156', change: '+3%', icon: Activity, color: 'text-green-600', bgColor: 'bg-green-50' },
  { title: 'Active Defects', value: '23', change: '-12%', icon: AlertCircle, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { title: 'Plans This Month', value: '47', change: '+5%', icon: Calendar, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { title: 'Spare Parts Alerts', value: '8', change: '-3', icon: Package, color: 'text-red-600', bgColor: 'bg-red-50' },
];

const planCompletionData = [
  { month: 'Apr', planned: 45, completed: 42 },
  { month: 'May', planned: 52, completed: 48 },
  { month: 'Jun', planned: 48, completed: 46 },
  { month: 'Jul', planned: 55, completed: 51 },
  { month: 'Aug', planned: 50, completed: 47 },
  { month: 'Sep', planned: 53, completed: 50 },
  { month: 'Oct', planned: 47, completed: 38 },
];

const defectByTypeData = [
  { name: 'Mechanical Wear', value: 35, color: '#3b82f6' },
  { name: 'Electrical Fault', value: 28, color: '#ef4444' },
  { name: 'Control System', value: 18, color: '#f59e0b' },
  { name: 'Lubrication', value: 12, color: '#10b981' },
  { name: 'Other', value: 7, color: '#6b7280' },
];

const mtbfData = [
  { system: 'Turbine', mtbf: 2850, mttr: 12 },
  { system: 'Generator', mtbf: 3200, mttr: 8 },
  { system: 'Boiler', mtbf: 2100, mttr: 16 },
  { system: 'Electrical', mtbf: 2650, mttr: 6 },
  { system: 'Control', mtbf: 3500, mttr: 4 },
];

const recentActivities = [
  { id: 1, type: 'completed', title: 'Turbine Unit 1 - Class A Maintenance', time: '2 hours ago', user: 'Li Ming' },
  { id: 2, type: 'urgent', title: 'Generator 2 - Bearing Temperature Alert', time: '4 hours ago', user: 'Wang Fang' },
  { id: 3, type: 'approved', title: 'Monthly Maintenance Plan - November 2025', time: '5 hours ago', user: 'Zhang Wei' },
  { id: 4, type: 'pending', title: 'Boiler Feed Pump - Spare Parts Request', time: '1 day ago', user: 'Chen Jian' },
  { id: 5, type: 'completed', title: 'Safety Training - High Voltage Operations', time: '1 day ago', user: 'Liu Hong' },
];

export function Dashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-600 mb-1">{kpi.title}</p>
                  <p className="text-3xl text-slate-900 mb-2">{kpi.value}</p>
                  <span className={`text-sm ${kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {kpi.change} from last month
                  </span>
                </div>
                <div className={`${kpi.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${kpi.color}`} />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Plan Completion */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-slate-900 mb-1">Maintenance Plan Completion</h3>
            <p className="text-sm text-slate-500">Monthly planned vs completed tasks</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={planCompletionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="planned" fill="#94a3b8" name="Planned" />
              <Bar dataKey="completed" fill="#3b82f6" name="Completed" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Defects by Type */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-slate-900 mb-1">Defect Distribution by Type</h3>
            <p className="text-sm text-slate-500">Current month breakdown</p>
          </div>
          <div className="flex items-center gap-6">
            <ResponsiveContainer width="50%" height={280}>
              <PieChart>
                <Pie
                  data={defectByTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {defectByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-3">
              {defectByTypeData.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-slate-700">{item.name}</span>
                  </div>
                  <span className="text-sm text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Reliability Metrics */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-4">
            <h3 className="text-slate-900 mb-1">System Reliability Metrics</h3>
            <p className="text-sm text-slate-500">MTBF (hours) and MTTR (hours) by system</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mtbfData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fill: '#64748b' }} />
              <YAxis type="category" dataKey="system" tick={{ fill: '#64748b' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="mtbf" fill="#10b981" name="MTBF (hours)" />
              <Bar dataKey="mttr" fill="#f59e0b" name="MTTR (hours)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Recent Activities */}
        <Card className="p-6">
          <div className="mb-4">
            <h3 className="text-slate-900 mb-1">Recent Activities</h3>
            <p className="text-sm text-slate-500">Latest updates</p>
          </div>
          <div className="space-y-4">
            {recentActivities.map(activity => (
              <div key={activity.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-shrink-0 mt-1">
                  {activity.type === 'completed' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                  {activity.type === 'urgent' && <AlertCircle className="w-4 h-4 text-red-600" />}
                  {activity.type === 'approved' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  {activity.type === 'pending' && <Clock className="w-4 h-4 text-orange-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 mb-1">{activity.title}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>{activity.user}</span>
                    <span>•</span>
                    <span>{activity.time}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Current Week Overview */}
      <Card className="p-6">
        <div className="mb-4">
          <h3 className="text-slate-900 mb-1">Current Week Overview</h3>
          <p className="text-sm text-slate-500">October 20 - October 26, 2025</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Maintenance Tasks</span>
              <span className="text-sm text-slate-900">12/15</span>
            </div>
            <Progress value={80} className="mb-2" />
            <p className="text-xs text-slate-500">80% completion rate</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Defect Resolution</span>
              <span className="text-sm text-slate-900">18/23</span>
            </div>
            <Progress value={78} className="mb-2" />
            <p className="text-xs text-slate-500">78% resolved this week</p>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Safety Inspections</span>
              <span className="text-sm text-slate-900">8/8</span>
            </div>
            <Progress value={100} className="mb-2" />
            <p className="text-xs text-slate-500">100% completed</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
