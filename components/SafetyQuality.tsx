import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  FileText,
  Wrench,
  HardHat,
  ClipboardCheck
} from 'lucide-react';

const safetyRecords = [
  {
    id: 'JSA-2025-045',
    workPermit: 'WP-2025-H-0045',
    task: 'Boiler Feed Pump Maintenance',
    date: '2025-10-27',
    conductor: 'Li Ming',
    hazards: ['Rotating equipment', 'High pressure', 'Hot surfaces', 'Confined space'],
    controls: ['Lockout/Tagout', 'PPE required', 'Gas monitoring', 'Buddy system'],
    status: 'completed'
  },
  {
    id: 'JSA-2025-046',
    workPermit: 'WP-2025-E-0032',
    task: 'Generator Exciter Maintenance',
    date: '2025-10-28',
    conductor: 'Wang Fang',
    hazards: ['High voltage', 'Electric shock', 'Arc flash'],
    controls: ['Power isolation', 'Voltage testing', 'Insulated tools', 'Safety barriers'],
    status: 'active'
  }
];

const qualityInspections = [
  {
    id: 'QI-2025-128',
    equipment: 'Steam Turbine - HP Rotor',
    maintenancePlan: 'MP-2025-001',
    inspector: 'Zhang Wei',
    date: '2025-10-27',
    status: 'passed',
    checkpoints: [
      { item: 'Rotor alignment', standard: '±0.02mm', actual: '0.015mm', result: 'pass' },
      { item: 'Vibration level', standard: '<2.5mm/s', actual: '1.8mm/s', result: 'pass' },
      { item: 'Bearing clearance', standard: '0.08-0.12mm', actual: '0.10mm', result: 'pass' },
      { item: 'Oil quality analysis', standard: 'ISO 4406 16/14/11', actual: '15/13/10', result: 'pass' }
    ]
  },
  {
    id: 'QI-2025-129',
    equipment: 'Boiler Feed Pump',
    maintenancePlan: 'MP-2025-004',
    inspector: 'Liu Hong',
    date: '2025-10-27',
    status: 'pending',
    checkpoints: [
      { item: 'Impeller clearance', standard: '0.3-0.5mm', actual: 'Pending', result: 'pending' },
      { item: 'Shaft alignment', standard: '±0.05mm', actual: 'Pending', result: 'pending' },
      { item: 'Seal integrity test', standard: 'No leakage', actual: 'Pending', result: 'pending' }
    ]
  }
];

const violations = [
  {
    id: 'VIO-2025-012',
    type: 'Safety Violation',
    description: 'Worker observed without proper PPE (safety glasses) in maintenance area',
    location: 'Turbine Hall - Unit 2',
    reportedBy: 'Safety Officer - Zhou Yu',
    date: '2025-10-25',
    violator: 'Contractor - ABC Maintenance Co.',
    severity: 'minor',
    action: 'Verbal warning issued, safety training scheduled',
    status: 'closed'
  },
  {
    id: 'VIO-2025-013',
    type: 'Quality Issue',
    description: 'Torque wrench not calibrated before use on critical bolts',
    location: 'Generator Hall - Unit 1',
    reportedBy: 'QC Inspector - Liu Hong',
    date: '2025-10-26',
    violator: 'Team B - Technician',
    severity: 'major',
    action: 'Work stopped, bolts re-torqued with calibrated equipment, team training conducted',
    status: 'resolved'
  }
];

const safetyTools = [
  { id: 'ST-001', name: 'Insulating Gloves - 35kV', lastInspection: '2025-09-15', nextInspection: '2025-12-15', status: 'valid' },
  { id: 'ST-002', name: 'Voltage Detector', lastInspection: '2025-10-01', nextInspection: '2026-01-01', status: 'valid' },
  { id: 'ST-003', name: 'Gas Detector - Multi-gas', lastInspection: '2025-08-20', nextInspection: '2025-11-20', status: 'due_soon' },
  { id: 'ST-004', name: 'Fall Protection Harness', lastInspection: '2025-07-15', nextInspection: '2025-10-15', status: 'overdue' }
];

