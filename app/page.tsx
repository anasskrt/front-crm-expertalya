/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Building, Heart, UserCog, LogOut, Plus } from "lucide-react";
import Navigation from "@/components/crm/Navigation";
import { getProfil } from "@/app/api/profil";
import { logout } from "@/app/api/auth";

export default function Page() {
  const [pending, setPending] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getProfil();          // l'intercepteur lit le JWT depuis le cookie
        if (!cancelled) setCurrentUser(user);
      } catch {
        // Pas de JWT ou expiré → redirection vers /login
        if (typeof window !== "undefined") {
          window.location.href = "/login?reason=expired";
        }
      } finally {
        if (!cancelled) setPending(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Ignorer les erreurs de logout
    }
    window.location.href = "/login";
  };

  if (pending) {
    return <div className="text-center py-12 text-gray-500">Chargement du dashboard...</div>;
  }

  if (!currentUser) {
    // On a déclenché une redirection plus haut.
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard CRM</h1>
            <p className="text-gray-600">
              Bienvenue, {currentUser.prenom} {currentUser.nom} ({currentUser.role})
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </button>
        </div>

        <Navigation />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sociétés</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100</div>
              <p className="text-xs text-muted-foreground">+2 ce mois</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Utilisateurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100</div>
              <p className="text-xs text-muted-foreground">Actifs</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Documents manquants</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100</div>
              <p className="text-xs text-muted-foreground">À traiter</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader className="flex items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Clôtures proches</CardTitle>
              <UserCog className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">100</div>
              <p className="text-xs text-muted-foreground">Ce mois</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-blue-600" />
                Gestion des Sociétés
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Consultez et gérez toutes vos sociétés en un seul endroit.</p>
              <Link href="/societe">
                <Button className="w-full">Voir les sociétés</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-green-600" />
                Nouvelle Société
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Créez une nouvelle société avec toutes ses informations.</p>
              <Link href="/societe/nouveau">
                <Button className="w-full bg-green-600 hover:bg-green-700">Créer une société</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5 text-purple-600" />
                Mon Profil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Gérez votre profil et consultez vos sociétés favorites.</p>
              <Link href="/profil">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">Voir mon profil</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
