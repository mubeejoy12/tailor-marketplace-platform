import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TailorHub — Premium Tailor Marketplace",
  description: "Connect with Africa's finest tailors. Get custom clothing crafted to your exact measurements.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-[#FAFAF8] text-[#111111] antialiased">
        {children}
      </body>
    </html>
  );
}
