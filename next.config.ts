import path from "path";
import type { NextConfig } from "next";
import type { Configuration as WebpackConfig } from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    domains: ["images.unsplash.com"],
  },
  webpack: (config: WebpackConfig) => {
    config.resolve = config.resolve || {};
    config.resolve.alias = config.resolve.alias || {};
    // 👇👇 Cast ici !
    (config.resolve.alias as { [key: string]: string })['@'] = path.resolve(process.cwd());
    return config;
  },

  // Headers de sécurité HTTP
  async headers() {
    return [
      {
        // Appliquer à toutes les routes
        source: "/:path*",
        headers: [
          {
            // Empêche le navigateur de "deviner" le type MIME
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Empêche l'intégration dans une iframe (protection clickjacking)
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            // Active le filtre XSS du navigateur (legacy mais utile)
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            // Contrôle les informations envoyées dans le header Referer
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            // Restreint l'accès aux APIs sensibles (caméra, micro, etc.)
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            // Force HTTPS (à activer en production uniquement)
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
          {
            // Content Security Policy - Protège contre XSS et injection
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js nécessite unsafe-inline/eval en dev
              "style-src 'self' 'unsafe-inline'", // Tailwind/CSS-in-JS nécessite unsafe-inline
              "img-src 'self' data: https://images.unsplash.com",
              "font-src 'self' data:",
              "connect-src 'self' " + (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"),
              "frame-ancestors 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
