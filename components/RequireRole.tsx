"use client";

import { ReactNode, useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface RequireRoleProps {
  allowedRoles: string[];
  children: ReactNode;
  /** URL de redirection si non autorisé (défaut: "/") */
  redirectTo?: string;
}

export default function RequireRole({ 
  allowedRoles, 
  children, 
  redirectTo = "/" 
}: RequireRoleProps) {
  const { currentUser, isLoading } = useUser();
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    // Attendre que le chargement soit terminé
    if (isLoading) return;

    // Pas connecté → redirection silencieuse
    if (!currentUser) {
      setIsRedirecting(true);
      router.replace("/login");
      return;
    }

    // Pas le bon rôle → redirection silencieuse
    if (!allowedRoles.includes(currentUser.role)) {
      setIsRedirecting(true);
      router.replace(redirectTo);
      return;
    }
  }, [currentUser, isLoading, allowedRoles, redirectTo, router]);

  // Afficher un loader pendant le chargement ou la redirection
  if (isLoading || isRedirecting || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      </div>
    );
  }

  // Vérification finale avant d'afficher le contenu
  if (!allowedRoles.includes(currentUser.role)) {
    return null;
  }

  return <>{children}</>;
}
