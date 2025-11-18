"use client";

import Navigation from "@/components/crm/Navigation";
import { useState } from "react";
import ExcelManagement from "@/components/crm/ExcelManagement";

const UtilisateurPage = () => {
      const [isAuthenticated] = useState(true);
    
      if (!isAuthenticated) {
        window.location.href = "/";
        return null;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion de la plateforme Excel</h1>
              <p className="text-gray-600">
                Gérez les feuilles excel partagées et accédez aux liens de téléchargement
              </p>
            </div>
    
            <Navigation />
    
            <ExcelManagement />
          </div>
        </div>
      );
    };

export default UtilisateurPage;