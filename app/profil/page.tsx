"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, UserCog, Heart } from "lucide-react";
import { getProfil } from "@/app/api/profil";
import { logout } from "@/app/api/auth";
import UserProfile from "@/components/crm/user/UserProfile";
import CompanyFavorites from "@/components/crm/user/CompanyFavorites";
import Navigation from "@/components/crm/Navigation";
import { useUser } from "@/context/UserContext";

export default function ProfilPage() {
  const { currentUser, setCurrentUser } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      getProfil()
        .then(setCurrentUser)
        .catch(() => {
          setCurrentUser(null);
          router.push("/");
        });
    }
  }, [currentUser, router, setCurrentUser]);

  if (!currentUser) {
    return null;
  }

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
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Mon Profil</h1>
            <p className="text-gray-600">Gérez votre profil et vos sociétés favorites</p>
            
          </div>
          <Button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Button>
        </div>

        <Navigation />

        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <Tabs defaultValue="profil" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="profil" className="flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Mon Profil
                </TabsTrigger>
                <TabsTrigger value="favoris" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Mes Favoris
                </TabsTrigger>
              </TabsList>

              <TabsContent value="profil" className="mt-6">
                <UserProfile user={currentUser} />
              </TabsContent>

              <TabsContent value="favoris" className="mt-6">
                <CompanyFavorites />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
