"use client";
import { WorkOrderManagement } from "@/components/WorkOrderManagement";
import { useAuth } from "@/hooks/useAuth";

export default function WorkOrdersPage() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        <p className="text-slate-600 mt-4">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Please log in to access work orders.</p>
      </div>
    );
  }

  return <WorkOrderManagement user={user as any} />;
}