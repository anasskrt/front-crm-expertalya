/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import Navigation from "@/components/crm/Navigation";
import { useUser } from "@/context/UserContext";
import { apiGet, apiPost } from "@/lib/api";
import SocieteArchiverManagement from "@/components/crm/societe/SocieteArchiverManagement";

export default function SocietesPage() {
  const { currentUser, setCurrentUser } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      apiGet<any>("/user/profil")
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
      await apiPost("/auth/logout", {});
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
              Gestion des Sociétés Archivées
            </h1>
            <p className="text-gray-600">
              Gérez toutes vos sociétés archivées en un seul endroit
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

        <SocieteArchiverManagement />
      </div>
    </div>
  );
}