/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Building,
  Heart,
  MapPin,
  Calendar,
  Eye,
  AlertTriangle,
  Search,
  Filter,
  X,
  User,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Clock,
  FileText,
} from "lucide-react";
import { apiGet, apiPatch, apiDelete } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { SocieteShort } from "@/data/data";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { mockFormatsJuridiques } from "@/data/mockData";

// ─── Types filtres ────────────────────────────────────────────────────────────
interface Filters {
  search: string;
  formeJuridique: string;
  alertes: string;       // "cloture" | "tva" | "nonAttribue" | ""
  favorisOnly: boolean;
  dirigeant: string;
  dateClotureDebut: string;
  dateClotureFin: string;
}

const EMPTY_FILTERS: Filters = {
  search: "",
  formeJuridique: "",
  alertes: "",
  favorisOnly: false,
  dirigeant: "",
  dateClotureDebut: "",
  dateClotureFin: "",
};

// ─── Helpers visuels ─────────────────────────────────────────────────────────
function alertLevel(s: SocieteShort): "red" | "orange" | "none" {
  if (s.alerteClotureDepassee || s.alerteTvaMensuelleManquante) return "red";
  if (s.alerteClotureProchaineEcheance || s.alertePasExerciceEnCours) return "orange";
  return "none";
}

function ProgressBar({ value, total, color }: { value: number; total: number; color: string }) {
  const pct = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-500 w-10 text-right">{value}/{total}</span>
    </div>
  );
}

function ClotureDate({ date, depassee, proche }: { date: string; depassee: boolean; proche: boolean }) {
  if (!date) return <span className="text-gray-400 text-xs">—</span>;
  const label = new Date(date).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  if (depassee) return <span className="text-red-600 font-semibold text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{label}</span>;
  if (proche) return <span className="text-orange-500 font-semibold text-xs flex items-center gap-1"><AlertTriangle className="h-3 w-3" />{label}</span>;
  return <span className="text-gray-600 text-xs">{label}</span>;
}

