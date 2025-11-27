"use client";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import {
  AlertCircle,
  CheckCircle2,
  Send,
} from "lucide-react";
import { Asset, UserInfo } from "@/types";
import { maintenanceRequestApi, assetApi } from "@/lib/api";

type MaintenanceRequestFormProps = {
  user: UserInfo;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
};

export function MaintenanceRequestForm({ user, open, onOpenChange, onSuccess }: MaintenanceRequestFormProps) {
  const [formData, setFormData] = useState({
    assetId: '',
    description: '',
  });

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (open) {
      fetchAssets();
      // Reset form when opening
      setFormData({
        assetId: '',
        description: '',
      });
      setError('');
      setSuccess('');
      setErrors({});
    }
  }, [open]);

  const fetchAssets = async () => {
    setAssetsLoading(true);
    try {
      const response = await assetApi.getAll({});
      
      // Handle assets response
      if (Array.isArray(response)) {
        setAssets(response);
      } else {
        setAssets(response.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setError('Failed to load assets. Please try again.');
    } finally {
      setAssetsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.assetId) newErrors.assetId = 'Asset is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      setError('Please fix the validation errors');
      return;
    }

    setLoading(true);
    try {
      await maintenanceRequestApi.create({
        assetId: formData.assetId,
        description: formData.description.trim(),
        requestedBy: "acde070d-8c4c-4f0d-9d8a-162843c10333", // TODO: Use actual user ID when available
      });

      setSuccess('Maintenance request submitted successfully');
      setTimeout(() => {
        onSuccess();
        onOpenChange(false);
      }, 1500);
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || 'Failed to submit maintenance request';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Maintenance Request</DialogTitle>
          <DialogDescription>
            Submit a request for maintenance work. This will be reviewed by the maintenance team.
          </DialogDescription>
        </DialogHeader>

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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Requested By (Read-only) */}
          <div>
            <Label htmlFor="requestedBy">Requested By</Label>
            <Input
              id="requestedBy"
              value={user.name}
              disabled
              className="bg-gray-50"
            />
          </div>

          {/* Asset Selection */}
          <div>
            <Label htmlFor="assetId">
              Asset <span className="text-red-600">*</span>
            </Label>
            <Select
              value={formData.assetId}
              onValueChange={(value) => handleChange('assetId', value)}
              disabled={assetsLoading}
            >
              <SelectTrigger className={errors.assetId ? 'border-red-500' : ''}>
                <SelectValue placeholder={assetsLoading ? "Loading assets..." : "Select asset that needs maintenance"} />
              </SelectTrigger>
              <SelectContent>
                {assets.map(asset => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name} ({asset.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.assetId && <p className="text-sm text-red-600 mt-1">{errors.assetId}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">
              Problem Description <span className="text-red-600">*</span>
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Describe the problem or maintenance needed in detail..."
              rows={4}
              className={errors.description ? 'border-red-500' : ''}
            />
            <p className="text-xs text-slate-500 mt-1">
              Minimum 10 characters. Be specific about the issue, symptoms, and any safety concerns.
            </p>
            {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || assetsLoading}>
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit Request'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}