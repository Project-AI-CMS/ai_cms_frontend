'use client'
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ArrowLeft,
  Save,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Asset, AssetType, Location, AssetStatus } from '@/types';
import { assetApi, assetTypeApi, locationApi } from '@/lib/api';

type AssetFormProps = {
  assetId?: string; // undefined for create, id for edit
  onBack: () => void;
  onSuccess: () => void;
};

export function AssetForm({ assetId, onBack, onSuccess }: AssetFormProps) {
  const isEdit = !!assetId && assetId !== 'new';
  
  const [formData, setFormData] = useState({
    name: '',
    model_number: '',
    serial_number: '',
    asset_type_id: '',
    location_id: '',
    parent_asset_id: '',
    installation_date: '',
    current_health_score: 100,
    current_status: 'operational' as AssetStatus,
    manufacturer: '',
    rated_power: '',
    service_life: ''
  });

  const [assetTypes, setAssetTypes] = useState<AssetType[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [parentAssets, setParentAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(isEdit);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchFormData();
  }, [assetId]);

  const fetchFormData = async () => {
    try {
      // Fetch dropdown data
      const [typesData, locationsData, assetsData] = await Promise.all([
        assetTypeApi.getAll(),
        locationApi.getAll(),
        assetApi.getAll({})
      ]);

      setAssetTypes(typesData);
      setLocations(locationsData);
      setParentAssets(assetsData.data);

      // If editing, fetch asset data
      if (isEdit) {
        const assetData = await assetApi.getById(assetId);
        setFormData({
          name: assetData.name,
          model_number: assetData.model_number,
          serial_number: assetData.serial_number,
          asset_type_id: assetData.asset_type_id,
          location_id: assetData.location_id,
          parent_asset_id: assetData.parent_asset_id || '',
          installation_date: assetData.installation_date,
          current_health_score: assetData.current_health_score,
          current_status: assetData.current_status,
          manufacturer: assetData.manufacturer || '',
          rated_power: assetData.rated_power || '',
          service_life: assetData.service_life || ''
        });
      }
    } catch (error) {
      setError('Failed to load form data');
      console.error(error);
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Asset name is required';
    if (!formData.model_number.trim()) newErrors.model_number = 'Model number is required';
    if (!formData.serial_number.trim()) newErrors.serial_number = 'Serial number is required';
    if (!formData.asset_type_id) newErrors.asset_type_id = 'Asset type is required';
    if (!formData.location_id) newErrors.location_id = 'Location is required';
    if (!formData.installation_date) newErrors.installation_date = 'Installation date is required';
    if (formData.current_health_score < 0 || formData.current_health_score > 100) {
      newErrors.current_health_score = 'Health score must be between 0 and 100';
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
      const submitData = {
        ...formData,
        parent_asset_id: formData.parent_asset_id || null
      };

      if (isEdit) {
        await assetApi.update(assetId, submitData);
        setSuccess('Asset updated successfully');
      } else {
        await assetApi.create(submitData);
        setSuccess('Asset created successfully');
      }

      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (error: any) {
      setError(error.message || 'Failed to save asset');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: any) => {
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

  if (initialLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 mt-4">Loading asset data...</p>
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
            {isEdit ? 'Edit Asset' : 'Create New Asset'}
          </h2>
          <p className="text-slate-600">
            {isEdit ? 'Update asset information' : 'Add a new asset to the system'}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">
                    Asset Name <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Enter asset name"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && <p className="text-sm text-red-600 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <Label htmlFor="model_number">
                    Model Number <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="model_number"
                    value={formData.model_number}
                    onChange={(e) => handleChange('model_number', e.target.value)}
                    placeholder="Enter model number"
                    className={errors.model_number ? 'border-red-500' : ''}
                  />
                  {errors.model_number && <p className="text-sm text-red-600 mt-1">{errors.model_number}</p>}
                </div>

                <div>
                  <Label htmlFor="serial_number">
                    Serial Number <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="serial_number"
                    value={formData.serial_number}
                    onChange={(e) => handleChange('serial_number', e.target.value)}
                    placeholder="Enter serial number"
                    className={errors.serial_number ? 'border-red-500' : ''}
                  />
                  {errors.serial_number && <p className="text-sm text-red-600 mt-1">{errors.serial_number}</p>}
                </div>

                <div>
                  <Label htmlFor="manufacturer">Manufacturer</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleChange('manufacturer', e.target.value)}
                    placeholder="Enter manufacturer"
                  />
                </div>
              </div>
            </div>

            {/* Classification */}
            <div>
              <h3 className="text-lg text-slate-900 mb-4">Classification</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="asset_type_id">
                    Asset Type <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.asset_type_id}
                    onValueChange={(value) => handleChange('asset_type_id', value)}
                  >
                    <SelectTrigger className={errors.asset_type_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select asset type" />
                    </SelectTrigger>
                    <SelectContent>
                      {assetTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.asset_type_id && <p className="text-sm text-red-600 mt-1">{errors.asset_type_id}</p>}
                </div>

                <div>
                  <Label htmlFor="location_id">
                    Location <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.location_id}
                    onValueChange={(value) => handleChange('location_id', value)}
                  >
                    <SelectTrigger className={errors.location_id ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map(location => (
                        <SelectItem key={location.id} value={location.id}>
                          {location.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.location_id && <p className="text-sm text-red-600 mt-1">{errors.location_id}</p>}
                </div>

                <div>
                  <Label htmlFor="parent_asset_id">Parent Asset (Optional)</Label>
                  <Select
                    value={formData.parent_asset_id || 'none'}
                    onValueChange={(value) => handleChange('parent_asset_id', value === 'none' ? '' : value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent asset (if any)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {parentAssets
                        .filter(a => a.id !== assetId) // Don't allow self as parent
                        .map(asset => (
                          <SelectItem key={asset.id} value={asset.id}>
                            {asset.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="installation_date">
                    Installation Date <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="installation_date"
                    type="date"
                    value={formData.installation_date}
                    onChange={(e) => handleChange('installation_date', e.target.value)}
                    className={errors.installation_date ? 'border-red-500' : ''}
                  />
                  {errors.installation_date && <p className="text-sm text-red-600 mt-1">{errors.installation_date}</p>}
                </div>
              </div>
            </div>

            {/* Technical Specifications */}
            <div>
              <h3 className="text-lg text-slate-900 mb-4">Technical Specifications</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rated_power">Rated Power</Label>
                  <Input
                    id="rated_power"
                    value={formData.rated_power}
                    onChange={(e) => handleChange('rated_power', e.target.value)}
                    placeholder="e.g., 600 MW"
                  />
                </div>

                <div>
                  <Label htmlFor="service_life">Service Life</Label>
                  <Input
                    id="service_life"
                    value={formData.service_life}
                    onChange={(e) => handleChange('service_life', e.target.value)}
                    placeholder="e.g., 30 years"
                  />
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div>
              <h3 className="text-lg text-slate-900 mb-4">Status Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current_status">
                    Current Status <span className="text-red-600">*</span>
                  </Label>
                  <Select
                    value={formData.current_status}
                    onValueChange={(value) => handleChange('current_status', value as AssetStatus)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="standby">Standby</SelectItem>
                      <SelectItem value="pending_repair">Pending Repair</SelectItem>
                      <SelectItem value="under_repair">Under Repair</SelectItem>
                      <SelectItem value="scrapped">Scrapped</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="current_health_score">
                    Health Score (0-100) <span className="text-red-600">*</span>
                  </Label>
                  <Input
                    id="current_health_score"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.current_health_score}
                    onChange={(e) => handleChange('current_health_score', parseInt(e.target.value) || 0)}
                    className={errors.current_health_score ? 'border-red-500' : ''}
                  />
                  {errors.current_health_score && <p className="text-sm text-red-600 mt-1">{errors.current_health_score}</p>}
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
            {loading ? 'Saving...' : isEdit ? 'Update Asset' : 'Create Asset'}
          </Button>
        </div>
      </form>
    </div>
  );
}
