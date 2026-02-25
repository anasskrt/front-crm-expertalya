/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/crm/Navigation";
import RequireRole from "@/components/RequireRole";
import ActiviteManagement from "@/components/crm/activite/ActiviteManagement";
import { logout } from "@/lib/api/auth";

export default function ActivitePage() {
  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignorer les erreurs de logout
    }
    window.location.href = "/login";
  };

  return (
    <RequireRole allowedRoles={["1", 1] as any}>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Gestion des Activités
              </h1>
              <p className="text-gray-600">
                Gérez les types d&apos;activités disponibles pour les sociétés
              </p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white hover:bg-gray-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>

          <Navigation />

          <div className="mt-6">
            <ActiviteManagement />
          </div>
        </div>
      </div>
    </RequireRole>
  );
}
