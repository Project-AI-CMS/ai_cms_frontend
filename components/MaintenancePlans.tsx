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
import { maintenancePlanningApi, userApi } from "@/lib/api";
import { MachineMaintenanceScheduleDto, MPMAnnualPlanDto, MPMMonthlyPlanDto, PlanChangeDto, UserInfo } from "@/types";
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
  const [planChanges, setPlanChanges] = useState<PlanChangeDto[]>([]);
  const [machinesNeedingPlans, setMachinesNeedingPlans] = useState<MachineMaintenanceScheduleDto[]>([]);
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
    formanId: user?.id || "",
    machineCondition: "",
    remark: "",
    nextMntPlanFrom: "",
    nextMntPlanTo: "",
  });
  const [availablePlanDetails, setAvailablePlanDetails] = useState<any[]>([]);
  const [foremen, setForemen] = useState<any[]>([]);
  const [loadingForemen, setLoadingForemen] = useState(false);
  const [loadingPlanDetails, setLoadingPlanDetails] = useState(false);
  const [monthlyFilterAnnualId, setMonthlyFilterAnnualId] = useState("");
  const [activeMonthlyFilter, setActiveMonthlyFilter] = useState("all");

  const canEdit = user?.role === "ADMIN" || user?.role === "MAINTENANCE_MANAGER";

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [annual, monthly, changes, machines] = await Promise.all([
        maintenancePlanningApi.getAllAnnualPlans(),
        maintenancePlanningApi.getAllMonthlyPlans(),
        maintenancePlanningApi.getAllPlanChanges(),
        maintenancePlanningApi.getMachinesNeedingMonthlyPlans(),
      ]);
      setAnnualPlans(Array.isArray(annual) ? annual : []);
      setMonthlyPlans(Array.isArray(monthly) ? monthly : []);
      setPlanChanges(Array.isArray(changes) ? changes : []);
      setMachinesNeedingPlans(Array.isArray(machines) ? machines : []);
    } catch (err: any) {
      setError(err.message || "Failed to fetch maintenance plans");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  useEffect(() => {
    if (!isCreateMonthlyOpen) return;

    const toArray = (res: any): any[] => {
      if (Array.isArray(res)) return res;
      if (res && Array.isArray(res.data)) return res.data;
      if (res && Array.isArray(res.content)) return res.content;
      if (res && Array.isArray(res.items)) return res.items;
      return [];
    };

    const loadForemen = async () => {
      setLoadingForemen(true);
      try {
        const users = toArray(await userApi.getAll());
        const foremanUsers = users.filter((u) =>
          String(u.role || u.roleName || u.position || "").toLowerCase().includes("foreman"),
        );
        setForemen(foremanUsers.length ? foremanUsers : users);
      } catch (err) {
        console.error("Failed to fetch foremen", err);
        setForemen(user?.id ? [{ id: user.id, name: user.name, email: user.email, role: user.role }] : []);
      } finally {
        setLoadingForemen(false);
      }
    };

    loadForemen();
  }, [isCreateMonthlyOpen, user]);

  const handleCreateAnnual = async () => {
    try {
      await maintenancePlanningApi.createAnnualPlan({
        fiscalYear: newAnnualPlan.year,
        status: "DRAFT",
        active: false,
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
      if (!newMonthlyPlan.planDetailsId || !newMonthlyPlan.formanId || !newMonthlyPlan.nextMntPlanFrom || !newMonthlyPlan.nextMntPlanTo) {
        setError("Plan detail, foreman, start date, and end date are required.");
        return;
      }
      await maintenancePlanningApi.createMonthlyPlan({
        planDetailsId: newMonthlyPlan.planDetailsId,
        formanId: newMonthlyPlan.formanId,
        machineCondition: newMonthlyPlan.machineCondition || undefined,
        remark: newMonthlyPlan.remark || undefined,
        nextMntPlanFrom: newMonthlyPlan.nextMntPlanFrom,
        nextMntPlanTo: newMonthlyPlan.nextMntPlanTo,
      });
      setSuccess("Monthly plan created successfully");
      setIsCreateMonthlyOpen(false);
      setNewMonthlyPlan({ annualPlanId: "", planDetailsId: "", formanId: user?.id || "", machineCondition: "", remark: "", nextMntPlanFrom: "", nextMntPlanTo: "" });
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
      PENDING_VERIFICATION: "bg-yellow-100 text-yellow-700",
      PENDING_APPROVAL: "bg-blue-100 text-blue-700",
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

  const formatMaintenanceMonths = (months?: string) => {
    if (!months) return "";
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const selected = months.length === 12 && /^[01]+$/.test(months)
      ? months.split("").map((value, index) => value === "1" ? monthLabels[index] : null).filter(Boolean)
      : months.split(",").map((month) => monthLabels[Number(month.trim()) - 1] || month.trim()).filter(Boolean);

    return selected.length ? selected.join(", ") : "";
  };

  const loadMonthlyPlans = async (mode: "all" | "foreman" | "confirmed" | "annual", value?: string) => {
    setLoading(true);
    setError("");
    try {
      const data = mode === "foreman" && value
        ? await maintenancePlanningApi.getMonthlyPlansByForman(value)
        : mode === "confirmed" && value
          ? await maintenancePlanningApi.getMonthlyPlansByConfirmedBy(value)
          : mode === "annual" && value
            ? await maintenancePlanningApi.getMonthlyPlansByAnnualPlan(value)
            : await maintenancePlanningApi.getAllMonthlyPlans();
      setMonthlyPlans(Array.isArray(data) ? data : []);
      setActiveMonthlyFilter(mode);
    } catch (err: any) {
      setError(err.message || "Failed to load monthly plans");
    } finally {
      setLoading(false);
    }
  };

  const monthlyPlanDetailOptions = availablePlanDetails.map((detail: any) => {
    const schedule = formatMaintenanceMonths(detail.monthsOfMaintenance);
    return {
      id: detail.id,
      label: `${detail.description || detail.machineName || detail.machineId || detail.id}${schedule ? ` - ${schedule}` : ""}`,
      nextMaintenanceMonth: undefined as string | undefined,
    };
  });

  const handleSelectAnnualPlan = async (annualPlanId: string) => {
    setNewMonthlyPlan({ ...newMonthlyPlan, annualPlanId, planDetailsId: "" });
    setAvailablePlanDetails([]);
    setError("");
    setLoadingPlanDetails(true);
    try {
      const detailsRes = await maintenancePlanningApi.searchPlanDetails({ annualPlanId });
      const detailsArray = detailsRes?.data || (Array.isArray(detailsRes) ? detailsRes : []);
      setAvailablePlanDetails(detailsArray);
    } catch (err: any) {
      setError(err.message || "Failed to fetch annual plan details");
    } finally {
      setLoadingPlanDetails(false);
    }
  };

  const handleSelectMonthlyPlanDetail = (planDetailsId: string) => {
    const selected = monthlyPlanDetailOptions.find((option) => option.id === planDetailsId);
    const nextDate = selected?.nextMaintenanceMonth || "";
    setNewMonthlyPlan({
      ...newMonthlyPlan,
      planDetailsId,
      nextMntPlanFrom: newMonthlyPlan.nextMntPlanFrom || nextDate,
      nextMntPlanTo: newMonthlyPlan.nextMntPlanTo || nextDate,
    });
  };

  const foremanOptions = foremen
    .map((foreman) => ({
      id: foreman.id || foreman.userId,
      label: [foreman.name || foreman.fullName || foreman.email || foreman.username, foreman.role || foreman.roleName]
        .filter(Boolean)
        .join(" - "),
    }))
    .filter((foreman) => foreman.id);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 border-amber-200 bg-amber-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-amber-700">Machines Needing Monthly Plans</p>
              <p className="text-2xl font-bold text-amber-900">{machinesNeedingPlans.length}</p>
            </div>
            <AlertCircle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="space-y-2 max-h-32 overflow-auto">
            {machinesNeedingPlans.slice(0, 4).map((machine) => (
              <div key={machine.planDetailsId} className="text-sm text-amber-900 flex justify-between gap-3">
                <span>{machine.machineName || machine.machineId}</span>
                <span>{machine.daysUntilMaintenance} days</span>
              </div>
            ))}
            {machinesNeedingPlans.length === 0 && <p className="text-sm text-amber-700">No machines currently require monthly planning.</p>}
          </div>
        </Card>
        <Card className="p-4 border-cyan-200 bg-cyan-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm text-cyan-700">Plan Change Requests</p>
              <p className="text-2xl font-bold text-cyan-900">{planChanges.length}</p>
            </div>
            <RefreshCw className="w-6 h-6 text-cyan-600" />
          </div>
          <div className="space-y-2 max-h-32 overflow-auto">
            {planChanges.slice(0, 4).map((change) => (
              <div key={change.id} className="text-sm text-cyan-900 flex justify-between gap-3">
                <span>{change.reasonJustification}</span>
                <Badge variant="outline">{change.status}</Badge>
              </div>
            ))}
            {planChanges.length === 0 && <p className="text-sm text-cyan-700">No schedule change requests found.</p>}
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
      {activeTab === "monthly" && (
        <Card className="p-5 mt-4 border-purple-100 bg-gradient-to-r from-purple-50 to-white">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-slate-900">Monthly Plan Filters</h3>
              <p className="text-sm text-slate-500">Focus the execution list by responsibility or annual plan.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4 items-end">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { key: "all", label: "All Plans", description: "Every monthly execution plan", onClick: () => { setMonthlyFilterAnnualId(""); loadMonthlyPlans("all"); }, disabled: false },
                  { key: "foreman", label: "My Foreman Plans", description: "Plans assigned to me", onClick: () => user?.id && loadMonthlyPlans("foreman", user.id), disabled: !user?.id },
                  { key: "confirmed", label: "Confirmed by Me", description: "Plans I confirmed", onClick: () => user?.id && loadMonthlyPlans("confirmed", user.id), disabled: !user?.id },
                ].map((filter) => (
                  <button
                    key={filter.key}
                    type="button"
                    onClick={filter.onClick}
                    disabled={filter.disabled}
                    className={`rounded-xl border p-3 text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      activeMonthlyFilter === filter.key
                        ? "border-purple-300 bg-white shadow-sm"
                        : "border-slate-200 bg-white/70 hover:bg-white"
                    }`}
                  >
                    <p className="text-sm font-medium text-slate-900">{filter.label}</p>
                    <p className="text-xs text-slate-500 mt-1">{filter.description}</p>
                  </button>
                ))}
              </div>
              <div className="space-y-2 rounded-xl border border-purple-200 bg-white p-3 shadow-sm">
                <Label className="text-xs font-semibold uppercase tracking-wide text-purple-700">Filter by Annual Plan</Label>
                <Select
                  value={monthlyFilterAnnualId || "all"}
                  onValueChange={(annualPlanId) => {
                    const next = annualPlanId === "all" ? "" : annualPlanId;
                    setMonthlyFilterAnnualId(next);
                    loadMonthlyPlans(next ? "annual" : "all", next);
                  }}
                >
                  <SelectTrigger className="h-11 border-purple-300 bg-purple-50 text-slate-950 shadow-sm focus:ring-2 focus:ring-purple-400">
                    <SelectValue placeholder="Choose annual plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All annual plans</SelectItem>
                    {annualPlans.map((plan: any) => (
                      <SelectItem key={plan.id} value={plan.id}>
                        Year {plan.fiscalYear || plan.year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>
      )}
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
                          Created: {safeDate(plan.createdAt)}
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
                              {plan.nextMntPlanFrom ? `${safeDate(plan.nextMntPlanFrom)} - ${safeDate(plan.nextMntPlanTo)}` : `${getMonthName(plan.month || 1)} ${plan.year || ""}`}
                            </h3>
                            <Badge className={`border-0 ${getStatusBadge(plan.status)}`}>
                              {plan.status}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                Plan Detail: {plan.planDetailsId?.substring(0, 8) || annualDisplay}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <CalendarDays className="w-4 h-4" />
                              <span>
                                Next Window: {safeDate(plan.nextMntPlanFrom)} to {safeDate(plan.nextMntPlanTo)}
                              </span>
                            </div>
                          </div>
                          <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm text-slate-700">
                              {plan.remark || plan.machineCondition || plan.description || "No remarks provided."}
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
        <DialogContent className="sm:max-w-[600px]">
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
                Annual Plan
              </Label>
              <Select
                value={newMonthlyPlan.annualPlanId}
                onValueChange={handleSelectAnnualPlan}
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
            <div className="space-y-2">
              <Label htmlFor="monthly-plan-detail">
                Plan Detail / Machine Schedule <span className="text-red-600">*</span>
              </Label>
              <Select
                value={newMonthlyPlan.planDetailsId}
                onValueChange={handleSelectMonthlyPlanDetail}
                disabled={!newMonthlyPlan.annualPlanId || loadingPlanDetails || monthlyPlanDetailOptions.length === 0}
              >
                <SelectTrigger id="monthly-plan-detail">
                  <SelectValue placeholder={
                    loadingPlanDetails
                      ? "Loading plan details..."
                      : newMonthlyPlan.annualPlanId
                        ? "Select a plan detail"
                        : "Select annual plan first"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {monthlyPlanDetailOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {newMonthlyPlan.annualPlanId && availablePlanDetails.length === 0 && (
                <p className="text-xs text-slate-500">
                  This annual plan does not have plan details yet.
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-forman">
                Foreman <span className="text-red-600">*</span>
              </Label>
              <Select
                value={newMonthlyPlan.formanId}
                onValueChange={(formanId) => setNewMonthlyPlan({ ...newMonthlyPlan, formanId })}
                disabled={loadingForemen || foremanOptions.length === 0}
              >
                <SelectTrigger id="monthly-forman">
                  <SelectValue placeholder={loadingForemen ? "Loading foremen..." : "Select foreman"} />
                </SelectTrigger>
                <SelectContent>
                  {foremanOptions.map((foreman) => (
                    <SelectItem key={foreman.id} value={foreman.id}>
                      {foreman.label || foreman.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {!loadingForemen && foremanOptions.length === 0 && (
                <p className="text-xs text-slate-500">No users available to assign as foreman.</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-from">
                  Start Date <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="monthly-from"
                  type="date"
                  value={newMonthlyPlan.nextMntPlanFrom}
                  onChange={(e) =>
                    setNewMonthlyPlan({ ...newMonthlyPlan, nextMntPlanFrom: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-to">
                  End Date <span className="text-red-600">*</span>
                </Label>
                <Input
                  id="monthly-to"
                  type="date"
                  value={newMonthlyPlan.nextMntPlanTo}
                  onChange={(e) =>
                    setNewMonthlyPlan({ ...newMonthlyPlan, nextMntPlanTo: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-condition">Machine Condition</Label>
              <Input
                id="monthly-condition"
                value={newMonthlyPlan.machineCondition}
                onChange={(e) => setNewMonthlyPlan({ ...newMonthlyPlan, machineCondition: e.target.value })}
                placeholder="Observed condition before planning"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthly-remark">Remark</Label>
              <Textarea
                id="monthly-remark"
                value={newMonthlyPlan.remark}
                onChange={(e) =>
                  setNewMonthlyPlan({ ...newMonthlyPlan, remark: e.target.value })
                }
                placeholder="Optional remarks about this maintenance period..."
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateMonthlyOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateMonthly}
              disabled={!newMonthlyPlan.planDetailsId || !newMonthlyPlan.formanId || !newMonthlyPlan.nextMntPlanFrom || !newMonthlyPlan.nextMntPlanTo}
            >
              Create Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
