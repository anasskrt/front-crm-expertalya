/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Heart,
  MapPin,
  Calendar,
  FileText,
  Eye
} from "lucide-react";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";

import { useToast } from "@/hooks/use-toast";

import SocieteAdvancedFilters, { AdvancedFilters } from "./SocieteAdvancedFilters";
import { SocieteShort } from "@/data/data";
import Link from "next/link";

export default function SocieteManagement() {
  const { toast } = useToast();

  const [societes, setSocietes] = useState<SocieteShort[]>([]);
  const [favorites, setFavorites] = useState<number[]>([1, 2]);
  const [loading, setLoading] = useState(false);

  const [filters, setFilters] = useState<AdvancedFilters>({
    searchTerm: "",
    formatJuridique: "",
    statutDocuments: "",
    dateClotureDebut: "",
    dateClotureFin: "",
    dirigeant: "", 
  });

  const filteredSocietes = societes.filter(s => {
    const { searchTerm, formatJuridique, statutDocuments, dirigeant, dateClotureDebut, dateClotureFin } = filters;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const fullName = `${s.dirigeantPrenom} ${s.dirigeantNom}`.toLowerCase();
      if (!(
        s.name.toLowerCase().includes(lower) ||
        s.siret.includes(lower) ||
        fullName.includes(lower)
      )) return false;
    }
    if (formatJuridique && s.formeJuridique !== formatJuridique) return false;
    if (statutDocuments) {
      const has = s.document;
      if (statutDocuments === 'ok' && !has) return false;
      if (statutDocuments === 'manquants' && has) return false;
    }
    if (dirigeant) {
      const full = `${s.dirigeantPrenom} ${s.dirigeantNom}`.toLowerCase();
      if (!full.includes(dirigeant.toLowerCase())) return false;
    }
    if (dateClotureDebut || dateClotureFin) {
      const dc = new Date(s.dateCloture1);
      if (dateClotureDebut && dc < new Date(dateClotureDebut)) return false;
      if (dateClotureFin && dc > new Date(dateClotureFin)) return false;
    }
    return true;
  });

  const clearFilters = () => setFilters({
    searchTerm: "",
    formatJuridique: "",
    statutDocuments: "",
    dateClotureDebut: "",
    dateClotureFin: "",
    dirigeant: ""
  });

  const handleLikeSociete = async (id: number) => {
    try {
      await apiPatch(`/user/favori`, { societeId: id });
      setFavorites(prev => [...prev, id]);
      toast({ title: "Ajouté aux favoris", description: "Société ajoutée à vos favoris." });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ajouter aux favoris.", variant: "destructive" });
    }
  };

  const handleUnlikeSociete = async (id: number) => {
    try {
      await apiDelete(`/user/favori/${id}`);
      setFavorites(prev => prev.filter(favId => favId !== id));
      toast({ title: "Retiré des favoris", description: "Société retirée de vos favoris." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de retirer des favoris.", variant: "destructive" });
    }
  };

  useEffect(() => {
    setLoading(true);

    apiGet<any[]>("/user/favori").then((data) => {
      setFavorites(data.map((s: any) => s.id));
    }),

    apiGet<SocieteShort[]>("/societe", filters as unknown as Record<string, string>)
      .then((data) => setSocietes(data))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <div className="space-y-6">
      <SocieteAdvancedFilters filters={filters} onFiltersChange={setFilters} onClearFilters={clearFilters} />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Sociétés ({filteredSocietes.length})</h2>
        {loading && <span className="text-blue-600 ml-4">Chargement...</span>}*
        <Link href="/societe/nouveau">
          <Button className="bg-blue-600 hover:bg-blue-700">
            + Créer une société
          </Button>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[{
          icon:<Building className="h-8 w-8 text-blue-600"/>,
          value:filteredSocietes.length,
          label:"Affichées"
        },{
          icon:<Heart className="h-8 w-8 text-red-600"/>,
          value:filteredSocietes.filter(s=>favorites.includes(s.id)).length,
          label:"Favoris"
        },{
          icon:<FileText className="h-8 w-8 text-green-600"/>,
          value:filteredSocietes.filter(s=>s.document).length,
          label:"Docs OK"
        },{
          icon:<Calendar className="h-8 w-8 text-orange-600"/>,
          value:filteredSocietes.filter(s=>new Date(s.dateCloture1)<new Date(Date.now()+30*24*60*60*1000)).length,
          label:"Clôtures proches"
        }].map((stat,i)=>(
          <Card key={i}><CardContent className="p-4 flex items-center gap-2">{stat.icon}<div><p className="text-2xl font-bold">{stat.value}</p><p className="text-sm text-gray-600">{stat.label}</p></div></CardContent></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredSocietes.map(s=> (
          <Card key={s.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3 flex justify-between items-start">
              <div className="flex-1">
                <CardTitle className="text-lg">{s.name}</CardTitle>
                <div className="flex gap-2 mt-2">
                    <Badge variant="outline">{s.formeJuridique}</Badge>
                    {/* <Badge className={statusColor(s.document)}>{s.document?"OK":"Manquants"}</Badge> */}
                    {s.hasOngoingTask && (
                      <Badge className="bg-indigo-100 text-indigo-800">
                        Mission en cours
                      </Badge>
                    )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => favorites.includes(s.id) ? handleUnlikeSociete(s.id) : handleLikeSociete(s.id)}
              >
                <Heart className={`h-5 w-5 ${favorites.includes(s.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>SIRET: <span className="text-gray-600">{s.siret}</span></div>
              <div className="flex items-center gap-1"><MapPin className="h-4 w-4 text-gray-400"/>{s.siegeSocial}</div>
              <div className="flex items-center gap-1"><Calendar className="h-4 w-4 text-gray-400"/>Clôture: {new Date(s.dateCloture1).toLocaleDateString()}</div>
              <div>Dirigeant: <span className="text-gray-600">{s.dirigeantPrenom} {s.dirigeantNom}</span></div>
              <div>Activité: <span className="texay-600">{s.activite?.name}</span></div>
              <div className="flex gap--3 border-t">
                <Link href={`/societe/${s.id}`}>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    Détails
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filteredSocietes.length===0 && (
        <Card className="p-8 text-center">
          <Building className="h-16 w-16 text-gray-300 mx-auto mb-4"/>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune société trouvée</h3>
          <p className="text-gray-600 mb-4">Aucune société ne correspond à vos critères.</p>
          <div className="flex gap-2 justify-center"><Button variant="outline" onClick={clearFilters}>Effacer filtres</Button></div>
        </Card>
      )}
    </div>
  );
}