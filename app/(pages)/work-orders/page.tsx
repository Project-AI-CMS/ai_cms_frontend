"use client";
import { WorkOrderManagement } from "@/components/WorkOrderManagement";
import { UserInfo } from "@/types";
import { useEffect, useState } from "react";

export default function WorkOrdersPage() {
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
        <p className="text-slate-600">Please log in to access work orders.</p>
      </div>
    );
  }

  return <WorkOrderManagement user={currentUser} />;
}