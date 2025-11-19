"use client";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Asset, AssetStatus, UserInfo } from "@/types";
import { assetApi } from "@/lib/api";
import { useRouter } from "next/navigation";

const statusConfig: Record<AssetStatus, { label: string; color: string }> = {
  operational: { label: "Operational", color: "bg-green-100 text-green-700" },
  standby: { label: "Standby", color: "bg-blue-100 text-blue-700" },
  pending_repair: {
    label: "Pending Repair",
    color: "bg-orange-100 text-orange-700",
  },
  under_repair: { label: "Under Repair", color: "bg-red-100 text-red-700" },
  scrapped: { label: "Scrapped", color: "bg-gray-100 text-gray-700" },
};

type AssetListProps = {
  user: UserInfo;
  onViewAsset?: (assetId: string) => void;
  onEditAsset?: (assetId: string) => void;
};

export function AssetList({ user, onViewAsset, onEditAsset }: AssetListProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchAssets();
  }, [currentPage, statusFilter, user.role]);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const response = await assetApi.getAll({
        page: currentPage,
        limit,
        status: statusFilter,
        search: searchTerm,
        userRole: user.role,
      });
      setAssets(response.data);
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchAssets();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl text-slate-900 mb-1">Asset List</h2>
          <p className="text-slate-600">
            {user.role === "Maintenance Worker"
              ? "Viewing your assigned assets"
              : `Manage and monitor all assets (${total} total)`}
          </p>
        </div>
        {(user.role === "Administrator" ||
          user.role === "Maintenance Manager") && (
          <Button onClick={() => onEditAsset?.("new")}>
            <Plus className="w-4 h-4 mr-2" />
            Add Asset
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search by name, model, or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="operational">Operational</SelectItem>
              <SelectItem value="standby">Standby</SelectItem>
              <SelectItem value="pending_repair">Pending Repair</SelectItem>
              <SelectItem value="under_repair">Under Repair</SelectItem>
              <SelectItem value="scrapped">Scrapped</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleSearch}>
            <Filter className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </div>
      </Card>

      {/* Asset Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600 mt-4">Loading assets...</p>
          </div>
        ) : assets?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600">No assets found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm text-slate-600">
                      ID
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">
                      Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">
                      Model Number
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">
                      Serial Number
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">
                      Health Score
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">
                      Status
                    </th>
                    <th className="text-right py-3 px-4 text-sm text-slate-600">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assets?.map((asset) => (
                    <tr key={asset.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {asset.id}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-sm text-slate-900">{asset.name}</p>
                          {asset.manufacturer && (
                            <p className="text-xs text-slate-500">
                              {asset.manufacturer}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {asset.modelNumber}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {asset.serialNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-sm font-medium ${getHealthScoreColor(
                            asset.currentHealthScore
                          )}`}
                        >
                          {asset.currentHealthScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          className={statusConfig[asset.currentStatus].color}
                        >
                          {statusConfig[asset.currentStatus].label}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewAsset?.(asset.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {(user.role === "Administrator" ||
                            user.role === "Maintenance Manager") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEditAsset?.(asset.id)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-6 pt-4 border-t">
              <p className="text-sm text-slate-600">
                Showing {(currentPage - 1) * limit + 1} to{" "}
                {Math.min(currentPage * limit, total)} of {total} assets
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                        className="w-8"
                      >
                        {page}
                      </Button>
                    )
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
