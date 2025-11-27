import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Bell, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  CheckCircle2,
  Clock,
  Search,
  TrendingUp,
} from 'lucide-react';

type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
type AlertStatus = 'active' | 'acknowledged' | 'resolved';
type AlertType = 'threshold' | 'prediction' | 'anomaly' | 'maintenance';

type Alert = {
  id: string;
  title: string;
  description: string;
  assetId: string;
  assetName: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  timestamp: string;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  metrics?: {
    current: number;
    threshold: number;
    unit: string;
  };
};

const alerts: Alert[] = [
  {
    id: 'ALT-2025-0089',
    title: 'Critical: High Bearing Temperature',
    description: 'Generator bearing temperature has exceeded critical threshold of 85°C. Immediate attention required to prevent bearing failure.',
    assetId: 'GEN-001',
    assetName: 'Generator Unit 1',
    type: 'threshold',
    priority: 'critical',
    status: 'active',
    timestamp: '2025-10-27 15:30:00',
    metrics: {
      current: 87.5,
      threshold: 85,
      unit: '°C'
    }
  },
  {
    id: 'ALT-2025-0088',
    title: 'Predicted Failure: HP Rotor Assembly',
    description: 'AI model predicts 85% probability of failure within 7 days. Vibration patterns indicate bearing degradation. RUL estimate: 7 days.',
    assetId: 'TB-HP-001',
    assetName: 'HP Rotor Assembly',
    type: 'prediction',
    priority: 'critical',
    status: 'acknowledged',
    timestamp: '2025-10-27 14:15:00',
    acknowledgedBy: 'Zhang Wei',
    acknowledgedAt: '2025-10-27 14:45:00',
    metrics: {
      current: 85,
      threshold: 50,
      unit: '% probability'
    }
  },
  {
    id: 'ALT-2025-0087',
    title: 'High Vibration Detected',
    description: 'Boiler feed pump vibration levels elevated to 3.8 mm/s, exceeding warning threshold of 3.5 mm/s.',
    assetId: 'BLR-001',
    assetName: 'Boiler Feed Pump',
    type: 'threshold',
    priority: 'high',
    status: 'acknowledged',
    timestamp: '2025-10-27 13:20:00',
    acknowledgedBy: 'Li Ming',
    acknowledgedAt: '2025-10-27 13:30:00',
    metrics: {
      current: 3.8,
      threshold: 3.5,
      unit: 'mm/s'
    }
  },
  {
    id: 'ALT-2025-0086',
    title: 'Anomaly: Power Output Fluctuation',
    description: 'Unusual power output variation detected in Turbine Unit 2. Pattern deviates from normal operational profile.',
    assetId: 'TB-002',
    assetName: 'Steam Turbine Unit 2',
    type: 'anomaly',
    priority: 'medium',
    status: 'active',
    timestamp: '2025-10-27 12:00:00'
  },
  {
    id: 'ALT-2025-0085',
    title: 'Maintenance Due: Cooling System',
    description: 'Preventive maintenance scheduled for cooling tower CT-1 is due within 3 days.',
    assetId: 'CT-001',
    assetName: 'Cooling Tower CT-1',
    type: 'maintenance',
    priority: 'medium',
    status: 'active',
    timestamp: '2025-10-27 09:00:00'
  },
  {
    id: 'ALT-2025-0084',
    title: 'Pressure Drop Alert',
    description: 'Oil filter differential pressure drop detected in lubrication system.',
    assetId: 'TB-001',
    assetName: 'Steam Turbine Unit 1',
    type: 'threshold',
    priority: 'low',
    status: 'resolved',
    timestamp: '2025-10-26 16:30:00',
    acknowledgedBy: 'Chen Jian',
    acknowledgedAt: '2025-10-26 17:00:00',
    resolvedAt: '2025-10-27 10:00:00',
    metrics: {
      current: 0.4,
      threshold: 0.3,
      unit: 'bar'
    }
  }
];

const priorityConfig: Record<AlertPriority, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  critical: { color: 'text-red-700', bgColor: 'bg-red-100', icon: AlertTriangle },
  high: { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: AlertCircle },
  medium: { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Info },
  low: { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Info }
};

const typeLabels: Record<AlertType, string> = {
  threshold: 'Threshold Breach',
  prediction: 'Predictive Alert',
  anomaly: 'Anomaly Detection',
  maintenance: 'Maintenance Due'
};

