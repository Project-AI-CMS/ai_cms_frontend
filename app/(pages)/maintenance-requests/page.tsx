"use client";
import { MaintenanceRequestManagement } from "@/components/MaintenanceRequestManagement";
import { UserInfo } from "@/types";
import { useEffect, useState } from "react";

export default function MaintenanceRequestsPage() {
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ai_cms_user");
      if (raw) {
        setCurrentUser(JSON.parse(raw));
      }
    } catch {
      // Ignore errors
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Please log in to access maintenance requests.</p>
      </div>
    );
  }

  return <MaintenanceRequestManagement user={currentUser} />;
}