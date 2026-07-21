"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { fetchApi } from "@/lib/api";
import { useToast } from "@/components/notifications/ToastProvider";
import { Zap, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("Admin@123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { addToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      addToast("Welcome back! Signed in successfully.", "success");
      login(username);
    } catch (err: any) {
      addToast(
        err.message || "Invalid credentials. Please try again.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--topnav-height))] bg-slate-50 dark:bg-[#0D1117] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FF9900]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#FF9900]/3 rounded-full blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px), repeating-linear-gradient(90deg, #fff 0px, #fff 1px, transparent 1px, transparent 40px)",
          }}
        />
      </div>

      <div className="relative w-full max-w-md mx-4 animate-scale-in">
        {/* Card */}
        <div className="bg-white dark:bg-[#161B22] border border-slate-200 dark:border-[#21262D] rounded-2xl shadow-2xl overflow-hidden">
          {/* Header band */}
          <div className="bg-gradient-to-r from-[#FF9900]/20 to-[#FFB347]/10 border-b border-[#FF9900]/20 px-8 py-6 text-center">
            <Image
              src="/logo.webp"
              alt="Logo"
              width={64}
              height={64}
              className="mx-auto mb-4 object-contain"
              priority
            />
            <h1 className="text-xl font-bold text-slate-900 dark:text-[#E6EDF3]">
              AWS Route 53 Console
            </h1>
            <p className="text-sm text-slate-500 dark:text-[#8B949E] mt-1">
              Sign in to manage your DNS infrastructure
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-5">
            {/* Demo hint */}
            <div className="flex items-center gap-2.5 px-3.5 py-3 rounded-lg bg-[#FF9900]/10 border border-[#FF9900]/30 text-xs text-[#E68900] dark:text-[#FFB347]">
              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
              <span>Demo credentials are pre-filled — just click Sign in</span>
            </div>

            {/* Username */}
            <div>
              <label className="input-label">Username</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#484F58]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-9"
                  placeholder="Enter username"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="input-label">Password</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#484F58]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-9 pr-10"
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#484F58] hover:text-slate-600 dark:hover:text-[#8B949E] transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="sign-in-btn"
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-base mt-2"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#0D1117]/30 border-t-[#0D1117] rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-500 dark:text-[#484F58] mt-5">
          AWS Route 53 Demo
        </p>
      </div>
    </div>
  );
}
