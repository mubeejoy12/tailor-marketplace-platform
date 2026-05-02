"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Scissors, Menu, X, ChevronDown,
  LayoutDashboard, ShoppingBag, Ruler,
  LogOut, User, ChevronRight,
} from "lucide-react";
import Button from "./ui/Button";
import { useAuth } from "@/context/AuthContext";

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ fullName, email }: { fullName: string; email: string }) {
  const initials = fullName
    ? fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : email.slice(0, 2).toUpperCase();

  return (
    <div className="w-8 h-8 rounded-full bg-[#0F766E] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
      {initials}
    </div>
  );
}

// ─── Dropdown menu item ────────────────────────────────────────────────────────

function DropdownItem({
  href,
  icon: Icon,
  label,
  sublabel,
  danger,
  onClick,
}: {
  href?: string;
  icon: React.ElementType;
  label: string;
  sublabel?: string;
  danger?: boolean;
  onClick?: () => void;
}) {
  const base = `flex items-center gap-3 w-full px-4 py-2.5 text-sm rounded-xl transition-colors ${
    danger
      ? "text-red-600 hover:bg-red-50"
      : "text-[#374151] hover:bg-[#F9FAFB]"
  }`;

  const inner = (
    <>
      <Icon className={`w-4 h-4 flex-shrink-0 ${danger ? "text-red-500" : "text-[#6B7280]"}`} />
      <span className="flex-1 text-left">
        <span className="block font-medium">{label}</span>
        {sublabel && <span className="block text-xs text-[#9CA3AF] font-normal">{sublabel}</span>}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={base} onClick={onClick}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={base} onClick={onClick}>
      {inner}
    </button>
  );
}

// ─── User dropdown ─────────────────────────────────────────────────────────────

function UserDropdown() {
  const { user, logout } = useAuth();
  const router           = useRouter();
  const [open, setOpen]  = useState(false);
  const ref              = useRef<HTMLDivElement>(null);

  const isTailor = user?.role === "TAILOR" || user?.role === "ADMIN";

  // Close on click outside
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleLogout = useCallback(() => {
    setOpen(false);
    logout();
    router.push("/login");
  }, [logout, router]);

  const close = () => setOpen(false);

  return (
    <div className="relative" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-xl px-2 py-1.5 hover:bg-[#F3F4F6] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F766E]"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar fullName={user?.fullName ?? ""} email={user?.email ?? ""} />
        <span className="hidden sm:flex flex-col items-start">
          <span className="text-xs font-semibold text-[#111111] leading-tight max-w-[120px] truncate">
            {user?.fullName || user?.email?.split("@")[0]}
          </span>
          <span className="text-[10px] text-[#9CA3AF] leading-tight capitalize">
            {user?.role?.toLowerCase() ?? "customer"}
          </span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#9CA3AF] transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute right-0 top-[calc(100%+8px)] w-64 bg-white rounded-2xl border border-[#E5E7EB] shadow-xl shadow-black/5 z-50 overflow-hidden
          transition-all duration-200 origin-top-right
          ${open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"}`}
        role="menu"
      >
        {/* User identity header */}
        <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center gap-3">
          <Avatar fullName={user?.fullName ?? ""} email={user?.email ?? ""} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#111111] truncate">
              {user?.fullName || "Welcome back"}
            </p>
            <p className="text-xs text-[#9CA3AF] truncate">{user?.email}</p>
          </div>
        </div>

        {/* Menu items */}
        <div className="p-2 space-y-0.5">
          {isTailor && (
            <DropdownItem
              href="/dashboard"
              icon={LayoutDashboard}
              label="Tailor Dashboard"
              sublabel="Manage orders & status"
              onClick={close}
            />
          )}
          <DropdownItem
            href="/profile"
            icon={ShoppingBag}
            label="My Orders"
            sublabel="Track your custom outfits"
            onClick={close}
          />
          <DropdownItem
            href="/measurements"
            icon={Ruler}
            label="Measurements"
            sublabel="Saved body measurements"
            onClick={close}
          />
          <DropdownItem
            href="/profile"
            icon={User}
            label="Account"
            onClick={close}
          />
        </div>

        {/* Logout */}
        <div className="p-2 border-t border-[#F3F4F6]">
          <DropdownItem
            icon={LogOut}
            label="Sign Out"
            danger
            onClick={handleLogout}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Mobile menu ──────────────────────────────────────────────────────────────

function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, isLoggedIn, logout } = useAuth();
  const router                        = useRouter();
  const isTailor = user?.role === "TAILOR" || user?.role === "ADMIN";

  const handleLogout = () => {
    onClose();
    logout();
    router.push("/login");
  };

  return (
    <div
      className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
        open ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="bg-white border-t border-[#E5E7EB] px-4 py-4 space-y-1">
        {/* Nav links */}
        {[
          { href: "/tailors",      label: "Browse Tailors" },
          { href: "/measurements", label: "Measurements"   },
        ].map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            onClick={onClose}
            className="flex items-center justify-between py-2.5 px-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
          >
            {label} <ChevronRight className="w-4 h-4 text-[#D1D5DB]" />
          </Link>
        ))}

        <div className="h-px bg-[#F3F4F6] my-2" />

        {isLoggedIn && user ? (
          <>
            {/* User identity row */}
            <div className="flex items-center gap-3 px-3 py-2 mb-1">
              <Avatar fullName={user.fullName} email={user.email} />
              <div>
                <p className="text-sm font-semibold text-[#111111]">
                  {user.fullName || user.email.split("@")[0]}
                </p>
                <p className="text-xs text-[#9CA3AF] capitalize">{user.role.toLowerCase()}</p>
              </div>
            </div>

            {isTailor && (
              <Link
                href="/dashboard"
                onClick={onClose}
                className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-[#6B7280]" /> Tailor Dashboard
              </Link>
            )}
            <Link
              href="/profile"
              onClick={onClose}
              className="flex items-center gap-3 py-2.5 px-3 rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-colors"
            >
              <ShoppingBag className="w-4 h-4 text-[#6B7280]" /> My Orders
            </Link>

            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full py-2.5 px-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2 pt-1">
            <Link href="/login" onClick={onClose}>
              <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
            </Link>
            <Link href="/register" onClick={onClose}>
              <Button variant="primary" size="sm" className="w-full">Get Started</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { isLoggedIn }   = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 bg-[#0F766E] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
              TailorHub
            </span>
          </Link>

          {/* Desktop centre nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/tailors"
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#111111] hover:bg-[#F9FAFB] transition-colors"
            >
              Browse Tailors
            </Link>
            <Link
              href="/measurements"
              className="px-3 py-2 rounded-lg text-sm font-medium text-[#6B7280] hover:text-[#111111] hover:bg-[#F9FAFB] transition-colors"
            >
              Measurements
            </Link>
          </nav>

          {/* Desktop right — auth-aware */}
          <div className="hidden md:flex items-center gap-3">
            {isLoggedIn ? (
              <UserDropdown />
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu (animated) */}
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}
