"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, ShoppingBag, Ruler, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV_ITEMS = [
  { href: "/profile",      label: "Profile",       icon: User        },
  { href: "/orders",       label: "My Orders",     icon: ShoppingBag },
  { href: "/measurements", label: "Measurements",  icon: Ruler       },
];

function initials(fullName: string, email: string): string {
  if (fullName) return fullName.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return email.slice(0, 2).toUpperCase();
}

export default function AccountSidebar() {
  const { user }   = useAuth();
  const pathname   = usePathname();
  const isTailor   = user?.role === "TAILOR" || user?.role === "ADMIN";

  const items = isTailor
    ? [...NAV_ITEMS, { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard }]
    : NAV_ITEMS;

  return (
    <aside className="w-full lg:w-56 flex-shrink-0">
      {/* User identity card */}
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
