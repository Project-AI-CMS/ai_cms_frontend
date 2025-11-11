import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Download,
  Calendar,
  Package,
  Users,
  Wrench
} from 'lucide-react';

const costSummary = {
  totalCost: 2850000,
  laborCost: 950000,
  spareParts: 1250000,
  outsourcing: 450000,
  tools: 200000,
  vsLastMonth: -8.5,
  vsBudget: 12.3
};

const monthlyCostData = [
  { month: 'Apr', labor: 880, parts: 1100, outsourcing: 320, tools: 180 },
  { month: 'May', labor: 920, parts: 1250, outsourcing: 450, tools: 200 },
  { month: 'Jun', labor: 890, parts: 1180, outsourcing: 380, tools: 190 },
  { month: 'Jul', labor: 950, parts: 1320, outsourcing: 420, tools: 210 },
  { month: 'Aug', labor: 910, parts: 1200, outsourcing: 400, tools: 195 },
  { month: 'Sep', labor: 930, parts: 1280, outsourcing: 460, tools: 205 },
  { month: 'Oct', labor: 950, parts: 1250, outsourcing: 450, tools: 200 }
];

const costByEquipment = [
  { equipment: 'Turbine Unit 1', cost: 850000, percentage: 30 },
  { equipment: 'Generator 1', cost: 520000, percentage: 18 },
  { equipment: 'Boiler 1', cost: 450000, percentage: 16 },
  { equipment: 'Turbine Unit 2', cost: 380000, percentage: 13 },
  { equipment: 'Electrical Systems', cost: 320000, percentage: 11 },
  { equipment: 'Other Equipment', cost: 330000, percentage: 12 }
];

const maintenanceTypeData = [
  { type: 'Preventive', cost: 1200000, count: 38 },
  { type: 'Corrective', cost: 950000, count: 24 },
  { type: 'Emergency', cost: 450000, count: 8 },
  { type: 'Predictive', cost: 250000, count: 12 }
];

const mtbfData = [
  { system: 'Turbine', mtbf: 2850, cost: 850000 },
  { system: 'Generator', mtbf: 3200, cost: 520000 },
  { system: 'Boiler', mtbf: 2100, cost: 450000 },
  { system: 'Electrical', mtbf: 2650, cost: 320000 },
  { system: 'Control', mtbf: 3500, cost: 280000 }
];

const recentTransactions = [
  { id: 'TXN-2025-245', date: '2025-10-27', description: 'Turbine bearings replacement', category: 'Spare Parts', amount: 90000, plan: 'MP-2025-001' },
  { id: 'TXN-2025-244', date: '2025-10-26', description: 'External inspection service', category: 'Outsourcing', amount: 35000, plan: 'MP-2025-003' },
  { id: 'TXN-2025-243', date: '2025-10-26', description: 'Labor cost - Team A (Week 43)', category: 'Labor', amount: 45000, plan: 'Multiple' },
  { id: 'TXN-2025-242', date: '2025-10-25', description: 'Pump seal kit', category: 'Spare Parts', amount: 10500, plan: 'MP-2025-002' },
  { id: 'TXN-2025-241', date: '2025-10-24', description: 'Specialized tools rental', category: 'Tools', amount: 12000, plan: 'MP-2025-001' }
];

