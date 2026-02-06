"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Navigation from "@/components/crm/Navigation";
import SocieteManagement from "@/components/crm/societe/SocieteManagement";
import { useUser } from "@/context/UserContext";
import { getProfil } from "@/app/api/profil";
import { logout } from "@/app/api/auth";

export default function SocietesPage() {
  const { currentUser, setCurrentUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      getProfil()
        .then(setCurrentUser)
        .catch(() => {
          setCurrentUser(null);
          router.push("/");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser, router, setCurrentUser]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignorer les erreurs de logout
    }
    window.location.href = "/login";
  };

  if (loading) return null; // ou un loader

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Gestion des Sociétés
            </h1>
            <p className="text-gray-600">
              Gérez toutes vos sociétés en un seul endroit
            </p>
          </div>
          <Button
            onClick={() => handleLogout()}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Button>
        </div>

        <Navigation />

        <SocieteManagement />
      </div>
    </div>
  );
}