function AlertCard({ alert, onAcknowledge, onResolve }: { 
  alert: Alert; 
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
}) {
  const config = priorityConfig[alert.priority];
  const PriorityIcon = config.icon;

  return (
    <Card className={`p-4 ${
      alert.status === 'active' && alert.priority === 'critical' ? 'border-2 border-red-300 bg-red-50/30' :
      alert.status === 'active' && alert.priority === 'high' ? 'border-2 border-orange-300 bg-orange-50/30' :
      ''
    }`}>
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center flex-shrink-0`}>
          <PriorityIcon className={`w-5 h-5 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-slate-900">{alert.title}</h3>
                <Badge className={config.bgColor + ' ' + config.color}>
                  {alert.priority.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {typeLabels[alert.type]}
                </Badge>
              </div>
              <p className="text-sm text-slate-600 mb-2">{alert.assetName} ({alert.assetId})</p>
            </div>
            <Badge className={
              alert.status === 'active' ? 'bg-red-100 text-red-700' :
              alert.status === 'acknowledged' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }>
              {alert.status === 'active' ? 'Active' :
               alert.status === 'acknowledged' ? 'Acknowledged' :
               'Resolved'}
            </Badge>
          </div>

          <p className="text-sm text-slate-700 mb-3">{alert.description}</p>

          {alert.metrics && (
            <div className="flex items-center gap-4 mb-3 p-2 bg-gray-50 rounded text-sm">
              <div>
                <span className="text-slate-600">Current: </span>
                <span className={`${config.color}`}>
                  {alert.metrics.current} {alert.metrics.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-600">Threshold: </span>
                <span className="text-slate-900">
                  {alert.metrics.threshold} {alert.metrics.unit}
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500 space-y-1">
              <p className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {alert.timestamp}
              </p>
              {alert.acknowledgedBy && (
                <p>Acknowledged by {alert.acknowledgedBy} at {alert.acknowledgedAt}</p>
              )}
              {alert.resolvedAt && (
                <p className="text-green-600">Resolved at {alert.resolvedAt}</p>
              )}
            </div>

            <div className="flex gap-2">
              {alert.status === 'active' && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => onAcknowledge(alert.id)}
                >
                  Acknowledge
                </Button>
              )}
              {(alert.status === 'active' || alert.status === 'acknowledged') && (
                <Button 
                  size="sm"
                  onClick={() => onResolve(alert.id)}
                >
                  <CheckCircle2 className="w-4 h-4 mr-1" />
                  Resolve
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function AlertsNotifications() {
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [alertList, setAlertList] = useState(alerts);

  const handleAcknowledge = (id: string) => {
    setAlertList(prev => prev.map(alert => 
      alert.id === id 
        ? { 
            ...alert, 
            status: 'acknowledged' as AlertStatus, 
            acknowledgedBy: 'Current User',
            acknowledgedAt: new Date().toLocaleString()
          }
        : alert
    ));
  };

  const handleResolve = (id: string) => {
    setAlertList(prev => prev.map(alert => 
      alert.id === id 
        ? { 
            ...alert, 
            status: 'resolved' as AlertStatus, 
            resolvedAt: new Date().toLocaleString()
          }
        : alert
    ));
  };

  const filteredAlerts = alertList.filter(alert => {
    const matchesPriority = filterPriority === 'all' || alert.priority === filterPriority;
    const matchesStatus = filterStatus === 'all' || alert.status === filterStatus;
    const matchesType = filterType === 'all' || alert.type === filterType;
    const matchesSearch = searchTerm === '' || 
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.assetName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesPriority && matchesStatus && matchesType && matchesSearch;
  });

  const activeCount = alertList.filter(a => a.status === 'active').length;
  const criticalCount = alertList.filter(a => a.priority === 'critical' && a.status === 'active').length;
  const acknowledgedCount = alertList.filter(a => a.status === 'acknowledged').length;

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Bell className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Alerts</p>
              <p className="text-2xl text-slate-900">{activeCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Critical</p>
              <p className="text-2xl text-slate-900">{criticalCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Acknowledged</p>
              <p className="text-2xl text-slate-900">{acknowledgedCount}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Last 24h</p>
              <p className="text-2xl text-slate-900">6</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search alerts by title or asset..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="acknowledged">Acknowledged</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="threshold">Threshold Breach</SelectItem>
              <SelectItem value="prediction">Predictive</SelectItem>
              <SelectItem value="anomaly">Anomaly</SelectItem>
              <SelectItem value="maintenance">Maintenance</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Alerts List */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active ({alertList.filter(a => a.status === 'active').length})
          </TabsTrigger>
          <TabsTrigger value="acknowledged">
            Acknowledged ({alertList.filter(a => a.status === 'acknowledged').length})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            Resolved ({alertList.filter(a => a.status === 'resolved').length})
          </TabsTrigger>
          <TabsTrigger value="all">All Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-4">
          {filteredAlerts.filter(a => a.status === 'active').map(alert => (
            <AlertCard 
              key={alert.id} 
              alert={alert} 
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          ))}
        </TabsContent>

        <TabsContent value="acknowledged" className="space-y-4 mt-4">
          {filteredAlerts.filter(a => a.status === 'acknowledged').map(alert => (
            <AlertCard 
              key={alert.id} 
              alert={alert} 
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          ))}
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4 mt-4">
          {filteredAlerts.filter(a => a.status === 'resolved').map(alert => (
            <AlertCard 
              key={alert.id} 
              alert={alert} 
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          ))}
        </TabsContent>

        <TabsContent value="all" className="space-y-4 mt-4">
          {filteredAlerts.map(alert => (
            <AlertCard 
              key={alert.id} 
              alert={alert} 
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
            />
          ))}
        </TabsContent>
      </Tabs>

      {filteredAlerts.length === 0 && (
        <Card className="p-12 text-center">
          <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
          <p className="text-slate-600">No alerts found matching your filters</p>
        </Card>
      )}
    </div>
  );
}
