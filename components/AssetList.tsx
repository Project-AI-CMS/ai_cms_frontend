"use client";
import { useState, useEffect } from "react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./ui/alert-dialog";
import {
  Search,
  Filter,
  Eye,
  Edit,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { Asset, UserInfo } from "@/types";
import { assetApi } from "@/lib/api";

type AssetListProps = {
  user: UserInfo;
  onViewAsset?: (assetId: string) => void;
  onEditAsset?: (assetId: string) => void;
};

export function AssetList({ user, onViewAsset, onEditAsset }: AssetListProps) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchAssets = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await assetApi.getAll({
        page: currentPage,
        limit,
        search: searchTerm,
        userRole: user.role,
      });

      // Normalize response: assetApi.getAll may return an array or an object { data, pagination }
      if (Array.isArray(response)) {
        setAssets(response);
        setTotal(response.length);
        setTotalPages(1);
      } else {
        setAssets(response.data || []);
        const pagination = response.pagination || {};
        setTotal(
          pagination.total ?? (response.data ? response.data.length : 0)
        );
        setTotalPages(pagination.totalPages ?? 1);
      }
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || "Failed to fetch assets";
      console.error("Failed to fetch assets:", err);
      setError(message);
      setAssets([]);
      setTotal(0);
      setTotalPages(1);
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

  // Add fetchAssets to useEffect dependencies
  useEffect(() => {
    fetchAssets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, user.role]);

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
              placeholder="Search by name or serial number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyPress}
              className="pl-10"
            />
          </div>
          <Button onClick={handleSearch}>
            <Filter className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </div>
      </Card>

      {/* Error Alert - Show prominently at top */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Asset Table */}
      <Card className="p-6">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-slate-600 mt-4">Loading assets...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-slate-900 font-medium mb-2">Unable to Load Assets</p>
            <p className="text-slate-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchAssets} variant="outline">
              Try Again
            </Button>
          </div>
        ) : assets && assets.length === 0 ? (
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
                      Serial Number
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">
                      Health
                    </th>
                    <th className="text-left py-3 px-4 text-sm text-slate-600">
                      Installation Date
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
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {asset.serialNumber}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {asset.currentStatus && (
                          <Badge 
                            variant={
                              asset.currentStatus === "HEALTHY" ? "default" :
                              asset.currentStatus === "WARNING" ? "secondary" : 
                              asset.currentStatus === "CRITICAL" ? "destructive" : "outline"
                            }
                            className={asset.currentStatus === "HEALTHY" ? "bg-green-600 hover:bg-green-700" : ""}
                          >
                            {asset.currentStatus}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {asset.currentHealthScore !== undefined ? (
                          <span className={`font-medium ${
                            asset.currentHealthScore >= 80 ? 'text-green-600' :
                            asset.currentHealthScore >= 50 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {asset.currentHealthScore}%
                          </span>
                        ) : "-"}
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-900">
                        {asset.installationDate || "-"}
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
                          {(user.role === "Administrator" ||
                            user.role === "Maintenance Manager") && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setAssetToDelete(asset);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Success Alert */}
      {success && (
        <Alert className="bg-green-50 text-green-900 border-green-200 mt-4">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Asset</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected asset. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setAssetToDelete(null);
                setDeleteDialogOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (!assetToDelete) return;
                setSubmitting(true);
                setError("");
                try {
                  await assetApi.delete(assetToDelete.id);
                  setSuccess("Asset deleted successfully");
                  setDeleteDialogOpen(false);
                  setAssetToDelete(null);
                  fetchAssets();
                  setTimeout(() => setSuccess(""), 3000);
                } catch (err: unknown) {
                  const message =
                    (err as { message?: string })?.message ||
                    "Failed to delete asset";
                  setError(message);
                } finally {
                  setSubmitting(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
              disabled={submitting}
            >
              {submitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
