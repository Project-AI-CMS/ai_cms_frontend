import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  Zap,
  Thermometer,
  Gauge,
  Wind,
  Waves,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { Progress } from './ui/progress';

type AssetHealthStatus = 'healthy' | 'warning' | 'critical';

type Asset = {
  id: string;
  name: string;
  healthScore: number;
  status: AssetHealthStatus;
  rul: number; // Remaining Useful Life in days
  failureProbability: number;
  lastUpdate: string;
};

const monitoredAssets: Asset[] = [
  { 
    id: 'TB-001', 
    name: 'Steam Turbine Unit 1', 
    healthScore: 92, 
    status: 'healthy', 
    rul: 245, 
    failureProbability: 8,
    lastUpdate: '2025-10-27 15:30:00'
  },
  { 
    id: 'GEN-001', 
    name: 'Generator Unit 1', 
    healthScore: 87, 
    status: 'healthy', 
    rul: 180, 
    failureProbability: 12,
    lastUpdate: '2025-10-27 15:30:15'
  },
  { 
    id: 'BLR-001', 
    name: 'Boiler Feed Pump', 
    healthScore: 68, 
    status: 'warning', 
    rul: 45, 
    failureProbability: 32,
    lastUpdate: '2025-10-27 15:29:45'
  },
  { 
    id: 'TB-HP-001', 
    name: 'HP Rotor Assembly', 
    healthScore: 45, 
    status: 'critical', 
    rul: 7, 
    failureProbability: 85,
    lastUpdate: '2025-10-27 15:30:30'
  }
];

// Simulated real-time sensor data
const generateSensorData = (baseValue: number, variance: number, trend: number = 0) => {
  const data = [];
  let value = baseValue;
  for (let i = 0; i < 20; i++) {
    value = value + (Math.random() - 0.5) * variance + trend;
    data.push({
      time: `${14 + Math.floor(i / 4)}:${(i % 4) * 15}`,
      value: Number(value.toFixed(2))
    });
  }
  return data;
};

const healthStatusConfig: Record<AssetHealthStatus, { color: string; bgColor: string; icon: React.ComponentType<{ className?: string }> }> = {
  healthy: { color: 'text-green-600', bgColor: 'bg-green-50', icon: CheckCircle2 },
  warning: { color: 'text-orange-600', bgColor: 'bg-orange-50', icon: AlertTriangle },
  critical: { color: 'text-red-600', bgColor: 'bg-red-50', icon: AlertCircle }
};

