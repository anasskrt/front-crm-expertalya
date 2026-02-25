"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Building, UserCog, Plus, Home, CheckSquare, FileText, Table2 } from "lucide-react";
import { useUser } from "@/context/UserContext";

const Navigation = () => {
  const pathname = usePathname();
  const { currentUser } = useUser();

  const navItems = [
    { path: "/", label: "Dashboard", icon: Home },
    { path: "/societe", label: "Sociétés", icon: Building },
    { path: "/profil", label: "Profil & Favoris", icon: UserCog },
    { path: "/societe/nouveau", label: "Nouvelle Société", icon: Plus },
    { path: "/taches", label: "Gestions des tâches", icon: CheckSquare },
// Factures et utilisateurs visibles seulement pour MANAGER ou ADMIN
    ...(currentUser && currentUser.role == 1
      ? [
    { path: "/gestion-facture", label: "Gestions des factures", icon: FileText },
    { path: "/utilisateur", label: "Gestions des utilisateurs", icon: Users },
    { path: "/collaborateur", label: "Tâches des collabos", icon: Users },
    { path: "/societe/archiver", label: "Sociétés Archivées", icon: Building },
    { path: "/excel", label: "Tableau exporté", icon: Table2  },
    { path: "/activités", label: "Liste des activités", icon: Table2  },


]
      : []),
  ];

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <nav className="flex flex-wrap gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </CardContent>
    </Card>
  );
};

export default Navigation;
