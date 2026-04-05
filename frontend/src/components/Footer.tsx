import Link from "next/link";
import { Scissors, Heart, X, Share2, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#0F766E] rounded-lg flex items-center justify-center">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-lg font-bold"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                TailorHub
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-xs">
              Africa&apos;s premium marketplace connecting customers with the
              finest tailors for custom clothing experiences.
            </p>
            <div className="flex gap-3">
              {[Heart, X, Share2].map((Icon, i) => (
                <button
                  key={i}
                  className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#0F766E] transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>

          {/* For Customers */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              For Customers
            </h4>
            <ul className="space-y-3">
              {[
                "Browse Tailors",
                "How It Works",
                "Measurements Guide",
                "Place an Order",
                "Track Order",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Tailors */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              For Tailors
            </h4>
            <ul className="space-y-3">
              {[
                "Join as Tailor",
                "Tailor Dashboard",
                "Pricing",
                "Success Stories",
                "Support",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="#"
                    className="text-sm text-gray-300 hover:text-white transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-widest text-gray-400 mb-4">
              Contact
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-300">
                <Mail className="w-4 h-4 text-[#0F766E]" />
                <span>hello@tailorhub.com</span>
              </div>
            </div>
            <div className="mt-6 p-4 bg-white/5 rounded-xl">
              <p className="text-xs text-gray-400 mb-2">
                Subscribe for updates
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your@email.com"
                  className="flex-1 bg-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:border-[#0F766E]"
                />
                <button className="bg-[#0F766E] px-3 py-2 rounded-lg text-xs font-medium hover:bg-[#0D6B63] transition-colors">
                  Go
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2026 TailorHub. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {item}
                </Link>
              ),
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