function SafetyRecordCard({ record }: { record: typeof safetyRecords[0] }) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-slate-900">{record.id}</h3>
            <Badge className={record.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
              {record.status === 'completed' ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <Shield className="w-3 h-3 mr-1" />}
              {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
            </Badge>
          </div>
          <p className="text-sm text-slate-600 mb-1">{record.task}</p>
          <p className="text-xs text-slate-500">Work Permit: {record.workPermit}</p>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <p className="text-xs text-slate-600 mb-2">Identified Hazards:</p>
          <div className="flex flex-wrap gap-1">
            {record.hazards.map((hazard, i) => (
              <Badge key={i} variant="outline" className="bg-red-50 text-red-700 text-xs">
                <AlertTriangle className="w-3 h-3 mr-1" />
                {hazard}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-slate-600 mb-2">Safety Controls:</p>
          <div className="flex flex-wrap gap-1">
            {record.controls.map((control, i) => (
              <Badge key={i} variant="outline" className="bg-green-50 text-green-700 text-xs">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                {control}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm pt-3 border-t">
        <span className="text-slate-600">Conducted by: {record.conductor}</span>
        <span className="text-slate-500">{record.date}</span>
      </div>
    </Card>
  );
}

function QualityInspectionCard({ inspection }: { inspection: typeof qualityInspections[0] }) {
  const allPassed = inspection.checkpoints.every(cp => cp.result === 'pass');
  const hasPending = inspection.checkpoints.some(cp => cp.result === 'pending');

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-slate-900">{inspection.id}</h3>
            {inspection.status === 'passed' && (
              <Badge className="bg-green-100 text-green-700">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Passed
              </Badge>
            )}
            {inspection.status === 'pending' && (
              <Badge className="bg-yellow-100 text-yellow-700">
                <Shield className="w-3 h-3 mr-1" />
                Pending
              </Badge>
            )}
            {inspection.status === 'failed' && (
              <Badge className="bg-red-100 text-red-700">
                <XCircle className="w-3 h-3 mr-1" />
                Failed
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-600 mb-1">{inspection.equipment}</p>
          <p className="text-xs text-slate-500">Plan: {inspection.maintenancePlan}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {inspection.checkpoints.map((checkpoint, i) => (
          <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
            <div className="flex-1">
              <p className="text-slate-900">{checkpoint.item}</p>
              <p className="text-xs text-slate-500">Standard: {checkpoint.standard}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-700">{checkpoint.actual}</span>
              {checkpoint.result === 'pass' && <CheckCircle2 className="w-4 h-4 text-green-600" />}
              {checkpoint.result === 'fail' && <XCircle className="w-4 h-4 text-red-600" />}
              {checkpoint.result === 'pending' && <Shield className="w-4 h-4 text-yellow-600" />}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm pt-3 border-t">
        <span className="text-slate-600">Inspector: {inspection.inspector}</span>
        <span className="text-slate-500">{inspection.date}</span>
      </div>

      {inspection.status === 'pending' && (
        <Dialog>
          <DialogTrigger asChild>
            <Button className="w-full mt-3">
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Perform Inspection
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Quality Inspection - {inspection.id}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Equipment</Label>
                <p className="text-sm text-slate-900 mt-1">{inspection.equipment}</p>
              </div>
              {inspection.checkpoints.map((checkpoint, i) => (
                <div key={i} className="space-y-2 p-4 border rounded-lg">
                  <Label>{checkpoint.item}</Label>
                  <p className="text-sm text-slate-600">Standard: {checkpoint.standard}</p>
                  <div className="flex gap-2 items-center">
                    <Label className="text-sm">Actual Value:</Label>
                    <input type="text" placeholder="Enter measured value" className="flex-1 px-3 py-2 border rounded" />
                    <select className="px-3 py-2 border rounded">
                      <option value="pass">Pass</option>
                      <option value="fail">Fail</option>
                    </select>
                  </div>
                </div>
              ))}
              <div>
                <Label>Inspector Notes</Label>
                <Textarea placeholder="Additional observations or comments..." rows={3} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">Save Draft</Button>
                <Button className="flex-1">Submit Inspection</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
}

export function SafetyQuality() {
  const [activeTab, setActiveTab] = useState('safety');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card className="p-4">
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'safety' ? 'default' : 'outline'}
            onClick={() => setActiveTab('safety')}
          >
            <Shield className="w-4 h-4 mr-2" />
            Safety Management
          </Button>
          <Button
            variant={activeTab === 'quality' ? 'default' : 'outline'}
            onClick={() => setActiveTab('quality')}
          >
            <ClipboardCheck className="w-4 h-4 mr-2" />
            Quality Acceptance
          </Button>
          <Button
            variant={activeTab === 'violations' ? 'default' : 'outline'}
            onClick={() => setActiveTab('violations')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Violations & Issues
          </Button>
          <Button
            variant={activeTab === 'tools' ? 'default' : 'outline'}
            onClick={() => setActiveTab('tools')}
          >
            <Wrench className="w-4 h-4 mr-2" />
            Safety Tools
          </Button>
        </div>
      </Card>

      {/* Safety Management */}
      {activeTab === 'safety' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Job Safety Analysis (JSA) Records</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  New JSA
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create Job Safety Analysis</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Work Permit</Label>
                    <input type="text" placeholder="Enter work permit ID" className="w-full px-3 py-2 border rounded mt-1" />
                  </div>
                  <div>
                    <Label>Task Description</Label>
                    <Textarea placeholder="Describe the work to be performed..." rows={3} />
                  </div>
                  <div>
                    <Label>Identified Hazards</Label>
                    <Textarea placeholder="List all potential hazards..." rows={4} />
                  </div>
                  <div>
                    <Label>Safety Controls</Label>
                    <Textarea placeholder="List all safety measures and controls..." rows={4} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Create JSA</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {safetyRecords.map(record => (
              <SafetyRecordCard key={record.id} record={record} />
            ))}
          </div>
        </div>
      )}

      {/* Quality Acceptance */}
      {activeTab === 'quality' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Quality Inspections</h3>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {qualityInspections.map(inspection => (
              <QualityInspectionCard key={inspection.id} inspection={inspection} />
            ))}
          </div>
        </div>
      )}

      {/* Violations & Issues */}
      {activeTab === 'violations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Safety Violations & Quality Issues</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Report Violation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report Violation/Issue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Type</Label>
                    <select className="w-full px-3 py-2 border rounded mt-1">
                      <option>Safety Violation</option>
                      <option>Quality Issue</option>
                      <option>Process Non-compliance</option>
                    </select>
                  </div>
                  <div>
                    <Label>Severity</Label>
                    <select className="w-full px-3 py-2 border rounded mt-1">
                      <option>Minor</option>
                      <option>Major</option>
                      <option>Critical</option>
                    </select>
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea placeholder="Describe the violation or issue..." rows={4} />
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Cancel</Button>
                    <Button>Submit Report</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {violations.map(violation => (
              <Card key={violation.id} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-slate-900">{violation.id}</h3>
                      <Badge variant="outline">{violation.type}</Badge>
                      <Badge className={
                        violation.severity === 'critical' ? 'bg-red-100 text-red-700' :
                        violation.severity === 'major' ? 'bg-orange-100 text-orange-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {violation.severity.charAt(0).toUpperCase() + violation.severity.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-700 mb-2">{violation.description}</p>
                    <p className="text-xs text-slate-500 mb-2">{violation.location}</p>
                  </div>
                  <Badge className={violation.status === 'closed' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}>
                    {violation.status.charAt(0).toUpperCase() + violation.status.slice(1)}
                  </Badge>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Reported by:</span>
                    <span className="text-slate-900">{violation.reportedBy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Date:</span>
                    <span className="text-slate-900">{violation.date}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Violator:</span>
                    <span className="text-slate-900">{violation.violator}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-slate-600 mb-1">Corrective Action:</p>
                  <p className="text-sm text-slate-700">{violation.action}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Safety Tools */}
      {activeTab === 'tools' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-slate-900">Safety Tool Inspection Status</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safetyTools.map(tool => (
              <Card key={tool.id} className={`p-4 ${tool.status === 'overdue' ? 'border-red-300 bg-red-50/30' : ''}`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-slate-900">{tool.name}</h3>
                      {tool.status === 'valid' && <Badge className="bg-green-100 text-green-700">Valid</Badge>}
                      {tool.status === 'due_soon' && <Badge className="bg-yellow-100 text-yellow-700">Due Soon</Badge>}
                      {tool.status === 'overdue' && <Badge className="bg-red-100 text-red-700">Overdue</Badge>}
                    </div>
                    <p className="text-sm text-slate-600">{tool.id}</p>
                  </div>
                  <HardHat className="w-8 h-8 text-slate-400" />
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Last Inspection:</span>
                    <span className="text-slate-900">{tool.lastInspection}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Next Inspection:</span>
                    <span className={tool.status === 'overdue' ? 'text-red-600' : 'text-slate-900'}>
                      {tool.nextInspection}
                    </span>
                  </div>
                </div>

                {(tool.status === 'due_soon' || tool.status === 'overdue') && (
                  <Button className="w-full mt-3" variant={tool.status === 'overdue' ? 'default' : 'outline'}>
                    Schedule Inspection
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
