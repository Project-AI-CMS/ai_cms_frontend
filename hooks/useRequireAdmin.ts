"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function useRequireAdmin() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "Administrator")) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return {
    isAuthorized: user?.role === "Administrator",
    loading,
    user,
  };
}
