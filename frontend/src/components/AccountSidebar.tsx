"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Ruler, LayoutDashboard, MessageSquare, ShieldCheck, Shield } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const BASE_NAV = [
  { href: "/profile",      label: "Profile",       icon: User,        roles: ["CUSTOMER", "TAILOR", "ADMIN"] },
  { href: "/orders",       label: "My Orders",     icon: ShoppingBag, roles: ["CUSTOMER", "TAILOR", "ADMIN"] },
  { href: "/measurements", label: "Measurements",  icon: Ruler,       roles: ["CUSTOMER", "TAILOR", "ADMIN"] },
  { href: "/messages",     label: "Messages",      icon: MessageSquare, roles: ["CUSTOMER", "TAILOR", "ADMIN"] },
  { href: "/dashboard",    label: "Dashboard",     icon: LayoutDashboard, roles: ["TAILOR", "ADMIN"] },
  { href: "/verification", label: "Verification",  icon: ShieldCheck, roles: ["TAILOR"] },
  { href: "/admin",        label: "Admin Panel",   icon: Shield,      roles: ["ADMIN"] },
];

function initials(fullName: string, email: string): string {
  if (fullName) return fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export default function AccountSidebar() {
  const { user } = useAuth();
  const pathname  = usePathname();
  const role      = user?.role ?? "CUSTOMER";

  const items = BASE_NAV.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      {/* Identity card */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0F766E] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          {user ? initials(user.fullName, user.email) : "?"}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#111111] truncate">
            {user?.fullName || user?.email?.split("@")[0] || "Account"}
          </p>
          <p className="text-xs text-[#9CA3AF] capitalize truncate">
            {user?.role?.toLowerCase() ?? "customer"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden">
        {items.map(({ href, label, icon: Icon }, i) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href) && href.length > 1);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors ${
                i < items.length - 1 ? "border-b border-[#F3F4F6]" : ""
              } ${
                active
                  ? "bg-[#0F766E]/5 text-[#0F766E]"
                  : "text-[#374151] hover:bg-[#F9FAFB] hover:text-[#111111]"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#0F766E]" : "text-[#9CA3AF]"}`} />
              {label}
              {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#0F766E]" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
