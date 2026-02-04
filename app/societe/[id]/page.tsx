// app/societe/[id]/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { Societe } from "@/data/data";
import SocieteDetails from "@/components/crm/societe/SocieteDetails";
import Navigation from "@/components/crm/Navigation";
import { getSocieteById } from "@/api/societe";
import { useUser } from "@/context/UserContext";

export default function SocieteDetailPage() {
  const params = useParams();           // { id: string }
  const router = useRouter();
  const { id } = params || {};
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [societe, setSociete] = useState<Societe | null>(null);
  const { currentUser } = useUser();
  const userRole = currentUser ? currentUser.role : null;

  useEffect(() => {
    if (id) {
      getSocieteById(Number(id))
        .then((data) => setSociete(data))
        .catch(() => setSociete(null));
    }
  }, [id]);

  if (!isAuthenticated) {
    router.push("/");
    return null;
  }

  // Si l'entreprise n'existe pas
  if (!societe) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Société introuvable
              </h1>
              <p className="text-gray-600">
                La société demandée n&apos;existe pas.
              </p>
            </div>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </button>
          </div>

          <Navigation />

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => router.push("/societe")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour aux sociétés
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Détails de {societe.name}
            </h1>
            <p className="text-gray-600">
              Informations complètes et gestion de la société
            </p>
          </div>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>

        <Navigation />

        {/* Back button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.push("/societe")}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux sociétés
          </Button>
        </div>

        {/* Societe Details */}
        <SocieteDetails
          societe={societe}
          isOpen={true}
          onClose={() => router.push("/societe")}
          isFullPage={true}
          currentUserRole={userRole}
        />
      </div>
    </div>
  );
}
