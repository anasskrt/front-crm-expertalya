import { ReactNode } from "react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";

export default function RequireRole({ allowedRoles, children }: { allowedRoles: string[]; children: ReactNode }) {
  const { currentUser } = useUser();
  const router = useRouter();

  if (!currentUser) {
    // Pas connecté, on peut aussi router vers /login si besoin
    if (typeof window !== "undefined") router.replace("/");
    return <div className="text-center text-red-500 py-8">Accès refusé. Veuillez vous connecter.</div>;
  }

  if (!allowedRoles.includes(currentUser.role)) {
    if (typeof window !== "undefined") router.replace("/");
    return <div className="text-center text-red-500 py-8">Accès refusé. Vous n&apos;avez pas les droits nécessaires.</div>;
  }

  return <>{children}</>;
}