export function CostAnalysis() {
  return (
    <div className="space-y-6">
      {/* Cost Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-slate-600">Total Cost (Oct)</p>
              <p className="text-2xl text-slate-900">¥{(costSummary.totalCost / 1000000).toFixed(2)}M</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <TrendingDown className="w-4 h-4 text-green-600" />
            <span className="text-green-600">{Math.abs(costSummary.vsLastMonth)}% vs last month</span>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-slate-600">Labor Cost</p>
              <p className="text-2xl text-slate-900">¥{(costSummary.laborCost / 1000000).toFixed(2)}M</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600">{((costSummary.laborCost / costSummary.totalCost) * 100).toFixed(1)}% of total</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-slate-600">Spare Parts</p>
              <p className="text-2xl text-slate-900">¥{(costSummary.spareParts / 1000000).toFixed(2)}M</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-orange-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600">{((costSummary.spareParts / costSummary.totalCost) * 100).toFixed(1)}% of total</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-sm text-slate-600">Budget Status</p>
              <p className="text-2xl text-slate-900">{costSummary.vsBudget}%</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-slate-600">Under annual budget</p>
        </Card>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-900 mb-1">Monthly Cost Trend</h3>
              <p className="text-sm text-slate-500">Cost breakdown by category (¥1,000)</p>
            </div>
            <Select defaultValue="2025">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyCostData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fill: '#64748b' }} />
              <YAxis tick={{ fill: '#64748b' }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="labor" stackId="a" fill="#8b5cf6" name="Labor" />
              <Bar dataKey="parts" stackId="a" fill="#3b82f6" name="Parts" />
              <Bar dataKey="outsourcing" stackId="a" fill="#f59e0b" name="Outsourcing" />
              <Bar dataKey="tools" stackId="a" fill="#10b981" name="Tools" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-900 mb-1">Cost by Equipment</h3>
              <p className="text-sm text-slate-500">October 2025 maintenance costs</p>
            </div>
          </div>
          <div className="space-y-3">
            {costByEquipment.map((item, index) => (
              <div key={index}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-700">{item.equipment}</span>
                  <span className="text-slate-900">¥{(item.cost / 1000).toFixed(0)}k</span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${item.percentage}%` }}
                  />
                  <span className="absolute right-2 top-0 text-xs text-slate-600">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">Cost by Maintenance Type</h3>
          <div className="space-y-4">
            {maintenanceTypeData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="text-sm text-slate-900 mb-1">{item.type}</p>
                  <p className="text-xs text-slate-500">{item.count} maintenance tasks</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-900">¥{(item.cost / 1000000).toFixed(2)}M</p>
                  <p className="text-xs text-slate-500">
                    ¥{(item.cost / item.count / 1000).toFixed(0)}k avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-slate-900 mb-4">MTBF vs Maintenance Cost</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={mtbfData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" tick={{ fill: '#64748b' }} />
              <YAxis dataKey="system" type="category" tick={{ fill: '#64748b' }} width={80} />
              <Tooltip />
              <Legend />
              <Bar dataKey="mtbf" fill="#10b981" name="MTBF (hours)" />
              <Bar dataKey="cost" fill="#3b82f6" name="Cost (¥1k)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent Transactions */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-slate-900">Recent Transactions</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Filter by Date
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm text-slate-600">Transaction ID</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600">Date</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600">Description</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600">Category</th>
                <th className="text-left py-3 px-4 text-sm text-slate-600">Plan</th>
                <th className="text-right py-3 px-4 text-sm text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((txn) => (
                <tr key={txn.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-slate-900">{txn.id}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{txn.date}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{txn.description}</td>
                  <td className="py-3 px-4">
                    <Badge variant="outline" className={
                      txn.category === 'Labor' ? 'bg-purple-50 text-purple-700' :
                      txn.category === 'Spare Parts' ? 'bg-blue-50 text-blue-700' :
                      txn.category === 'Outsourcing' ? 'bg-orange-50 text-orange-700' :
                      'bg-green-50 text-green-700'
                    }>
                      {txn.category}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-600">{txn.plan}</td>
                  <td className="py-3 px-4 text-right text-sm text-slate-900">
                    ¥{txn.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Wrench className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-slate-600">Cost per Maintenance Task</p>
              <p className="text-2xl text-slate-900">¥34.6k</p>
              <p className="text-xs text-slate-500">Average across all types</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <TrendingDown className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-slate-600">Cost Efficiency</p>
              <p className="text-2xl text-slate-900">+12.3%</p>
              <p className="text-xs text-slate-500">Improvement vs last year</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-slate-600">Annual Forecast</p>
              <p className="text-2xl text-slate-900">¥32.5M</p>
              <p className="text-xs text-slate-500">Based on current trend</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
