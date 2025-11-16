'use client'
import { useState } from 'react';
import { AssetList } from './AssetList';
import { AssetDetail } from './AssetDetail';
import { AssetForm } from './AssetForm';
import { AssetHierarchy } from './AssetHierarchy';
import { AssetTypeManagement } from './AssetTypeManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { UserInfo } from '@/types';

type AssetManagementProps = {
  user: UserInfo;
};

type ViewMode = 'list' | 'detail' | 'form' | 'hierarchy' | 'types';

export function AssetManagement({ user }: AssetManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedAssetId, setSelectedAssetId] = useState<string | undefined>();
  const [activeTab, setActiveTab] = useState('list');

  const handleViewAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setViewMode('detail');
  };

  const handleEditAsset = (assetId: string) => {
    setSelectedAssetId(assetId);
    setViewMode('form');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedAssetId(undefined);
    setActiveTab('list');
  };

  const handleFormSuccess = () => {
    handleBackToList();
  };

  // If in detail or form view, show that component
  if (viewMode === 'detail' && selectedAssetId) {
    return (
      <AssetDetail
        assetId={selectedAssetId}
        onBack={handleBackToList}
        onEdit={user.role === 'Administrator' || user.role === 'Maintenance Manager' ? handleEditAsset : undefined}
      />
    );
  }

  if (viewMode === 'form') {
    return (
      <AssetForm
        assetId={selectedAssetId}
        onBack={handleBackToList}
        onSuccess={handleFormSuccess}
      />
    );
  }

  // Main tabbed view
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="list">Asset List</TabsTrigger>
        <TabsTrigger value="hierarchy">Hierarchy</TabsTrigger>
        {(user.role === 'Administrator') && (
          <TabsTrigger value="types">Asset Types</TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="list" className="mt-6">
        <AssetList
          user={user}
          onViewAsset={handleViewAsset}
          onEditAsset={handleEditAsset}
        />
      </TabsContent>

      <TabsContent value="hierarchy" className="mt-6">
        <AssetHierarchy onViewAsset={handleViewAsset} />
      </TabsContent>

      {user.role === 'Administrator' && (
        <TabsContent value="types" className="mt-6">
          <AssetTypeManagement user={user} />
        </TabsContent>
      )}
    </Tabs>
  );
}
