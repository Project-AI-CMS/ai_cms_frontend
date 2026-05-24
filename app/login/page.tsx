"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Login } from "@/components/Login";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  return <Login />;
}
