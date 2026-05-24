"use client";
import { useState, useEffect, useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "./ui/dialog";
import { Alert, AlertDescription } from "./ui/alert";
import { maintenancePlanningApi } from "@/lib/api";
import { MPMAnnualPlanDto, MPMMonthlyPlanDto, UserInfo } from "@/types";
import { MaintenancePlanDetails } from "./MaintenancePlanDetails";
import {
  Calendar,
  Plus,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  CalendarDays,
  Activity,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";

type MaintenancePlansProps = {
  user?: UserInfo;
};

export function MaintenancePlans({ user }: MaintenancePlansProps) {
  const [annualPlans, setAnnualPlans] = useState<MPMAnnualPlanDto[]>([]);
  const [monthlyPlans, setMonthlyPlans] = useState<MPMMonthlyPlanDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const safeDate = (val: any) => {
    if (!val) return "—";
    if (Array.isArray(val)) {
      const [year, month, day] = val;
      return new Date(year, month - 1, day).toLocaleDateString();
    }
    const d = new Date(val);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString();
  };

  const [activeTab, setActiveTab] = useState<"annual" | "monthly">("annual");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedPlanType, setSelectedPlanType] = useState<"annual" | "monthly" | null>(null);
  const [isCreateAnnualOpen, setIsCreateAnnualOpen] = useState(false);
  const [isCreateMonthlyOpen, setIsCreateMonthlyOpen] = useState(false);

  const [newAnnualPlan, setNewAnnualPlan] = useState({ year: new Date().getFullYear(), description: "" });
  const [newMonthlyPlan, setNewMonthlyPlan] = useState({
    annualPlanId: "",
    planDetailsId: "",
    month: 1,
    year: new Date().getFullYear(),
    description: "",
  });
  const [availablePlanDetails, setAvailablePlanDetails] = useState<any[]>([]);

  const canEdit = user?.role === "ADMIN" || user?.role === "MAINTENANCE_MANAGER";

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [annual, monthly] = await Promise.all([
        maintenancePlanningApi.getAllAnnualPlans(),
        maintenancePlanningApi.getAllMonthlyPlans(),
      ]);
      setAnnualPlans(Array.isArray(annual) ? annual : []);
      setMonthlyPlans(Array.isArray(monthly) ? monthly : []);
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
      await maintenancePlanningApi.createAnnualPlan({
        ...newAnnualPlan,
        fiscalYear: newAnnualPlan.year // map year to fiscalYear in case backend expects it
      });
      setSuccess("Annual plan created successfully");
      setIsCreateAnnualOpen(false);
      setNewAnnualPlan({ year: new Date().getFullYear(), description: "" });
      fetchPlans();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to create annual plan");
    }
  };

  const handleCreateMonthly = async () => {
    try {
      await maintenancePlanningApi.createMonthlyPlan(newMonthlyPlan);
      setSuccess("Monthly plan created successfully");
      setIsCreateMonthlyOpen(false);
      setNewMonthlyPlan({ annualPlanId: "", planDetailsId: "", month: 1, year: new Date().getFullYear(), description: "" });
      setAvailablePlanDetails([]);
      fetchPlans();
      setTimeout(() => setSuccess(""), 3000);
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
      await fetchPlans();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      setError(err.message || "Failed to change plan status");
    }
  };

  const getMonthName = (month: number) =>
    new Date(2000, month - 1, 1).toLocaleString("default", { month: "long" });

  const getStatusBadge = (status: string) => {
    const map: Record<string, string> = {
      DRAFT: "bg-slate-100 text-slate-600",
      PENDING: "bg-yellow-100 text-yellow-700",
      APPROVED: "bg-green-100 text-green-700",
      REJECTED: "bg-red-100 text-red-700",
      ACTIVE: "bg-blue-100 text-blue-700",
    };
    return map[status] || "bg-slate-100 text-slate-600";
  };

  if (selectedPlanId && selectedPlanType) {
    return (
      <MaintenancePlanDetails 
        planId={selectedPlanId} 
        planType={selectedPlanType} 
        user={user}
        onBack={() => {
          setSelectedPlanId(null);
          setSelectedPlanType(null);
          fetchPlans();
        }} 
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Maintenance Planning</h2>
          <p className="text-slate-600">Manage long-term and short-term maintenance schedules</p>
        </div>
        <Button onClick={fetchPlans} disabled={loading} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-800">{annualPlans.length}</p>
              <p className="text-sm text-blue-600">Annual Plans</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-green-50 border-green-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-800">
                {annualPlans.filter((p: any) => p.isActive || p.active).length}
              </p>
              <p className="text-sm text-green-600">Active Plans</p>
            </div>
          </div>
        </Card>
        <Card className="p-4 bg-purple-50 border-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <CalendarDays className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-800">{monthlyPlans.length}</p>
              <p className="text-sm text-purple-600">Monthly Plans</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Fancy segmented toggle + action button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setActiveTab("annual")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "annual"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Calendar className="w-4 h-4" />
            Annual Plans
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                activeTab === "annual"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {annualPlans.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeTab === "monthly"
                ? "bg-white text-slate-900 shadow-sm border border-slate-200"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            Monthly Plans
            <span
              className={`inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold ${
                activeTab === "monthly"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-slate-200 text-slate-500"
              }`}
            >
              {monthlyPlans.length}
            </span>
          </button>
        </div>

        {canEdit && (
          <div>
            {activeTab === "annual" && (
              <Button onClick={() => setIsCreateAnnualOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Annual Plan
              </Button>
            )}
            {activeTab === "monthly" && (
              <Button onClick={() => setIsCreateMonthlyOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Monthly Plan
              </Button>
            )}
          </div>
        )}
      </div>
      {/* Annual Plans Panel */}
      {activeTab === "annual" && (
        <Card className="p-6 mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <p className="text-slate-600 mt-4">Loading plans...</p>
              </div>
            ) : annualPlans.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-900 font-medium mb-2">No Annual Plans Found</p>
                <p className="text-slate-600 mb-6">
                  {canEdit
                    ? "Create your first annual maintenance plan to get started."
                    : "No annual plans have been created yet."}
                </p>
                {canEdit && (
                  <Button onClick={() => setIsCreateAnnualOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Annual Plan
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {annualPlans.map((plan: any) => {
                  const isPlanActive = plan.isActive ?? plan.active ?? false;
                  return (
                  <Card
                    key={plan.id}
                    className={`p-4 border-l-4 ${
                      isPlanActive
                        ? "border-l-blue-500 bg-blue-50/30"
                        : "border-l-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium text-slate-900">
                            Annual Plan — {plan.fiscalYear || plan.year}
                          </h3>
                          <Badge
                            className={`border-0 ${
                              isPlanActive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {isPlanActive ? "Active" : "Inactive"}
                          </Badge>
                          <Badge className={`border-0 ${getStatusBadge(plan.status)}`}>
                            {plan.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 mb-3">
                          {plan.description || "No description provided."}
                        </p>
                        <p className="text-xs text-slate-400">
                          Created: {new Date(plan.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {canEdit && (
                        <div className="ml-4 flex-shrink-0">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedPlanId(plan.id);
                              setSelectedPlanType("annual");
                            }}
                            className="mr-2"
                          >
                            Details
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleAnnualStatus(plan.id, isPlanActive)}
                            className={
                              isPlanActive
                                ? "text-slate-600 hover:bg-slate-50"
                                : "text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                            }
                          >
                            {isPlanActive ? (
                              <>
                                <ToggleRight className="w-4 h-4 mr-2" />
                                Deactivate
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="w-4 h-4 mr-2" />
                                Activate
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )})}
              </div>
            )}
          </Card>
      )}

      {/* Monthly Plans Panel */}
      {activeTab === "monthly" && (
        <Card className="p-6 mt-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                <p className="text-slate-600 mt-4">Loading plans...</p>
              </div>
            ) : monthlyPlans.length === 0 ? (
              <div className="text-center py-12">
                <CalendarDays className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-900 font-medium mb-2">No Monthly Plans Found</p>
                <p className="text-slate-600 mb-6">
                  {canEdit
                    ? "Break down annual plans into monthly execution schedules."
                    : "No monthly plans have been created yet."}
                </p>
                {canEdit && (
                  <Button onClick={() => setIsCreateMonthlyOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Monthly Plan
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {monthlyPlans.map((plan: any) => {
                  const resolvedAnnualId = plan.annualPlanId || plan.annualPlan?.id || plan.planDetail?.annualPlanId || plan.planDetailsId;
                  const annual = annualPlans.find((a) => a.id === resolvedAnnualId);
                  
                  // fallback string logic
                  let annualDisplay = "Unknown";
                  if (annual) {
                    annualDisplay = `Year ${annual.fiscalYear || annual.year}`;
                  } else if (resolvedAnnualId) {
                    annualDisplay = String(resolvedAnnualId).substring(0, 8);
                  }

                  return (
                    <Card key={plan.id} className="p-4 border-l-4 border-l-purple-400 bg-purple-50/20">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-medium text-slate-900">
                              {getMonthName(plan.month)} {plan.year}
                            </h3>
                            <Badge className={`border-0 ${getStatusBadge(plan.status)}`}>
                              {plan.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Annual Plan: {annualDisplay}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays className="w-4 h-4" />
                              <span>
                                Created: {safeDate(plan.createdAt)}
                              </span>
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm text-slate-700">
                              {plan.description || "No description provided."}
                            </p>
                          </div>
                          <div className="mt-3 flex justify-end">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedPlanId(plan.id);
                                setSelectedPlanType("monthly");
                              }}
                            >
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </Card>
      )}

      {/* Create Annual Plan Dialog */}
      <Dialog open={isCreateAnnualOpen} onOpenChange={setIsCreateAnnualOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Annual Plan</DialogTitle>
            <DialogDescription>
              Set up a new annual maintenance plan for a specific year.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="annual-year">
                Year <span className="text-red-600">*</span>
              </Label>
              <Input
                id="annual-year"
                type="number"
                value={newAnnualPlan.year}
                onChange={(e) =>
                  setNewAnnualPlan({ ...newAnnualPlan, year: parseInt(e.target.value) })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="annual-description">Description</Label>
              <Textarea
                id="annual-description"
                value={newAnnualPlan.description}
                onChange={(e) =>
                  setNewAnnualPlan({ ...newAnnualPlan, description: e.target.value })
                }
                placeholder="Describe the goals and scope of this annual maintenance plan..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateAnnualOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAnnual}>Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Monthly Plan Dialog */}
      <Dialog open={isCreateMonthlyOpen} onOpenChange={setIsCreateMonthlyOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Monthly Plan</DialogTitle>
            <DialogDescription>
              Add a monthly execution plan under an existing annual plan.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="monthly-annual">
                Annual Plan <span className="text-red-600">*</span>
              </Label>
              <Select
                onValueChange={async (v) => {
                  setNewMonthlyPlan({ ...newMonthlyPlan, annualPlanId: v, planDetailsId: "" });
                  try {
                    const detailsRes = await maintenancePlanningApi.searchPlanDetails({ annualPlanId: v });
                    const detailsArray = detailsRes?.data || (Array.isArray(detailsRes) ? detailsRes : []);
                    setAvailablePlanDetails(detailsArray);
                  } catch (err) {
                    console.error("Failed to fetch plan details", err);
                  }
                }}
              >
                <SelectTrigger id="monthly-annual">
                  <SelectValue placeholder="Select an annual plan" />
                </SelectTrigger>
                <SelectContent>
                  {annualPlans.map((a: any) => (
                    <SelectItem key={a.id} value={a.id}>
                      Year {a.fiscalYear || a.year} — {a.status} {a.active || a.isActive ? '(Active)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {availablePlanDetails.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="monthly-plan-detail">
                  Plan Detail (Task) <span className="text-red-600">*</span>
                </Label>
                <Select
                  onValueChange={(v) =>
                    setNewMonthlyPlan({ ...newMonthlyPlan, planDetailsId: v })
                  }
                >
                  <SelectTrigger id="monthly-plan-detail">
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlanDetails.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>
                        {d.description || d.taskName || d.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-month">
                  Month (1–12) <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="monthly-month"
                  type="number"
                  min={1}
                  max={12}
                  value={newMonthlyPlan.month}
                  onChange={(e) =>
                    setNewMonthlyPlan({ ...newMonthlyPlan, month: parseInt(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-year">
                  Year <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="monthly-year"
                  type="number"
                  value={newMonthlyPlan.year}
                  onChange={(e) =>
                    setNewMonthlyPlan({ ...newMonthlyPlan, year: parseInt(e.target.value) })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-description">Description</Label>
              <Textarea
                id="monthly-description"
                value={newMonthlyPlan.description}
                onChange={(e) =>
                  setNewMonthlyPlan({ ...newMonthlyPlan, description: e.target.value })
                }
                placeholder="Describe the maintenance tasks planned for this month..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateMonthlyOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMonthly}>Create Plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
