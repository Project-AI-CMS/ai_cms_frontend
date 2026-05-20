"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function useRequireAdmin() {
  const router = useRouter();
  const { user, loading } = useAuth();

  const isAdmin = user?.roles?.some((role) => role.name === "ADMIN");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push("/dashboard");
    }
  }, [user, loading, router, isAdmin]);

  return {
    isAuthorized: isAdmin || false,
    loading,
    user,
  };
}
