"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import GestionFacturesGlobale from "@/components/crm/facture/GestionFacturesGlobale";
import Navigation from "@/components/crm/Navigation";

const GestionFacturesPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  if (!isAuthenticated) {
    window.location.href = "/";
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion Globale des Factures</h1>
            <p className="text-gray-600">
              Vue d&apos;ensemble des facturations et des retards de paiement
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

        <GestionFacturesGlobale />
      </div>
    </div>
  );
};

export default GestionFacturesPage;