"use client";
import { MaintenancePlans } from "@/components/MaintenancePlans";
import { useAuth } from "@/hooks/useAuth";

export default function MaintenancePlanningPage() {
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
        <p className="text-slate-600">Please log in to access maintenance planning.</p>
      </div>
    );
  }

  return <MaintenancePlans user={user as any} />;
}