// ─── Composant principal ──────────────────────────────────────────────────────
export default function SocieteManagement() {
  const { toast } = useToast();

  const [societes, setSocietes] = useState<SocieteShort[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ─── Filtrage local ─────────────────────────────────────────────────────────
  const filtered = societes.filter((s) => {
    if (filters.favorisOnly && !favorites.includes(s.id)) return false;
    if (filters.formeJuridique && s.formeJuridique !== filters.formeJuridique) return false;
    if (filters.dirigeant) {
      const full = `${s.dirigeantPrenom} ${s.dirigeantNom}`.toLowerCase();
      if (!full.includes(filters.dirigeant.toLowerCase())) return false;
    }
    if (filters.dateClotureDebut || filters.dateClotureFin) {
      const dc = new Date(s.dateCloturePlusAncienExercice);
      if (filters.dateClotureDebut && dc < new Date(filters.dateClotureDebut)) return false;
      if (filters.dateClotureFin && dc > new Date(filters.dateClotureFin)) return false;
    }
    if (filters.alertes === "cloture" && !s.alerteClotureProchaineEcheance && !s.alerteClotureDepassee) return false;
    if (filters.alertes === "tva" && !s.alerteTvaMensuelleManquante) return false;
    if (filters.alertes === "nonAttribue" && !s.missionsNonAttribuees) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const fullName = `${s.dirigeantPrenom} ${s.dirigeantNom}`.toLowerCase();
      if (!s.name.toLowerCase().includes(q) && !s.siret.includes(q) && !fullName.includes(q)) return false;
    }
    return true;
  });

  const activeFiltersCount = [
    filters.search,
    filters.formeJuridique,
    filters.alertes,
    filters.favorisOnly ? "1" : "",
    filters.dirigeant,
    filters.dateClotureDebut,
    filters.dateClotureFin,
  ].filter(Boolean).length;

  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats = [
    { label: "Sociétés", value: filtered.length, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Favoris", value: filtered.filter((s) => favorites.includes(s.id)).length, color: "text-red-500", bg: "bg-red-50" },
    { label: "Alertes", value: filtered.filter((s) => alertLevel(s) !== "none").length, color: "text-orange-500", bg: "bg-orange-50" },
    { label: "TVA manquante", value: filtered.filter((s) => s.alerteTvaMensuelleManquante).length, color: "text-red-600", bg: "bg-red-50" },
  ];

  // ─── Chargement ─────────────────────────────────────────────────────────────
  useEffect(() => {
    setLoading(true);
    apiGet<any[]>("/user/favori").then((data) => setFavorites(data.map((s: any) => s.id)));
    apiGet<SocieteShort[]>("/societe")
      .then((data) => setSocietes(data))
      .finally(() => setLoading(false));
  }, []);

  const handleLike = async (id: number) => {
    try {
      await apiPatch(`/user/favori`, { societeId: id });
      setFavorites((prev) => [...prev, id]);
      toast({ title: "Ajouté aux favoris" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  const handleUnlike = async (id: number) => {
    try {
      await apiDelete(`/user/favori/${id}`);
      setFavorites((prev) => prev.filter((f) => f !== id));
      toast({ title: "Retiré des favoris" });
    } catch {
      toast({ title: "Erreur", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Barre de recherche + filtres ───────────────────────────────────── */}
      <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">

        {/* Ligne principale */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher par nom, SIRET, dirigeant…"
              value={filters.search}
              onChange={(e) => updateFilter("search", e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Toggle filtres avancés */}
          <Button
            variant="outline"
            onClick={() => setFiltersOpen((o) => !o)}
            className="gap-1.5 shrink-0"
          >
            <Filter className="h-4 w-4" />
            Filtres
            {activeFiltersCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
            {filtersOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </Button>

          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="icon" onClick={() => setFilters(EMPTY_FILTERS)} title="Effacer tous les filtres">
              <X className="h-4 w-4 text-gray-500" />
            </Button>
          )}

          <Link href="/societe/nouveau">
            <Button className="bg-blue-600 hover:bg-blue-700 shrink-0">+ Nouvelle société</Button>
          </Link>
        </div>

        {/* Filtres rapides (toujours visibles) */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => updateFilter("favorisOnly", !filters.favorisOnly)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filters.favorisOnly ? "bg-red-50 border-red-300 text-red-700" : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${filters.favorisOnly ? "fill-red-500 text-red-500" : ""}`} />
            Favoris
          </button>
          {[
            { key: "cloture", label: "Clôture proche/dépassée", color: "orange" },
            { key: "tva", label: "TVA manquante", color: "red" },
            { key: "nonAttribue", label: "Missions non attribuées", color: "yellow" },
          ].map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => updateFilter("alertes", filters.alertes === key ? "" : key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border transition-colors ${
                filters.alertes === key
                  ? color === "orange" ? "bg-orange-50 border-orange-300 text-orange-700"
                  : color === "red" ? "bg-red-50 border-red-300 text-red-700"
                  : "bg-yellow-50 border-yellow-300 text-yellow-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Filtres avancés */}
        {filtersOpen && (
          <div className="border-t pt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Forme juridique</label>
              <select
                value={filters.formeJuridique}
                onChange={(e) => updateFilter("formeJuridique", e.target.value)}
                className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background"
              >
                <option value="">Toutes</option>
                {mockFormatsJuridiques.map((f) => (
                  <option key={f.id} value={f.format}>{f.format}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Dirigeant</label>
              <Input
                placeholder="Nom du dirigeant…"
                value={filters.dirigeant}
                onChange={(e) => updateFilter("dirigeant", e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Clôture — du</label>
              <Input
                type="date"
                value={filters.dateClotureDebut}
                onChange={(e) => updateFilter("dateClotureDebut", e.target.value)}
                className="text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Clôture — au</label>
              <Input
                type="date"
                value={filters.dateClotureFin}
                onChange={(e) => updateFilter("dateClotureFin", e.target.value)}
                className="text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => (
          <div key={s.label} className={`${s.bg} rounded-xl p-4 flex items-center gap-3`}>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-sm text-gray-600 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── En-tête liste ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          {loading ? "Chargement…" : `${filtered.length} société${filtered.length > 1 ? "s" : ""} affichée${filtered.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {/* ── Cartes sociétés ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((s) => {
          const level = alertLevel(s);
          const isFav = favorites.includes(s.id);
          const exercicesTermines = s.exercicesTotal - s.exercicesNonTerminees;

          return (
            <Card
              key={s.id}
              className={`relative overflow-hidden hover:shadow-md transition-shadow border-l-4 ${
                level === "red" ? "border-l-red-500" :
                level === "orange" ? "border-l-orange-400" :
                "border-l-green-400"
              }`}
            >
              <CardContent className="p-0">

                {/* ── En-tête carte ───────────────────────────────────── */}
                <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-gray-900 truncate">{s.name}</h3>
                      <Badge variant="outline" className="text-xs shrink-0">{s.formeJuridique}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      {s.dirigeantPrenom} {s.dirigeantNom}
                    </div>
                  </div>
                  <button
                    onClick={() => isFav ? handleUnlike(s.id) : handleLike(s.id)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
                  >
                    <Heart className={`h-4 w-4 ${isFav ? "fill-red-500 text-red-500" : "text-gray-300"}`} />
                  </button>
                </div>

                {/* ── Alertes ─────────────────────────────────────────── */}
                {(s.alerteClotureDepassee || s.alerteClotureProchaineEcheance || s.alerteTvaMensuelleManquante || s.alertePasExerciceEnCours || s.missionsNonAttribuees) && (
                  <div className="px-4 pb-2 flex flex-wrap gap-1.5">
                    {s.alerteClotureDepassee && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-medium">
                        <AlertTriangle className="h-3 w-3" /> Clôture dépassée
                      </span>
                    )}
                    {!s.alerteClotureDepassee && s.alerteClotureProchaineEcheance && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 text-[11px] font-medium">
                        <AlertTriangle className="h-3 w-3" /> Clôture proche
                      </span>
                    )}
                    {s.alerteTvaMensuelleManquante && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-medium">
                        <AlertTriangle className="h-3 w-3" /> TVA mensuelle manquante
                      </span>
                    )}
                    {s.alertePasExerciceEnCours && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-medium">
                        <AlertTriangle className="h-3 w-3" /> Pas d&apos;exercice en cours
                      </span>
                    )}
                    {!!s.missionsNonAttribuees && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 text-[11px] font-medium">
                        Missions non attribuées
                      </span>
                    )}
                    {s.alerteTvaMensuelleHistoriqueManquante && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[11px] font-medium">
                        <AlertTriangle className="h-3 w-3" /> TVA mensuelle historique manquante
                      </span>
                    )}
                  </div>
                )}

                {/* ── Infos clés ──────────────────────────────────────── */}
                <div className="px-4 pb-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span className="truncate">{s.siegeSocial || "—"}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                    <span>Clôture : </span>
                    <ClotureDate
                      date={s.dateCloturePlusAncienExercice}
                      depassee={s.alerteClotureDepassee}
                      proche={s.alerteClotureProchaineEcheance}
                    />
                  </div>
                  {s.activite && (
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{s.activite.name}</span>
                    </div>
                  )}
                  {s.regimeImposition && (
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>Imposition : <span className="font-medium">{s.regimeImposition}</span></span>
                    </div>
                  )}
                  {s.prochaineMissionEcheance && (
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>Prochaine échéance : <span className="font-medium">{new Date(s.prochaineMissionEcheance).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}</span></span>
                    </div>
                  )}
                </div>

                {/* ── Progressions ────────────────────────────────────── */}
                <div className="px-4 pb-3 space-y-2 border-t pt-3">
                  <div>
                    <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                      <span className="flex items-center gap-1">
                        Missions
                        {s.missionsEnRetard > 0 && (
                          <span className="bg-red-100 text-red-600 font-semibold px-1.5 py-0.5 rounded-full">
                            {s.missionsEnRetard} en retard
                          </span>
                        )}
                      </span>
                      <span>{s.missionsTerminees}/{s.missionsTotal}</span>
                    </div>
                    <ProgressBar value={s.missionsTerminees} total={s.missionsTotal} color="bg-blue-500" />
                  </div>
                  {s.missionsTvaAttendu > 0 && (
                    <div>
                      <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                        <span>Missions TVA</span>
                        <span className={s.alerteTvaMensuelleManquante ? "text-red-500 font-medium" : ""}>{s.missionsTvaCount}/{s.missionsTvaAttendu}</span>
                      </div>
                      <ProgressBar
                        value={s.missionsTvaCount}
                        total={s.missionsTvaAttendu}
                        color={s.alerteTvaMensuelleManquante ? "bg-red-400" : "bg-green-500"}
                      />
                    </div>
                  )}
                  <div>
                    <div className="flex justify-between text-[11px] text-gray-500 mb-1">
                      <span>Exercices</span>
                      <span>{exercicesTermines}/{s.exercicesTotal}</span>
                    </div>
                    <ProgressBar value={exercicesTermines} total={s.exercicesTotal} color="bg-indigo-500" />
                  </div>
                </div>

                {/* ── Pied de carte ────────────────────────────────────── */}
                <div className="px-4 pb-4 flex items-center justify-between">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] text-gray-400">SIRET : {s.siret}</span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {s.documentsCount} document{s.documentsCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <Link href={`/societe/${s.id}`}>
                    <Button size="sm" variant="outline" className="gap-1.5 h-8 text-xs">
                      <Eye className="h-3.5 w-3.5" />
                      Détails
                    </Button>
                  </Link>
                </div>

              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ── État vide ───────────────────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Building className="h-14 w-14 text-gray-200 mb-4" />
          <h3 className="font-medium text-gray-700 mb-1">Aucune société trouvée</h3>
          <p className="text-sm text-gray-400 mb-4">Modifiez vos critères de recherche ou effacez les filtres.</p>
          <Button variant="outline" onClick={() => setFilters(EMPTY_FILTERS)}>
            <X className="h-4 w-4 mr-1.5" />
            Effacer les filtres
          </Button>
        </div>
      )}

    </div>
  );
}
