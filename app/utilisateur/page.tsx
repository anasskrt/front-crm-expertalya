"use client";

import Navigation from "@/components/crm/Navigation";
import { useState } from "react";
import UserManagementByCompany from "@/components/crm/societe/UserManagementByCompany";

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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Gestion des Utilisateurs</h1>
              <p className="text-gray-600">
                Gérez les utilisateurs par cabinet et ajoutez de nouveaux collaborateurs
              </p>
            </div>
    
            <Navigation />
    
            <UserManagementByCompany />
          </div>
        </div>
      );
    };

export default UtilisateurPage;