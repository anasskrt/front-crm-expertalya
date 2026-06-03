"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Navigation from "@/components/crm/Navigation";
import { Loader2, AlertTriangle, CheckCircle2, Search, ArrowUpDown } from "lucide-react";
import {
  DashboardSociete,
  AlertePaiement,
  getDashboardPaiements,
} from "@/lib/api/facture";

const ALERTE_CONFIG: Record<
  AlertePaiement,
  { label: string; className: string }
> = {
  A_JOUR:              { label: "À jour",             className: "bg-green-100 text-green-700" },
  SANS_TARIF:          { label: "Sans tarif",          className: "bg-gray-100 text-gray-600" },
  SANS_FACTURE:        { label: "Sans facture",        className: "bg-orange-100 text-orange-700" },
  SOLDE_IMPAYE:        { label: "Solde impayé",        className: "bg-red-100 text-red-700" },
  FACTURES_EN_ATTENTE: { label: "Factures en attente", className: "bg-yellow-100 text-yellow-700" },
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

export default function DashboardPaiementsPage() {
  const [societes, setSocietes] = useState<DashboardSociete[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDashboardPaiements()
      .then((data) => {
        const sorted = [...data].sort((a, b) => b.solde - a.solde);
        setSocietes(sorted);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const filtered = societes.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.siret.includes(search)
  );

  // KPIs globaux
  const totalSolde = societes.reduce((sum, s) => sum + s.solde, 0);
  const nbImpayees = societes.reduce((sum, s) => sum + s.nbFacturesImpayees, 0);
  const nbAJour = societes.filter((s) => s.alertes.includes("A_JOUR")).length;
  const nbAlerte = societes.filter((s) =>
    s.alertes.some((a) => a === "SOLDE_IMPAYE" || a === "FACTURES_EN_ATTENTE")
  ).length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Paiements</h1>
          <p className="text-gray-500 mt-1">État des paiements de toutes les sociétés du cabinet</p>
        </div>

        <Navigation />

        {loading && (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </CardContent>
          </Card>
        )}

        {error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 gap-2 text-red-500">
              <AlertTriangle className="h-8 w-8" />
              <p>Impossible de charger le dashboard paiements.</p>
            </CardContent>
          </Card>
        )}

        {!loading && !error && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card className="p-4">
                <p className="text-xs text-gray-500 mb-1">Solde total impayé</p>
                <p className={`text-xl font-bold ${totalSolde > 0 ? "text-red-600" : "text-green-600"}`}>
                  {formatCurrency(totalSolde)}
                </p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-gray-500 mb-1">Factures en attente</p>
                <p className="text-xl font-bold text-yellow-600">{nbImpayees}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-gray-500 mb-1">Sociétés à jour</p>
                <p className="text-xl font-bold text-green-600">{nbAJour}</p>
              </Card>
              <Card className="p-4">
                <p className="text-xs text-gray-500 mb-1">Sociétés en alerte</p>
                <p className="text-xl font-bold text-red-500">{nbAlerte}</p>
              </Card>
            </div>

            {/* Recherche */}
            <div className="relative mb-4 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Rechercher une société..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Table */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ArrowUpDown className="h-4 w-4" />
                  {filtered.length} société{filtered.length > 1 ? "s" : ""} — triées par solde décroissant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {filtered.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">Aucun résultat</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b bg-gray-50">
                        <tr>
                          <th className="text-left px-4 py-3 font-medium text-gray-500">Société</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-500">Mensualité</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-500">Total dû</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-500">Payé</th>
                          <th className="text-right px-4 py-3 font-medium text-gray-500">Solde</th>
                          <th className="text-center px-4 py-3 font-medium text-gray-500">Impayées</th>
                          <th className="text-center px-4 py-3 font-medium text-gray-500">Date début facture</th>

                          <th className="px-4 py-3 font-medium text-gray-500">Alertes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {filtered.map((s) => {
                          const aJour = s.alertes.includes("A_JOUR");
                          return (
                            <tr
                              key={s.id}
                              className="hover:bg-gray-50 transition-colors"
                            >
                              <td className="px-4 py-3">
                                <Link
                                  href={`/societe/${s.id}`}
                                  className="font-medium text-blue-600 hover:underline"
                                >
                                  {s.name}
                                </Link>
                                <p className="text-xs text-gray-400">{s.formeJuridique}</p>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {formatCurrency(s.mensualiteActuelle)}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {formatCurrency(s.totalDu)}
                              </td>
                              <td className="px-4 py-3 text-right text-green-600">
                                {formatCurrency(s.totalPaye)}
                              </td>
                              <td className={`px-4 py-3 text-right font-semibold ${s.solde > 0 ? "text-red-600" : "text-gray-500"}`}>
                                {formatCurrency(s.solde)}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {s.nbFacturesImpayees > 0 ? (
                                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                                    {s.nbFacturesImpayees}
                                  </span>
                                ) : (
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
                                )}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {s.dateDebut
                                  ? new Date(s.dateDebut).toLocaleDateString("fr-FR", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })
                                  : "—"}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1">
                                  {aJour ? (
                                    <Badge className={ALERTE_CONFIG["A_JOUR"].className}>
                                      {ALERTE_CONFIG["A_JOUR"].label}
                                    </Badge>
                                  ) : (
                                    s.alertes.map((alerte) => (
                                      <Badge
                                        key={alerte}
                                        className={ALERTE_CONFIG[alerte].className}
                                      >
                                        {ALERTE_CONFIG[alerte].label}
                                      </Badge>
                                    ))
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
