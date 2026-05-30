"use client";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  WorkOrder,
  WorkOrderType,
  WorkOrderStatus,
  WorkOrderPriority,
  Asset,
  User,
  UserInfo,
} from "@/types";
import { workOrderApi, assetApi } from "@/lib/api";
// Mock technicians list — use this instead of fetching from `userApi`
const MOCK_TECHNICIANS: User[] = [
  {
    id: "tech-1",
    name: "Alice Johnson",
    email: "alice.johnson@example.com",
  } as User,
  { id: "tech-2", name: "Bob Smith", email: "bob.smith@example.com" } as User,
  {
    id: "tech-3",
    name: "Carlos Rivera",
    email: "carlos.rivera@example.com",
  } as User,
];

type WorkOrderFormProps = {
  workOrderId?: string; // undefined for create, id for edit
  user: UserInfo;
  onBack: () => void;
  onSuccess: () => void;
};

export function WorkOrderForm({
  workOrderId,
  user,
  onBack,
  onSuccess,
}: WorkOrderFormProps) {
  const isEdit = !!workOrderId && workOrderId !== "new";

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    workOrderType: "preventive_maintenance" as WorkOrderType,
    status: "draft" as WorkOrderStatus,
    priority: "medium" as WorkOrderPriority,
    assetId: "",
    assignedTechnicianId: "",
    scheduledDate: "",
    estimatedHours: "",
  });

  const [assets, setAssets] = useState<Asset[]>([]);
  const [technicians, setTechnicians] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFormData();
  }, [workOrderId]);

  const fetchFormData = async () => {
    try {
      // Fetch dropdown data (assets). Use mock technicians list instead of calling users API.
      const assetsData = await assetApi.getAll({});

      // Handle assets response
      if (Array.isArray(assetsData)) {
        setAssets(assetsData);
      } else {
        setAssets(assetsData.data || []);
      }

      // Use mock technicians list
      setTechnicians(MOCK_TECHNICIANS);

      // If editing, fetch work order data
      if (isEdit) {
        const workOrderData = await workOrderApi.getById(workOrderId);
        setFormData({
          title: workOrderData.workOrder?.description || workOrderData.description || "",
          description: workOrderData.workOrder?.description || workOrderData.description || "",
          workOrderType: workOrderData.workOrder?.workOrderType || workOrderData.workOrderType,
          status: workOrderData.workOrder?.status || workOrderData.status,
          priority: workOrderData.workOrder?.priority || workOrderData.priority,
          assetId: workOrderData.workOrder?.assetId || workOrderData.assetId,
          assignedTechnicianId: workOrderData.assignedTechnicianId || "",
          scheduledDate: workOrderData.scheduledDate
            ? workOrderData.scheduledDate.split("T")[0]
            : "",
          estimatedHours: workOrderData.estimatedHours?.toString() || "",
        });
      }
    } catch (error) {
      setError("Failed to load form data");
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim())
      newErrors.description = "Description is required";
    if (!formData.assetId) newErrors.assetId = "Asset is required";
    if (
      formData.estimatedHours &&
      (isNaN(Number(formData.estimatedHours)) ||
        Number(formData.estimatedHours) <= 0)
    ) {
      newErrors.estimatedHours = "Estimated hours must be a positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateForm()) {
      setError("Please fix the validation errors");
      return;
    }

    setLoading(true);
    try {
      if (isEdit) {
        await workOrderApi.update(workOrderId, {
          description: formData.description.trim(),
          priority: formData.priority,
        });
        setSuccess("Work order updated successfully");
      } else {
        await workOrderApi.create();
      }

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: unknown) {
      const message =
        (error as { message?: string })?.message || "Failed to save work order";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  if (initialLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 mt-4">Loading work order data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">
            {isEdit ? "Edit Work Order" : "Create New Work Order"}
          </h2>
          <p className="text-slate-600">
            {isEdit
              ? "Update work order information"
              : "Create a new work order for maintenance tasks"}
          </p>
        </div>
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

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <Card className="p-6">
          <div className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-lg text-slate-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">
                    Title <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Enter work order title"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="workOrderType">Work Order Type</Label>
                  <Select
                    value={formData.workOrderType}
                    onValueChange={(value) =>
                      handleChange("workOrderType", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preventive_maintenance">
                        Preventive Maintenance
                      </SelectItem>
                      <SelectItem value="corrective_maintenance">
                        Corrective Maintenance
                      </SelectItem>
                      <SelectItem value="inspection">Inspection</SelectItem>
                      <SelectItem value="emergency_repair">
                        Emergency Repair
                      </SelectItem>
                      <SelectItem value="installation">Installation</SelectItem>
                      <SelectItem value="decommission">Decommission</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => handleChange("priority", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="assetId">
                    Asset <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.assetId}
                    onValueChange={(value) => handleChange("assetId", value)}
                  >
                    <SelectTrigger
                      className={errors.assetId ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select asset" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.name} ({asset.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.assetId && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.assetId}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => handleChange("status", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="on_hold">On Hold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-600">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Describe the work to be performed..."
                    rows={4}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.description}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Assignment & Scheduling */}
            <div>
              <h3 className="text-lg text-slate-900 mb-4">
                Assignment & Scheduling
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="assignedTechnicianId">
                    Assigned Technician
                  </Label>
                  <Select
                    value={formData.assignedTechnicianId || "unassigned"}
                    onValueChange={(value) =>
                      handleChange(
                        "assignedTechnicianId",
                        value === "unassigned" ? "" : value
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {technicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          {tech.name} ({tech.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="scheduledDate">Scheduled Date</Label>
                  <Input
                    id="scheduledDate"
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) =>
                      handleChange("scheduledDate", e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.estimatedHours}
                    onChange={(e) =>
                      handleChange("estimatedHours", e.target.value)
                    }
                    placeholder="e.g., 4.5"
                    className={errors.estimatedHours ? "border-red-500" : ""}
                  />
                  {errors.estimatedHours && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.estimatedHours}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 mt-6">
          <Button type="button" variant="outline" onClick={onBack}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading
              ? "Saving..."
              : isEdit
              ? "Update Work Order"
              : "Create Work Order"}
          </Button>
        </div>
      </form>
    </div>
  );
}
