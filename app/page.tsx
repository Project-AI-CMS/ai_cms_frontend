"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Login } from "@/components/Login";

type UserInfo = {
  name: string;
  role: string;
  email: string;
};

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("ai_cms_user");
      if (raw) {
        router.push("/dashboard");
      }
    } catch {
      // ignore
    }
  }, [router]);

  const handleLogin = (user: UserInfo) => {
    try {
      localStorage.setItem("ai_cms_user", JSON.stringify(user));
    } catch {}
    router.push("/dashboard");
  };

  return <Login onLogin={handleLogin} />;
}
