import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow dev HMR from mobile/device on local network (hotspot IP ranges)
  allowedDevOrigins: [
    "172.20.10.4",
    "172.20.10.0/24",
    "192.168.0.0/16",
    "10.0.0.0/8",
  ],
};

export default nextConfig;
