"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Checkbox } from "./ui/checkbox";
import { AlertCircle, Lock, Mail, Shield, Loader2 } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type LoginProps = {
  onLogin?: (user: { name: string; role: string; email: string }) => void;
};

export function Login({ onLogin }: LoginProps) {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isLockedOut, setIsLockedOut] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLockedOut(false);

    if (!emailOrUsername || !password) {
      setError("Please enter email/username and password");
      return;
    }

    try {
      await login(emailOrUsername, password);
      toast.success("Login successful!");
      // Redirect to dashboard after successful login
      setTimeout(() => {
        router.push("/dashboard");
      }, 500);
    } catch (err: any) {
      const statusCode = err?.statusCode;
      const message = err?.message || "Login failed. Please try again.";

      if (statusCode === 423) {
        setIsLockedOut(true);
        setError(message);
        toast.error(message);
      } else if (statusCode === 401) {
        setError(message);
        toast.error(message);
      } else {
        setError(message);
        toast.error(message);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="text-white space-y-6 hidden lg:block">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl text-white">AI CMS</h1>
              <p className="text-blue-200">
                AI-Driven Computerised Maintenance System
              </p>
            </div>
          </div>

          <ImageWithFallback
            src="/logo.png"
            alt="Power Plant"
            className="w-full h-64 object-cover rounded-lg shadow-2xl"
          />

          <div className="space-y-4">
            <h2 className="text-2xl text-white">Maintenance Operations</h2>
            <p className="text-blue-200 leading-relaxed">
              Comprehensive asset management, predictive maintenance, and
              real-time monitoring for industrial equipment. Optimize your
              operations with AI-powered insights.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-blue-100">
                  Real-time Monitoring
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-blue-100">
                  Predictive Analytics
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-blue-100">
                  Asset Health Tracking
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-blue-100">Automated Alerts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <Card className="p-8 shadow-2xl">
          <div className="mb-6">
            <h2 className="text-2xl text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-600">Sign in to access your dashboard</p>
          </div>

          {error && (
            <Alert
              variant={isLockedOut ? "destructive" : "destructive"}
              className="mb-4"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="emailOrUsername">Email or Username</Label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="emailOrUsername"
                  type="text"
                  placeholder="Enter your email or username"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  className="pl-10"
                  disabled={loading || isLockedOut}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading || isLockedOut}
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) =>
                    setRememberMe(checked as boolean)
                  }
                  disabled={isLockedOut}
                />
                <label
                  htmlFor="remember"
                  className="text-sm text-slate-600 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || isLockedOut}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Need help?
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:underline ml-1"
              >
                Contact Administrator
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
