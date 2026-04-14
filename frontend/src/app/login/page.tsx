"use client";

import { useState, FormEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Scissors,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { loginUser } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { isAuthenticated } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError]     = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [serverError, setServerError]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);

  const redirected = useRef(false);

  // If already logged in, leave once on mount
  useEffect(() => {
    if (isAuthenticated() && !redirected.current) {
      redirected.current = true;
      router.replace("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function validate(): boolean {
    let ok = true;
    setEmailError("");
    setPasswordError("");

    if (!email.trim()) {
      setEmailError("Email is required.");
      ok = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Enter a valid email address.");
      ok = false;
    }
    if (!password) {
      setPasswordError("Password is required.");
      ok = false;
    }
    return ok;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      const token = await loginUser({
        email: email.trim().toLowerCase(),
        password,
      });

      // Persist token + update context
      login(token);

      setLoading(false);
      setSuccess(true);

      // Read ?redirect= from the current URL (runs client-side only)
      const params = new URLSearchParams(window.location.search);
      const redirectTo = params.get("redirect") ?? "/";

      if (!redirected.current) {
        redirected.current = true;
        setTimeout(() => router.replace(redirectTo), 1000);
      }
    } catch (err) {
      console.error("[Login] error:", err);
      setLoading(false);
      setServerError(
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials."
      );
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left decorative panel ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0f766e] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-16 left-16 w-64 h-64 rounded-full border border-white" />
          <div className="absolute top-32 left-32 w-96 h-96 rounded-full border border-white" />
          <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full border border-white" />
          <div className="absolute bottom-8 right-8 w-56 h-56 rounded-full border border-white" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Scissors className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-semibold text-xl tracking-tight" style={{ fontFamily: "Poppins, sans-serif" }}>
            TailorHub
          </span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4" style={{ fontFamily: "Poppins, sans-serif" }}>
            Welcome back to your tailor marketplace.
          </h2>
          <p className="text-white/75 text-lg leading-relaxed mb-10">
            Sign in to manage your orders, measurements, and connect with Africa&apos;s finest tailors.
          </p>
          <div className="space-y-4">
            {["Pick up where you left off", "Track live order status", "Manage saved measurements"].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-3 h-3 text-white" />
                </div>
                <span className="text-white/85 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-white/50 text-xs">
          &copy; {new Date().getFullYear()} TailorHub. All rights reserved.
        </p>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#FAFAF8]">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-[#0f766e] rounded-lg flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="text-[#111111] font-semibold text-lg" style={{ fontFamily: "Poppins, sans-serif" }}>
              TailorHub
            </span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111111] mb-2" style={{ fontFamily: "Poppins, sans-serif" }}>
              Sign in to TailorHub
            </h1>
            <p className="text-[#6b7280] text-sm">
              New here?{" "}
              <Link href="/register" className="text-[#0f766e] font-medium hover:underline">
                Create a free account
              </Link>
            </p>
          </div>

          {/* ── Success banner ── */}
          {success && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Signed in successfully!</p>
                <p className="text-xs text-emerald-600">Redirecting you now…</p>
              </div>
            </div>
          )}

          {/* ── Error banner ── */}
          {serverError && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{serverError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Email */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Email Address <span className="text-[#0f766e]">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setEmailError(""); setServerError(""); }}
                  disabled={loading || success}
                  autoComplete="email"
                  className={inputCls(!!emailError)}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
              {emailError && <p className="text-xs text-red-500">{emailError}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Password <span className="text-[#0f766e]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Your password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setPasswordError(""); setServerError(""); }}
                  disabled={loading || success}
                  autoComplete="current-password"
                  className={inputCls(!!passwordError)}
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6b7280] transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#0f766e] hover:bg-[#0d6b63] text-white rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Signing in…</>
              ) : success ? (
                <><CheckCircle className="w-4 h-4" />Signed in!</>
              ) : (
                <>Sign in<ArrowRight className="w-4 h-4" /></>
              )}
            </button>

          </form>

          <div className="mt-8 pt-6 border-t border-[#E5E7EB] text-center">
            <p className="text-xs text-[#9CA3AF]">
              Having trouble?{" "}
              <span className="text-[#0f766e] cursor-pointer hover:underline">Contact support</span>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-xl border bg-white py-3 text-sm text-[#111111] placeholder-[#9CA3AF]",
    "focus:outline-none focus:ring-2 transition-all duration-200",
    "disabled:bg-[#F9FAFB] disabled:text-[#9CA3AF] disabled:cursor-not-allowed",
    hasError
      ? "border-red-400 focus:border-red-400 focus:ring-red-400/20"
      : "border-[#E5E7EB] focus:border-[#0f766e] focus:ring-[#0f766e]/20",
  ].join(" ");
}
