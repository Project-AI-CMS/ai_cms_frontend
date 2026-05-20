"use client";
import { useState, useEffect } from "react";
import { useCallback } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  ChevronDown,
  ChevronRight,
  GripVertical,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { Asset } from "@/types";
import { assetApi } from "@/lib/api";

type TreeNode = Asset & {
  components: TreeNode[];
  level: number;
  currentHealthScore?: number;
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
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchAssets(); // Fetch assets on component mount
  }, []);

  const fetchAssets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await assetApi.getHierarchy();
      const list = Array.isArray(response)
        ? response
        : response && (response.data ?? []);
      // If API returned a nested tree (components/children arrays), preserve it.
      const asArray = list as unknown as Array<Record<string, unknown>>;
      const isNested = asArray.some(
        (a) => Array.isArray(a["components"]) || Array.isArray(a["children"])
      );

      if (isNested) {
        // Map nested response into TreeNode structure and also flatten assets for stats
        const flattened: Asset[] = [];

        const mapNested = (
          node: Record<string, unknown>,
          level = 0
        ): TreeNode => {
          const get = (k1: string, k2?: string) => {
            return (node[k1] ?? (k2 ? node[k2] : undefined)) as unknown;
          };

          const mapped: TreeNode = {
            id: String(get("id")),
            name: String(get("name") ?? ""),
            serialNumber: String(get("serial_number", "serialNumber") ?? ""),
            modelNumber: String(get("model_number", "modelNumber") ?? ""),
            assetTypeId: String(get("asset_type_id", "assetTypeId") ?? ""),
            locationId: String(get("location_id", "locationId") ?? ""),
            parentAssetId: (node["parent_asset_id"] ??
              node["parentAssetId"]) as string | null,
            installationDate: String(
              get("installation_date", "installationDate") ?? ""
            ),
            components: [],
            level,
            currentHealthScore: (node["current_health_score"] ??
              node["currentHealthScore"]) as number | undefined,
          } as TreeNode;

          flattened.push({
            id: mapped.id,
            name: mapped.name,
            serialNumber: mapped.serialNumber,
            modelNumber: mapped.modelNumber,
            assetTypeId: mapped.assetTypeId,
            locationId: mapped.locationId,
            parentAssetId: mapped.parentAssetId ?? null,
            installationDate: mapped.installationDate,
          } as Asset);

          const children = (node["components"] ??
            node["children"] ??
            []) as Array<Record<string, unknown>>;
          mapped.components = children.map((c) => mapNested(c, level + 1));
          return mapped;
        };

        const roots = asArray.map((n) => mapNested(n, 0));
        setTreeData(roots);
        setAssets(flattened);
        setExpandedNodes(new Set(roots.map((n) => n.id)));
      } else {
        // normalize snake_case -> camelCase for assets (flat list)
        const normalized: Asset[] = (
          list as unknown as Array<Record<string, unknown>>
        ).map((a) => ({
          id: String(a["id"] ?? ""),
          name: String(a["name"] ?? ""),
          serialNumber: String(a["serial_number"] ?? a["serialNumber"] ?? ""),
          modelNumber: String(a["model_number"] ?? a["modelNumber"] ?? ""),
          assetTypeId: String(a["asset_type_id"] ?? a["assetTypeId"] ?? ""),
          locationId: String(a["location_id"] ?? a["locationId"] ?? ""),
          parentAssetId: (a["parent_asset_id"] ?? a["parentAssetId"]) as
            | string
            | null,
          installationDate: String(
            a["installation_date"] ?? a["installationDate"] ?? ""
          ),
        }));
        setAssets(normalized);
        buildTree(normalized);
      }
    } catch (err) {
      console.error("Failed to fetch assets:", err);
      setError("Failed to load asset hierarchy");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const buildTree = (assetList: Asset[]) => {
    // Build tree structure
    const assetMap = new Map<string, TreeNode>();
    const rootNodes: TreeNode[] = [];

    // First pass: create all nodes
    assetList.forEach((asset) => {
      // preserve optional fields if present on the response
      const node: TreeNode = {
        ...asset,
        components: [],
        level: 0,
        currentHealthScore: (
          (asset as unknown as Record<string, unknown>)[
            "current_health_score"
          ] ??
          (asset as unknown as Record<string, unknown>)["currentHealthScore"]
        ) as number | undefined,
      };
      assetMap.set(asset.id, node);
    });

    // Second pass: build parent-child relationships
    assetList.forEach((asset) => {
      const node = assetMap.get(asset.id)!;
      if (asset.parentAssetId && assetMap.has(asset.parentAssetId)) {
        const parent = assetMap.get(asset.parentAssetId)!;
        parent.components.push(node);
        node.level = parent.level + 1;
      } else {
        rootNodes.push(node);
      }
    });

    // Sort children by name
    const sortChildren = (node: TreeNode) => {
      node.components.sort((a, b) => a.name.localeCompare(b.name));
      node.components.forEach(sortChildren);
    };
    rootNodes.forEach(sortChildren);

    setTreeData(rootNodes);

    // Expand root nodes by default
    setExpandedNodes(new Set(rootNodes.map((n) => n.id)));
  };

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Health/score removed from schema — no aggregate calculations

  const handleDragStart = (e: React.DragEvent, node: TreeNode) => {
    setDraggedNode(node);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (
    e: React.DragEvent,
    targetNode: TreeNode | null
  ) => {
    e.preventDefault();

    if (!draggedNode) return;

    // Prevent dropping on self or descendants
    if (targetNode && isDescendant(draggedNode, targetNode)) {
      setError("Cannot move an asset to its own descendant");
      setTimeout(() => setError(""), 3000);
      setDraggedNode(null);
      return;
    }

    try {
      const newParentId = targetNode?.id || null;
      await assetApi.updateHierarchy(draggedNode.id, newParentId);
      setSuccess(`Successfully moved ${draggedNode.name}`);
      setTimeout(() => setSuccess(""), 3000);
      fetchAssets(); // Refresh the tree
    } catch (err) {
      // Normalize error to a string before updating state
      const e = err as unknown as Record<string, unknown>;
      const message =
        (e && typeof e["message"] === "string" && (e["message"] as string)) ||
        (typeof err === "string" ? err : "Failed to update hierarchy");
      setError(message);
      setTimeout(() => setError(""), 3000);
    } finally {
      setDraggedNode(null);
    }
  };

  const isDescendant = (ancestor: TreeNode, node: TreeNode): boolean => {
    if (ancestor.id === node.id) return true;
    return ancestor.components.some((child) => isDescendant(child, node));
  };

  const renderTreeNode = (node: TreeNode) => {
    const isExpanded = expandedNodes.has(node.id);
    const hasChildren = node.components.length > 0;

    return (
      <div key={node.id}>
        <div
          draggable
          onDragStart={(e) => handleDragStart(e, node)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, node)}
          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-move border-2 ${
            draggedNode?.id === node.id
              ? "border-blue-500 bg-blue-50"
              : "border-transparent"
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
          <div className="flex-1 grid grid-cols-4 gap-4 items-center">
            <div>
              <p className="text-sm text-slate-900 font-medium">{node.name}</p>
              <p className="text-xs text-slate-500">
                Installed: {node.installationDate}
              </p>
            </div>

            <div className="text-sm text-slate-600">{node.serialNumber}</div>

            <div className="flex items-center">
              {hasChildren && (
                <Badge variant="outline" className="text-xs">
                  {node.components.length}{" "}
                  {node.components.length === 1 ? "component" : "components"}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
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

        {/* Render nested components */}
        {hasChildren && isExpanded && (
          <div>{node.components.map((child) => renderTreeNode(child))}</div>
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
          Interactive tree view of asset relationships. Drag and drop to
          reorganize.
        </p>
      </div>

      {/* Alerts */}
      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200">
          <CheckCircle className="h-4 w-4" />
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
          <div className="grid grid-cols-4 gap-4 px-3 pb-3 border-b">
            <div className="text-sm text-slate-600 font-medium">Asset Name</div>
            <div className="text-sm text-slate-600 font-medium">
              Serial Number
            </div>
            <div className="text-sm text-slate-600 font-medium">Components</div>
            <div className="text-sm text-slate-600 font-medium text-right">
              Info
            </div>
          </div>
        </div>

        {treeData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No assets found</p>
          </div>
        ) : (
          <div className="space-y-1">
            {treeData.map((node) => renderTreeNode(node))}
          </div>
        )}
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Total Assets</p>
          <p className="text-3xl text-slate-900">{assets.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-600 mb-1">Root Assets</p>
          <p className="text-3xl text-slate-900">{treeData.length}</p>
        </Card>
        
      </div>
    </div>
  );
}
