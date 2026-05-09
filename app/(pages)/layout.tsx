"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Database,
  Activity,
  Package,
  Settings,
  Menu,
  X,
  User,
  LogOut,
  Bell,
  Link as LinkIcon,
  Wrench,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";

type UserInfo = {
  name: string;
  role: string;
  email: string;
};

type MenuItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  roles?: string[];
};

const menuItems: MenuItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/dashboard",
  },
  {
    id: "equipment",
    label: "Asset Management",
    icon: Database,
    href: "/asset-management",
  },
  {
    id: "work-orders",
    label: "Work Orders",
    icon: Wrench,
    href: "/work-orders",
  },
  {
    id: "maintenance-requests",
    label: "Maintenance Requests",
    icon: FileText,
    href: "/maintenance-requests",
  },
  {
    id: "spareparts",
    label: "Spare Parts",
    icon: Package,
    href: "/spare-parts",
  },
  {
    id: "parts-mapping",
    label: "Parts Mapping",
    icon: LinkIcon,
    href: "/parts-mapping",
    roles: ["Administrator"],
  },
  {
    id: "settings",
    label: "System Settings",
    icon: Settings,
    href: "/system-settings",
    roles: ["Administrator"],
  },
];

export default function PagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserInfo | null>(null);
  const [currentTime, setCurrentTime] = useState<string>("");
  const [currentDate, setCurrentDate] = useState<string>("");

  // Load user from auth context
  const { user, loading: authLoading, logout } = useAuth();

  React.useEffect(() => {
    setCurrentUser(user);
  }, [user]);

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Update time on client side only to avoid hydration mismatch
  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString());
      setCurrentTime(now.toLocaleTimeString());
    };

    updateTime(); // Initial update
    const interval = setInterval(updateTime, 1000); // Update every second

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  // filter items by role if user exists
  const filteredMenu = currentUser
    ? menuItems.filter((i) => !i.roles || i.roles.includes(currentUser.role))
    : menuItems;

  return (
    <div className="flex h-screen bg-gray-50">
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } bg-slate-900 text-white transition-all duration-300 overflow-hidden flex flex-col`}
      >
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl text-white">AI-CMS</h1>
          <p className="text-sm text-slate-400 mt-1">Maintenance Operations</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  active
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
                {item.id === "alerts" && (
                  <Badge className="ml-auto bg-red-600 text-white">2</Badge>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <button
            onClick={() => router.push("/user-profile")}
            className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-sm">
                {currentUser && currentUser.name
                  ? currentUser.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                  : "U"}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm text-white">
                {currentUser?.name || "Guest"}
              </p>
              <p className="text-xs text-slate-400">
                {currentUser?.role || "-"}
              </p>
            </div>
            <User className="w-4 h-4 text-slate-400" />
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 mt-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                {sidebarOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </Button>
              <div>
                <h2 className="text-slate-900">
                  {filteredMenu.find((i) => pathname === i.href)?.label ??
                    "Dashboard"}
                </h2>
                <p className="text-sm text-slate-500">
                  Manage and monitor equipment maintenance operations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/alerts")}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-600 rounded-full" />
              </button>
              <div className="text-right">
                <p className="text-sm text-slate-600">
                  {currentDate || "Loading..."}
                </p>
                <p className="text-xs text-slate-500">
                  {currentTime || "Loading..."}
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
