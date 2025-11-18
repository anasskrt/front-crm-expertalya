// app/login/page.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/components/crm/user/LoginForm";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/";

  return (
    <main className="relative min-h-dvh flex items-center justify-center px-6
                      bg-gradient-to-br from-blue-50 via-indigo-50 to-indigo-100">
      <div className="w-full max-w-md">
        <LoginForm onLoginSuccess={() => router.replace(next)} />
      </div>

      {/* Décor optionnel (halo flou) */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-16 h-72 w-72 rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-blue-200/50 blur-3xl" />
      </div>
    </main>
  );
}
