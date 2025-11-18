"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, ArrowLeft } from "lucide-react";
import CreateSocieteForm from "@/components/crm/societe/CreateSocieteForm";
import Navigation from "@/components/crm/Navigation";

export default function NewSocietePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null; // render nothing while redirecting
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Nouvelle Société
            </h1>
            <p className="text-gray-600">
              Créez une nouvelle société avec toutes ses informations
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/societes" passHref>
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" /> Retour
              </Button>
            </Link>
            <Button
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Se déconnecter
            </Button>
          </div>
        </div>

        <Navigation />

        <CreateSocieteForm />
      </div>
    </div>
  );
}
