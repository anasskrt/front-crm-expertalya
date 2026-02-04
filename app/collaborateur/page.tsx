/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { LogOut } from "lucide-react";
import Navigation from "@/components/crm/Navigation";
import { useUser } from "@/context/UserContext";
import { getProfil } from "@/api/profil";
import { logout } from "@/api/auth";
import { useRouter } from "next/navigation";
import TacheManagementCollabo from "@/components/crm/tache/CollaborateurTache";

const MissionsPage = () => {
  const { currentUser, setCurrentUser } = useUser();
  const [loading, setLoading] = useState(true);
  const router = useRouter();

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Tâches</h1>
            <p className="text-gray-600">
              Gérez les tâches et missions pour chaque société
            </p>
          </div>
          <button
            onClick={() => handleLogout()}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>

        <Navigation />

        <TacheManagementCollabo />
      </div>
    </div>
  );
};

export default MissionsPage;