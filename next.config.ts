import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http://localhost:4000 http://localhost:8080 https://i.pravatar.cc https://images.unsplash.com",
      "font-src 'self' data:",
      "connect-src 'self' https: wss: http://localhost:4000 ws://localhost:4000 http://localhost:8080 ws://localhost:8080",
      "worker-src 'self' blob:",
      "manifest-src 'self'"
    ].join("; ")
  }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  env: {
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || "d74c959aa3b21d3e248e4d25708670dc000e491b846f78a34d6d33415a284fce",
  },
  images: {
    remotePatterns: []
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "no-store" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" }
        ]
      }
    ];
  },
  async rewrites() {
    const backendTarget =
      process.env.BACKEND_API_URL ||
      (process.env.NODE_ENV === "development"
        ? (process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") || "http://127.0.0.1:4000")
        : (process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/v1\/?$/, "") || "https://matrimony-backend-taupe.vercel.app"));

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendTarget}/api/v1/:path*`
      }
    ];
  }
};

export default nextConfig;