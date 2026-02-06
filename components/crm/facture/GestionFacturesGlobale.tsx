// app/analyses/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { apiGet } from "@/lib/api";
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Search, Filter, AlertTriangle, CheckCircle,
  Clock, Euro, TrendingDown, Eye
} from "lucide-react";

interface AnalyseSociete {
  societeId: number;
  denomination: string;
  moisAttendus: number;
  moisEffectifs: number;
  manquants: number;
  enRetard: boolean;
  ajour: boolean;
  manqueCompta: number;
  manqueSocial: number;
}

export default function GestionFacturesGlobalePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [analyses, setAnalyses] = useState<AnalyseSociete[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    apiGet<AnalyseSociete[]>("/facture/analyse")
      .then(data => setAnalyses(data))
      .catch(err => {
        console.error(err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les analyses.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return analyses.filter(a => {
      const lower = searchTerm.toLowerCase();
      const matchesSearch =
        a.denomination.toLowerCase().includes(lower);
        const matchesStatus = !statusFilter
      return matchesSearch && matchesStatus;
    });
  }, [analyses, searchTerm, statusFilter]);

  const totalSoc = analyses.length;
  const ajourCount = analyses.filter(a => a.ajour).length;
  const retardCount = analyses.filter(a => a.enRetard).length;
  const totalManquants = analyses.reduce((sum, a) => sum + a.manquants, 0);

  if (loading) {
    return <p className="p-6 text-center">Chargement des analyses…</p>;
  }

  return (
    <div className="space-y-6 p-6">
      {/* Recherche & filtre */}
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher société ou SIRET…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-input rounded bg-background"
          >
            <option value="">Tous statuts</option>
            <option value="a_jour">À jour</option>
            <option value="en_retard">En retard</option>
            <option value="critique">Critique</option>
          </select>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { icon: <Euro />,      value: totalSoc,    label: "Sociétés" },
          { icon: <CheckCircle />, value: ajourCount,  label: "À jour" },
          { icon: <Clock />,     value: retardCount, label: "En retard" },
          { icon: <TrendingDown />, value: totalManquants, label: "Total manquants" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardContent className="p-4 flex items-center gap-2">
              {stat.icon}
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-600">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tableau d’analyses */}
      <Card>
        <CardHeader>
          <CardTitle>Analyse facturations par société</CardTitle>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <p className="py-6 text-center text-gray-500">Aucun résultat.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Société</TableHead>
                  <TableHead className="text-center">Attendus</TableHead>
                  <TableHead className="text-center">Effectifs</TableHead>
                  <TableHead className="text-center">Manquants</TableHead>
                  <TableHead className="text-center">À jour</TableHead>
                  <TableHead className="text-center">Manque Compta</TableHead>
                  <TableHead className="text-center">Manque Sociale</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(a => (
                  <TableRow key={a.societeId}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{a.denomination}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{a.moisAttendus}</TableCell>
                    <TableCell className="text-center">{a.moisEffectifs}</TableCell>
                    <TableCell className={`text-center font-medium ${a.manquants > 0 ? "text-red-600" : "text-green-600"}`}>
                      {a.manquants}
                    </TableCell>
                    <TableCell className="text-center">
                      {a.ajour ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mx-auto" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-red-600 mx-auto" />
                      )}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {a.manqueCompta} €
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {a.manqueSocial} €
                    </TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/societe/${a.societeId}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Détails
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
