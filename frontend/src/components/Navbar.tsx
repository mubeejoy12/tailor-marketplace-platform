"use client";

import { useState } from "react";
import Link from "next/link";
import { Scissors, Menu, X, ChevronDown } from "lucide-react";
import Button from "./ui/Button";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#0F766E] rounded-lg flex items-center justify-center transition-transform group-hover:scale-105">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-[#111111]" style={{ fontFamily: "Poppins, sans-serif" }}>
              TailorHub
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/tailors" className="text-sm font-medium text-[#6B7280] hover:text-[#111111] transition-colors">
              Browse Tailors
            </Link>
            <Link href="/measurements" className="text-sm font-medium text-[#6B7280] hover:text-[#111111] transition-colors">
              Measurements
            </Link>
            <Link href="/orders" className="text-sm font-medium text-[#6B7280] hover:text-[#111111] transition-colors">
              Orders
            </Link>
            <div className="flex items-center gap-1 text-sm font-medium text-[#6B7280] hover:text-[#111111] transition-colors cursor-pointer">
              More <ChevronDown className="w-3.5 h-3.5" />
            </div>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm">Get Started</Button>
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 rounded-lg text-[#6B7280] hover:bg-[#F3F4F6] transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 py-4 space-y-3">
          <Link href="/tailors" className="block text-sm font-medium text-[#6B7280] hover:text-[#111111] py-2">
            Browse Tailors
          </Link>
          <Link href="/measurements" className="block text-sm font-medium text-[#6B7280] hover:text-[#111111] py-2">
            Measurements
          </Link>
          <Link href="/orders" className="block text-sm font-medium text-[#6B7280] hover:text-[#111111] py-2">
            Orders
          </Link>
          <div className="flex flex-col gap-2 pt-2">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="w-full">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" size="sm" className="w-full">Get Started</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
