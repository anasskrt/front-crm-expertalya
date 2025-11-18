// app/layout.tsx
"use client";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/context/UserContext";

export default function RootLayout( { children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <UserProvider>
          {children}
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
