/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Heart, Search, Building, Users, MapPin, Calendar } from "lucide-react";
import { getListeFav, addSocieteToFavoris, removeSocieteFromFavoris } from "@/api/listeFav";

export default function CompanyFavorites() {
  const [companies, setCompanies] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]); // ou number[] selon ton identifiant
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    refreshFavorites();
  }, []);

  const refreshFavorites = async () => {
    const data = await getListeFav();
    setCompanies(data);
    setFavorites(data.map((c: any) => c.id)); // Utilise maintenant l'id
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.siegeSocial.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFavorite = async (societe: any) => {
    const isFav = favorites.includes(societe.id); // Utilise l'id
    console.log(societe);
    if (isFav) {
      await removeSocieteFromFavoris(societe.id);
    } else {
      await addSocieteToFavoris(societe.id);
    }
    await refreshFavorites();
  };

  return (
    <div className="space-y-6">
      {/* Search & count */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher des sociétés..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="px-3 py-1 flex items-center gap-1">
          <Heart className="h-4 w-4 text-red-500" />
          {favorites.length} favoris
        </Badge>
      </div>

      {/* Favorites grid */}
      <Card className="bg-gradient-to-r from-pink-50 to-rose-50 border-pink-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-pink-800">
            <Heart className="h-5 w-5 text-pink-600" />
            Mes sociétés favorites
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Companies grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((c) => {
          const isFav = favorites.includes(c.id);
          return (
            <Card key={c.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3 flex justify-between">
                <div>
                  <h3 className="text-lg font-medium">{c.name}</h3>
                  <Badge variant="outline" className="mt-1">
                    {c.formeJuridique}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleFavorite(c)}
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFav ? "fill-red-500 text-red-500" : "text-gray-400"
                    }`}
                  />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4 text-gray-400" />
                    {c.activite}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    {c.siegeSocial}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4 text-gray-400" />
                    SIRET: {c.siret}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    Clôture: {new Date(c.dateCloture1).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}                