function AssetHealthCard({ asset }: { asset: Asset }) {
  const config = healthStatusConfig[asset.status];
  const StatusIcon = config.icon;

  return (
    <Card className={`p-4 border-2 ${
      asset.status === 'critical' ? 'border-red-300 bg-red-50/30' :
      asset.status === 'warning' ? 'border-orange-300 bg-orange-50/30' :
      'border-green-300 bg-green-50/30'
    }`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-slate-900 mb-1">{asset.name}</h3>
          <p className="text-xs text-slate-500">ID: {asset.id}</p>
        </div>
        <div className={`w-12 h-12 rounded-full ${config.bgColor} flex items-center justify-center`}>
          <StatusIcon className={`w-6 h-6 ${config.color}`} />
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-slate-600">Health Score</span>
            <span className={`${config.color}`}>{asset.healthScore}%</span>
          </div>
          <Progress 
            value={asset.healthScore} 
            className={`h-2 ${
              asset.status === 'critical' ? '[&>div]:bg-red-600' :
              asset.status === 'warning' ? '[&>div]:bg-orange-500' :
              '[&>div]:bg-green-500'
            }`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-slate-600 mb-1">RUL (Days)</p>
            <p className={`${config.color}`}>{asset.rul}</p>
          </div>
          <div>
            <p className="text-xs text-slate-600 mb-1">Failure Risk</p>
            <p className={`${config.color}`}>{asset.failureProbability}%</p>
          </div>
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last update: {new Date(asset.lastUpdate).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

function SensorChart({ 
  title, 
  data, 
  dataKey, 
  color, 
  unit, 
  threshold,
  icon: Icon 
}: { 
  title: string; 
  data: any[]; 
  dataKey: string; 
  color: string; 
  unit: string;
  threshold?: { value: number; label: string };
  icon: React.ComponentType<{ className?: string }>;
}) {
  const currentValue = data[data.length - 1]?.[dataKey] || 0;
  const previousValue = data[data.length - 2]?.[dataKey] || 0;
  const trend = currentValue - previousValue;
  const isAboveThreshold = threshold && currentValue > threshold.value;

  return (
    <Card className={`p-4 ${isAboveThreshold ? 'border-orange-300 bg-orange-50/20' : ''}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg ${color === '#3b82f6' ? 'bg-blue-100' : color === '#ef4444' ? 'bg-red-100' : color === '#f59e0b' ? 'bg-orange-100' : 'bg-green-100'} flex items-center justify-center`}>
            <Icon className={`w-5 h-5 ${color === '#3b82f6' ? 'text-blue-600' : color === '#ef4444' ? 'text-red-600' : color === '#f59e0b' ? 'text-orange-600' : 'text-green-600'}`} />
          </div>
          <div>
            <p className="text-sm text-slate-600">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl text-slate-900">{currentValue.toFixed(1)}</p>
              <span className="text-sm text-slate-600">{unit}</span>
              {trend !== 0 && (
                <div className={`flex items-center gap-1 text-xs ${trend > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {trend > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(trend).toFixed(1)}
                </div>
              )}
            </div>
          </div>
        </div>
        {isAboveThreshold && (
          <Badge className="bg-orange-100 text-orange-700">
            <AlertTriangle className="w-3 h-3 mr-1" />
            {threshold.label}
          </Badge>
        )}
      </div>
      <ResponsiveContainer width="100%" height={150}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} />
          <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
          <Tooltip />
          {threshold && (
            <Line 
              type="monotone" 
              dataKey={() => threshold.value} 
              stroke="#f59e0b" 
              strokeDasharray="5 5" 
              dot={false}
              strokeWidth={2}
            />
          )}
          <Area 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2}
            fill={`url(#gradient-${dataKey})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

export function AssetMonitoring() {
  const [selectedAsset, setSelectedAsset] = useState('TB-001');
  const [temperatureData, setTemperatureData] = useState(generateSensorData(75, 3, 0.1));
  const [vibrationData, setVibrationData] = useState(generateSensorData(2.2, 0.3, 0.05));
  const [pressureData, setPressureData] = useState(generateSensorData(145, 5, -0.2));
  const [powerData, setPowerData] = useState(generateSensorData(580, 20, 2));

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTemperatureData(prev => {
        const lastValue = prev[prev.length - 1].value;
        const newValue = lastValue + (Math.random() - 0.5) * 3 + 0.1;
        return [...prev.slice(1), { 
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
          value: Number(newValue.toFixed(2)) 
        }];
      });

      setVibrationData(prev => {
        const lastValue = prev[prev.length - 1].value;
        const newValue = lastValue + (Math.random() - 0.5) * 0.3 + 0.05;
        return [...prev.slice(1), { 
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
          value: Number(Math.max(0, newValue).toFixed(2)) 
        }];
      });

      setPressureData(prev => {
        const lastValue = prev[prev.length - 1].value;
        const newValue = lastValue + (Math.random() - 0.5) * 5 - 0.2;
        return [...prev.slice(1), { 
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
          value: Number(newValue.toFixed(2)) 
        }];
      });

      setPowerData(prev => {
        const lastValue = prev[prev.length - 1].value;
        const newValue = lastValue + (Math.random() - 0.5) * 20 + 2;
        return [...prev.slice(1), { 
          time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }), 
          value: Number(newValue.toFixed(2)) 
        }];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const currentAsset = monitoredAssets.find(a => a.id === selectedAsset) || monitoredAssets[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Real-Time Asset Monitoring</h2>
          <p className="text-slate-600">Live sensor data and predictive analytics</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-green-100 text-green-700 animate-pulse">
            <Activity className="w-3 h-3 mr-1" />
            Live Updates
          </Badge>
          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monitoredAssets.map(asset => (
                <SelectItem key={asset.id} value={asset.id}>
                  {asset.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Asset Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {monitoredAssets.map(asset => (
          <AssetHealthCard key={asset.id} asset={asset} />
        ))}
      </div>

      {/* Selected Asset Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl text-slate-900 mb-1">{currentAsset.name}</h3>
            <p className="text-sm text-slate-600">Detailed sensor monitoring and predictions</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-slate-600">Health Score</p>
              <p className={`text-3xl ${healthStatusConfig[currentAsset.status].color}`}>
                {currentAsset.healthScore}%
              </p>
            </div>
            <div className={`w-16 h-16 rounded-full ${healthStatusConfig[currentAsset.status].bgColor} flex items-center justify-center`}>
              {currentAsset.status === 'healthy' && <CheckCircle2 className="w-8 h-8 text-green-600" />}
              {currentAsset.status === 'warning' && <AlertTriangle className="w-8 h-8 text-orange-600" />}
              {currentAsset.status === 'critical' && <AlertCircle className="w-8 h-8 text-red-600" />}
            </div>
          </div>
        </div>

        {/* Prediction Summary */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Remaining Useful Life</p>
            <p className="text-3xl text-blue-900 mb-1">{currentAsset.rul}</p>
            <p className="text-xs text-blue-600">days estimated</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <p className="text-sm text-orange-700 mb-1">Failure Probability</p>
            <p className="text-3xl text-orange-900 mb-1">{currentAsset.failureProbability}%</p>
            <p className="text-xs text-orange-600">in next 30 days</p>
          </Card>
          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <p className="text-sm text-green-700 mb-1">Recommended Action</p>
            <p className="text-lg text-green-900 mb-1">
              {currentAsset.status === 'critical' ? 'Immediate' : 
               currentAsset.status === 'warning' ? 'Scheduled' : 'Monitor'}
            </p>
            <p className="text-xs text-green-600">maintenance priority</p>
          </Card>
        </div>

        {/* Real-time Sensor Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SensorChart 
            title="Temperature"
            data={temperatureData}
            dataKey="value"
            color="#ef4444"
            unit="°C"
            threshold={{ value: 80, label: 'High Temp' }}
            icon={Thermometer}
          />
          <SensorChart 
            title="Vibration Level"
            data={vibrationData}
            dataKey="value"
            color="#f59e0b"
            unit="mm/s"
            threshold={{ value: 3.5, label: 'High Vibration' }}
            icon={Waves}
          />
          <SensorChart 
            title="Pressure"
            data={pressureData}
            dataKey="value"
            color="#3b82f6"
            unit="bar"
            icon={Gauge}
          />
          <SensorChart 
            title="Power Output"
            data={powerData}
            dataKey="value"
            color="#10b981"
            unit="MW"
            icon={Zap}
          />
        </div>
      </Card>

      {/* AI Insights */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-slate-900 mb-2">AI-Powered Insights</h3>
            <div className="space-y-2">
              {currentAsset.status === 'critical' && (
                <p className="text-sm text-slate-700">
                  🔴 <strong>Critical Alert:</strong> High failure probability detected. Temperature trending upward with increasing vibration levels. 
                  Immediate inspection recommended. Schedule maintenance within 7 days to prevent unplanned downtime.
                </p>
              )}
              {currentAsset.status === 'warning' && (
                <p className="text-sm text-slate-700">
                  🟠 <strong>Warning:</strong> Asset health declining. Pattern analysis suggests bearing wear. 
                  Schedule preventive maintenance within 30-45 days. Monitor vibration levels closely.
                </p>
              )}
              {currentAsset.status === 'healthy' && (
                <p className="text-sm text-slate-700">
                  🟢 <strong>Healthy Status:</strong> All parameters within normal range. Asset performing optimally. 
                  Continue routine monitoring. Next scheduled maintenance in {currentAsset.rul} days.
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
