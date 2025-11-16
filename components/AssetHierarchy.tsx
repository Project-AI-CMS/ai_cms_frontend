'use client'
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ChevronDown,
  ChevronRight,
  GripVertical,
  AlertCircle,
  CheckCircle2,
  Activity
} from 'lucide-react';
import { Asset, AssetStatus } from '@/types';
import { assetApi } from '@/lib/api';

const statusConfig: Record<AssetStatus, { label: string; color: string }> = {
  operational: { label: 'Operational', color: 'bg-green-100 text-green-700' },
  standby: { label: 'Standby', color: 'bg-blue-100 text-blue-700' },
  pending_repair: { label: 'Pending Repair', color: 'bg-orange-100 text-orange-700' },
  under_repair: { label: 'Under Repair', color: 'bg-red-100 text-red-700' },
  scrapped: { label: 'Scrapped', color: 'bg-gray-100 text-gray-700' }
};

type TreeNode = Asset & {
  children: TreeNode[];
  level: number;
};

type AssetHierarchyProps = {
  onViewAsset?: (assetId: string) => void;
};

export function AssetHierarchy({ onViewAsset }: AssetHierarchyProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [draggedNode, setDraggedNode] = useState<TreeNode | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await assetApi.getHierarchy();
      setAssets(response);
      buildTree(response);
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      setError('Failed to load asset hierarchy');
    } finally {
      setLoading(false);
    }
  };

  const buildTree = (assetList: Asset[]) => {
    // Build tree structure
    const assetMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // First pass: create all nodes
    assetList.forEach(asset => {
      assetMap.set(asset.id, { ...asset, children: [], level: 0 });
    });

    // Second pass: build parent-child relationships
    assetList.forEach(asset => {
      const node = assetMap.get(asset.id)!;
      if (asset.parent_asset_id && assetMap.has(asset.parent_asset_id)) {
        const parent = assetMap.get(asset.parent_asset_id)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootNodes.push(node);
      }
    });

    // Sort children by name
    const sortChildren = (node: TreeNode) => {
      node.children.sort((a, b) => a.name.localeCompare(b.name));
      node.children.forEach(sortChildren);
    };
    rootNodes.forEach(sortChildren);

    setTreeData(rootNodes);
    
    // Expand root nodes by default
    setExpandedNodes(new Set(rootNodes.map(n => n.id)));
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const calculateAggregateHealth = (node: TreeNode): number => {
    if (node.children.length === 0) {
      return node.current_health_score;
    }
    const childrenHealth = node.children.map(calculateAggregateHealth);
    const avgChildHealth = childrenHealth.reduce((a, b) => a + b, 0) / childrenHealth.length;
    return Math.round((node.current_health_score + avgChildHealth) / 2);
  };

  const handleDragStart = (e: React.DragEvent, node: TreeNode) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetNode: TreeNode | null) => {
    e.preventDefault();
    
    if (!draggedNode) return;

    // Prevent dropping on self or descendants
    if (targetNode && isDescendant(draggedNode, targetNode)) {
      setError('Cannot move an asset to its own descendant');
      setTimeout(() => setError(''), 3000);
      setDraggedNode(null);
      return;
    }

    try {
      const newParentId = targetNode?.id || null;
      await assetApi.updateHierarchy(draggedNode.id, newParentId);
      setSuccess(`Successfully moved ${draggedNode.name}`);
      setTimeout(() => setSuccess(''), 3000);
      fetchAssets(); // Refresh the tree
    } catch (error: any) {
      setError(error.message || 'Failed to update hierarchy');
      setTimeout(() => setError(''), 3000);
    } finally {
      setDraggedNode(null);
    }
  };

  const isDescendant = (ancestor: TreeNode, node: TreeNode): boolean => {
    if (ancestor.id === node.id) return true;
    return ancestor.children.some(child => isDescendant(child, node));
  };

  const renderTreeNode = (node: TreeNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.children.length > 0;
    const aggregateHealth = calculateAggregateHealth(node);

    return (
      <div key={node.id}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, node)}
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-move border-2 ${
            draggedNode?.id === node.id ? 'border-blue-500 bg-blue-50' : 'border-transparent'
          }`}
          style={{ paddingLeft: `${node.level * 24 + 12}px` }}
        >
          {/* Drag Handle */}
          <GripVertical className="w-4 h-4 text-gray-400 flex-shrink-0" />

          {/* Expand/Collapse */}
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="flex-shrink-0 hover:bg-gray-200 rounded p-1"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6" />
          )}

          {/* Asset Info */}
          <div className="flex-1 grid grid-cols-5 gap-4 items-center">
            <div>
              <p className="text-sm text-slate-900 font-medium">{node.name}</p>
              <p className="text-xs text-slate-500">{node.model_number}</p>
            </div>

            <div className="text-sm text-slate-600">{node.serial_number}</div>

            <div>
              <Badge className={statusConfig[node.current_status].color}>
                {statusConfig[node.current_status].label}
              </Badge>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-slate-400" />
                <span className={`text-sm font-medium ${getHealthScoreColor(node.current_health_score)}`}>
                  {node.current_health_score}%
                </span>
              </div>
              {hasChildren && (
                <p className="text-xs text-slate-500 mt-1">
                  Avg: {aggregateHealth}%
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              {hasChildren && (
                <Badge variant="outline" className="text-xs">
                  {node.children.length} {node.children.length === 1 ? 'child' : 'children'}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onViewAsset?.(node.id)}
              >
                View
              </Button>
            </div>
          </div>
        </div>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="text-slate-600 mt-4">Loading asset hierarchy...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl text-slate-900 mb-1">Asset Hierarchy</h2>
        <p className="text-slate-600">
          Interactive tree view of asset relationships. Drag and drop to reorganize.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">How to use:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Click the arrow icons to expand/collapse asset children</li>
              <li>Drag and drop assets to reorganize the hierarchy</li>
              <li>Health scores show individual and aggregate values for parent assets</li>
              <li>Changes are saved automatically to the backend</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Drop Zone for Root Level */}
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, null)}
        className="min-h-[100px] border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50"
      >
        <p className="text-sm text-slate-500 text-center mb-4">
          Drop here to move asset to root level
        </p>
      </div>

      {/* Tree View */}
      <Card className="p-4">
        <div className="mb-4">
          <div className="grid grid-cols-5 gap-4 px-3 pb-3 border-b">
            <div className="text-sm text-slate-600 font-medium">Asset Name</div>
            <div className="text-sm text-slate-600 font-medium">Serial Number</div>
            <div className="text-sm text-slate-600 font-medium">Status</div>
            <div className="text-sm text-slate-600 font-medium">Health Score</div>
            <div className="text-sm text-slate-600 font-medium text-right">Info</div>
          </div>
        </div>

        {treeData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No assets found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {treeData.map(node => renderTreeNode(node))}
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Total Assets</p>
          <p className="text-3xl text-slate-900">{assets.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Root Assets</p>
          <p className="text-3xl text-slate-900">{treeData.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Average Health</p>
          <p className={`text-3xl ${getHealthScoreColor(
            Math.round(assets.reduce((sum, a) => sum + a.current_health_score, 0) / assets.length)
          )}`}>
            {Math.round(assets.reduce((sum, a) => sum + a.current_health_score, 0) / assets.length)}%
          </p>
        </Card>
      </div>
    </div>
  );
}
