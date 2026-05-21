"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { maintenancePlanningApi } from "@/lib/api";
import { MPMAnnualPlanDto, MPMMonthlyPlanDto, UserInfo } from "@/types";
import { Calendar, Plus, CheckCircle2, XCircle, AlertCircle } from "lucide-react";

type MaintenancePlansProps = {
  user?: UserInfo;
};

export function MaintenancePlans({ user }: MaintenancePlansProps) {
  const [annualPlans, setAnnualPlans] = useState<MPMAnnualPlanDto[]>([]);
  const [monthlyPlans, setMonthlyPlans] = useState<MPMMonthlyPlanDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [activeTab, setActiveTab] = useState("annual");
  const [isCreateAnnualOpen, setIsCreateAnnualOpen] = useState(false);
  const [isCreateMonthlyOpen, setIsCreateMonthlyOpen] = useState(false);

  // Form states
  const [newAnnualPlan, setNewAnnualPlan] = useState({ year: new Date().getFullYear(), description: "" });
  const [newMonthlyPlan, setNewMonthlyPlan] = useState({ annualPlanId: "", month: 1, year: new Date().getFullYear(), description: "" });

  const canEdit = user?.role === "Administrator" || user?.role === "Maintenance Manager";

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [annual, monthly] = await Promise.all([
        maintenancePlanningApi.getAllAnnualPlans(),
        maintenancePlanningApi.getAllMonthlyPlans()
      ]);
      setAnnualPlans(annual);
      setMonthlyPlans(monthly);
    } catch (err: any) {
      setError(err.message || "Failed to fetch maintenance plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleCreateAnnual = async () => {
    try {
      await maintenancePlanningApi.createAnnualPlan(newAnnualPlan);
      setSuccess("Annual plan created");
      setIsCreateAnnualOpen(false);
      fetchPlans();
    } catch (err: any) {
      setError(err.message || "Failed to create annual plan");
    }
  };

  const handleCreateMonthly = async () => {
    try {
      await maintenancePlanningApi.createMonthlyPlan(newMonthlyPlan);
      setSuccess("Monthly plan created");
      setIsCreateMonthlyOpen(false);
      fetchPlans();
    } catch (err: any) {
      setError(err.message || "Failed to create monthly plan");
    }
  };

  const handleToggleAnnualStatus = async (id: string, currentIsActive: boolean) => {
    try {
      if (currentIsActive) {
        await maintenancePlanningApi.deactivateAnnualPlan(id);
        setSuccess("Plan deactivated");
      } else {
        await maintenancePlanningApi.activateAnnualPlan(id);
        setSuccess("Plan activated");
      }
      fetchPlans();
    } catch (err: any) {
      setError(err.message || "Failed to change plan status");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Maintenance Planning</h2>
          <p className="text-slate-600">Manage long-term and short-term maintenance schedules.</p>
        </div>
        {canEdit && activeTab === "annual" && (
          <Button onClick={() => setIsCreateAnnualOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Annual Plan
          </Button>
        )}
        {canEdit && activeTab === "monthly" && (
          <Button onClick={() => setIsCreateMonthlyOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> New Monthly Plan
          </Button>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="w-4 h-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="annual">Annual Plans</TabsTrigger>
          <TabsTrigger value="monthly">Monthly Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="annual" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {annualPlans.map(plan => (
              <Card key={plan.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">Year {plan.year}</h3>
                  <Badge variant={plan.isActive ? "default" : "secondary"} className={plan.isActive ? "bg-green-100 text-green-800" : ""}>
                    {plan.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                <div className="text-xs text-slate-400 mb-4">Status: {plan.status}</div>
                
                {canEdit && (
                  <Button 
                    variant={plan.isActive ? "outline" : "default"} 
                    className="w-full"
                    onClick={() => handleToggleAnnualStatus(plan.id, plan.isActive)}
                  >
                    {plan.isActive ? "Deactivate" : "Activate"}
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyPlans.map(plan => {
              const annual = annualPlans.find(a => a.id === plan.annualPlanId);
              return (
                <Card key={plan.id} className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium">{plan.year} - Month {plan.month}</h3>
                    <Badge variant="outline">{plan.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-4">{plan.description}</p>
                  <p className="text-xs text-slate-500">Annual Plan: {annual ? annual.year : "Unknown"}</p>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isCreateAnnualOpen} onOpenChange={setIsCreateAnnualOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Annual Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Year</Label>
              <Input type="number" value={newAnnualPlan.year} onChange={e => setNewAnnualPlan({...newAnnualPlan, year: parseInt(e.target.value)})} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newAnnualPlan.description} onChange={e => setNewAnnualPlan({...newAnnualPlan, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateAnnual}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isCreateMonthlyOpen} onOpenChange={setIsCreateMonthlyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Monthly Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Annual Plan</Label>
              <Select onValueChange={(v) => setNewMonthlyPlan({...newMonthlyPlan, annualPlanId: v})}>
                <SelectTrigger><SelectValue placeholder="Select Annual Plan" /></SelectTrigger>
                <SelectContent>
                  {annualPlans.map(a => <SelectItem key={a.id} value={a.id}>Year {a.year}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Month (1-12)</Label>
                <Input type="number" min={1} max={12} value={newMonthlyPlan.month} onChange={e => setNewMonthlyPlan({...newMonthlyPlan, month: parseInt(e.target.value)})} />
              </div>
              <div>
                <Label>Year</Label>
                <Input type="number" value={newMonthlyPlan.year} onChange={e => setNewMonthlyPlan({...newMonthlyPlan, year: parseInt(e.target.value)})} />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={newMonthlyPlan.description} onChange={e => setNewMonthlyPlan({...newMonthlyPlan, description: e.target.value})} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateMonthly}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
