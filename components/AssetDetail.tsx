'use client'
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Label } from './ui/label';
import { 
  ArrowLeft,
  Edit,
  MapPin,
  Calendar,
  Package,
  Activity,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Asset, AssetType, Location, AssetStatus } from '@/types';
import { assetApi, assetTypeApi, locationApi } from '@/lib/api';

const statusConfig: Record<AssetStatus, { label: string; color: string }> = {
  operational: { label: 'Operational', color: 'bg-green-100 text-green-700' },
  standby: { label: 'Standby', color: 'bg-blue-100 text-blue-700' },
  pending_repair: { label: 'Pending Repair', color: 'bg-orange-100 text-orange-700' },
  under_repair: { label: 'Under Repair', color: 'bg-red-100 text-red-700' },
  scrapped: { label: 'Scrapped', color: 'bg-gray-100 text-gray-700' }
};

type AssetDetailProps = {
  assetId: string;
  onBack: () => void;
  onEdit?: (assetId: string) => void;
};

export function AssetDetail({ assetId, onBack, onEdit }: AssetDetailProps) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [assetType, setAssetType] = useState<AssetType | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [parentAsset, setParentAsset] = useState<Asset | null>(null);
  const [childAssets, setChildAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssetDetails();
  }, [assetId]);

  const fetchAssetDetails = async () => {
    setLoading(true);
    try {
      // Fetch main asset
      const assetData = await assetApi.getById(assetId);
      setAsset(assetData);

      // Fetch related data
      const [typeData, locationData, allAssets] = await Promise.all([
        assetTypeApi.getById(assetData.asset_type_id),
        locationApi.getById(assetData.location_id),
        assetApi.getAll({})
      ]);

      setAssetType(typeData);
      setLocation(locationData);

      // Find parent and children
      if (assetData.parent_asset_id) {
        const parent = await assetApi.getById(assetData.parent_asset_id);
        setParentAsset(parent);
      }

      const children = allAssets.data.filter(a => a.parent_asset_id === assetId);
      setChildAssets(children);
    } catch (error) {
      console.error('Failed to fetch asset details:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 mt-4">Loading asset details...</p>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <p className="text-slate-600">Asset not found</p>
        <Button onClick={onBack} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h2 className="text-2xl text-slate-900 mb-1">{asset.name}</h2>
            <p className="text-slate-600">Asset ID: {asset.id}</p>
          </div>
        </div>
        {onEdit && (
          <Button onClick={() => onEdit(asset.id)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Asset
          </Button>
        )}
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Health Score</p>
              <p className={`text-2xl ${getHealthScoreColor(asset.current_health_score)}`}>
                {asset.current_health_score}%
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <Badge className={`${statusConfig[asset.current_status].color} mt-1`}>
                {statusConfig[asset.current_status].label}
              </Badge>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Installed</p>
              <p className="text-sm text-slate-900 mt-1">
                {new Date(asset.installation_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Location</p>
              <p className="text-sm text-slate-900 mt-1">{location?.name || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">Basic Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-600">Asset Name</Label>
                <p className="text-slate-900 mt-1">{asset.name}</p>
              </div>
              <div>
                <Label className="text-slate-600">Model Number</Label>
                <p className="text-slate-900 mt-1">{asset.model_number}</p>
              </div>
              <div>
                <Label className="text-slate-600">Serial Number</Label>
                <p className="text-slate-900 mt-1">{asset.serial_number}</p>
              </div>
              <div>
                <Label className="text-slate-600">Asset Type</Label>
                <p className="text-slate-900 mt-1">{assetType?.name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-slate-600">Manufacturer</Label>
                <p className="text-slate-900 mt-1">{asset.manufacturer || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-slate-600">Installation Date</Label>
                <p className="text-slate-900 mt-1">
                  {new Date(asset.installation_date).toLocaleDateString()}
                </p>
              </div>
              {asset.rated_power && (
                <div>
                  <Label className="text-slate-600">Rated Power</Label>
                  <p className="text-slate-900 mt-1">{asset.rated_power}</p>
                </div>
              )}
              {asset.service_life && (
                <div>
                  <Label className="text-slate-600">Service Life</Label>
                  <p className="text-slate-900 mt-1">{asset.service_life}</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">Location Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-600">Location</Label>
                <p className="text-slate-900 mt-1">{location?.name || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-slate-600">Location Description</Label>
                <p className="text-slate-900 mt-1">{location?.description || 'N/A'}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">Status Information</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label className="text-slate-600">Current Status</Label>
                <Badge className={`${statusConfig[asset.current_status].color} mt-1`}>
                  {statusConfig[asset.current_status].label}
                </Badge>
              </div>
              <div>
                <Label className="text-slate-600">Health Score</Label>
                <p className={`text-2xl mt-1 ${getHealthScoreColor(asset.current_health_score)}`}>
                  {asset.current_health_score}%
                </p>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="hierarchy" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">Asset Hierarchy</h3>
            
            {/* Parent Asset */}
            {parentAsset && (
              <div className="mb-6">
                <Label className="text-slate-600 mb-2 block">Parent Asset</Label>
                <div className="flex items-center gap-3 p-4 border rounded-lg bg-gray-50">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                  <div className="flex-1">
                    <p className="text-slate-900">{parentAsset.name}</p>
                    <p className="text-sm text-slate-500">{parentAsset.model_number}</p>
                  </div>
                  <Badge className={statusConfig[parentAsset.current_status].color}>
                    {statusConfig[parentAsset.current_status].label}
                  </Badge>
                </div>
              </div>
            )}

            {/* Current Asset */}
            <div className="mb-6">
              <Label className="text-slate-600 mb-2 block">Current Asset</Label>
              <div className="flex items-center gap-3 p-4 border-2 border-blue-500 rounded-lg bg-blue-50">
                <Package className="w-5 h-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-slate-900 font-medium">{asset.name}</p>
                  <p className="text-sm text-slate-500">{asset.model_number}</p>
                </div>
                <Badge className={statusConfig[asset.current_status].color}>
                  {statusConfig[asset.current_status].label}
                </Badge>
              </div>
            </div>

            {/* Child Assets */}
            {childAssets.length > 0 && (
              <div>
                <Label className="text-slate-600 mb-2 block">Child Assets ({childAssets.length})</Label>
                <div className="space-y-2">
                  {childAssets.map(child => (
                    <div key={child.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                      <div className="flex-1">
                        <p className="text-slate-900">{child.name}</p>
                        <p className="text-sm text-slate-500">{child.model_number}</p>
                      </div>
                      <span className={`text-sm ${getHealthScoreColor(child.current_health_score)}`}>
                        {child.current_health_score}%
                      </span>
                      <Badge className={statusConfig[child.current_status].color}>
                        {statusConfig[child.current_status].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!parentAsset && childAssets.length === 0 && (
              <p className="text-slate-500 text-center py-8">
                This asset has no parent or child assets
              </p>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg text-slate-900 mb-4">Asset History</h3>
            <div className="space-y-4">
              {[
                { date: '2025-10-15', event: 'Status changed to Operational', user: 'Zhang Wei' },
                { date: '2025-10-10', event: 'Health score updated to ' + asset.current_health_score + '%', user: 'System' },
                { date: '2025-09-25', event: 'Routine inspection completed', user: 'Li Ming' },
                { date: asset.installation_date, event: 'Asset installed', user: 'Installation Team' }
              ].map((record, index) => (
                <div key={index} className="flex items-start gap-3 pb-4 border-b last:border-0">
                  <div className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                  <div className="flex-1">
                    <p className="text-sm text-slate-900">{record.event}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(record.date).toLocaleDateString()} • {record.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
