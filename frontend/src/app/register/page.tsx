"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Scissors,
  ArrowRight,
} from "lucide-react";
import { registerUser } from "@/services/authService";
import type { Role } from "@/services/authService";

interface FormState {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: Role;
}

interface FormErrors {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER",
  });

  const [errors, setErrors]         = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [success, setSuccess]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const [showConfirm, setShowConfirm]     = useState(false);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear field-level error when user starts typing
    if (key in errors) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }

  function validate(): boolean {
    const next: FormErrors = {};

    if (!form.fullName.trim())
      next.fullName = "Full name is required.";
    else if (form.fullName.trim().length < 2)
      next.fullName = "Name must be at least 2 characters.";

    if (!form.email.trim())
      next.email = "Email is required.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      next.email = "Enter a valid email address.";

    if (form.phone && !/^\+?[\d\s\-()]{7,15}$/.test(form.phone))
      next.phone = "Enter a valid phone number.";

    if (!form.password)
      next.password = "Password is required.";
    else if (form.password.length < 6)
      next.password = "Password must be at least 6 characters.";

    if (!form.confirmPassword)
      next.confirmPassword = "Please confirm your password.";
    else if (form.password !== form.confirmPassword)
      next.confirmPassword = "Passwords do not match.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError("");

    if (!validate()) return;

    setLoading(true);

    try {
      await registerUser({
        fullName: form.fullName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        phone: form.phone.trim() || undefined,
        role: form.role,
      });

      setLoading(false);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (err) {
      console.error("[Register] error:", err);
      setLoading(false);
      setServerError(
        err instanceof Error
          ? err.message
          : "Registration failed. Please try again."
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
            Craft your perfect wardrobe with master tailors.
          </h2>
          <p className="text-white/75 text-lg leading-relaxed mb-10">
            Join thousands of customers who get bespoke traditional clothing made exactly to their measurements.
          </p>
          <div className="space-y-4">
            {[
              "Browse hundreds of verified tailors",
              "Submit precise body measurements",
              "Track your order from cut to delivery",
            ].map((item) => (
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
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-[#FAFAF8] overflow-y-auto">
        <div className="w-full max-w-md py-8">

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
              Create your account
            </h1>
            <p className="text-[#6b7280] text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#0f766e] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>

          {/* ── Success banner ── */}
          {success && (
            <div className="mb-6 flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-emerald-800">Account created successfully!</p>
                <p className="text-xs text-emerald-600">Redirecting you to login in a moment…</p>
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

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Full Name <span className="text-[#0f766e]">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="text"
                  placeholder="e.g. Amara Osei"
                  value={form.fullName}
                  onChange={(e) => setField("fullName", e.target.value)}
                  disabled={loading || success}
                  className={inputCls(!!errors.fullName)}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
              {errors.fullName && <p className="text-xs text-red-500">{errors.fullName}</p>}
            </div>

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
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  disabled={loading || success}
                  className={inputCls(!!errors.email)}
                  style={{ paddingLeft: "2.5rem" }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>

            {/* Phone (optional) */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Phone Number{" "}
                <span className="text-[#9CA3AF] font-normal text-xs">(optional)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type="tel"
                  placeholder="+234 800 000 0000"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  disabled={loading || success}
                  className={inputCls(!!errors.phone)}
                  style={{ paddingLeft: "2.5rem" }}
                />
              </div>
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
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
                  placeholder="Minimum 6 characters"
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                  disabled={loading || success}
                  className={inputCls(!!errors.password)}
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                  autoComplete="new-password"
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
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-[#111111]">
                Confirm Password <span className="text-[#0f766e]">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={(e) => setField("confirmPassword", e.target.value)}
                  disabled={loading || success}
                  className={inputCls(!!errors.confirmPassword)}
                  style={{ paddingLeft: "2.5rem", paddingRight: "2.75rem" }}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  tabIndex={-1}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#6b7280] transition-colors"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-xs text-red-500">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Role selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#111111]">
                I am joining as <span className="text-[#0f766e]">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(["CUSTOMER", "TAILOR"] as Role[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setField("role", r)}
                    disabled={loading || success}
                    className={[
                      "py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                      form.role === r
                        ? "border-[#0f766e] bg-[#ccfbf1] text-[#0f766e]"
                        : "border-[#E5E7EB] bg-white text-[#6b7280] hover:border-[#0f766e]/40",
                    ].join(" ")}
                  >
                    {r === "CUSTOMER" ? "Customer" : "Tailor / Artisan"}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 bg-[#0f766e] hover:bg-[#0d6b63] text-white rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm mt-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" />Creating account…</>
              ) : success ? (
                <><CheckCircle className="w-4 h-4" />Account created!</>
              ) : (
                <>Create account<ArrowRight className="w-4 h-4" /></>
              )}
            </button>

          </form>

          <p className="mt-8 text-center text-xs text-[#9CA3AF]">
            By creating an account you agree to our{" "}
            <span className="text-[#0f766e] cursor-pointer hover:underline">Terms of Service</span>{" "}
            and{" "}
            <span className="text-[#0f766e] cursor-pointer hover:underline">Privacy Policy</span>.
          </p>

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
