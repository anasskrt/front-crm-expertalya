/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, Goal } from "lucide-react";
import { getTacheForSociete } from "@/app/api/tache";
import { useToast } from "@/hooks/use-toast";
import type { Tache } from "@/data/data";

type Counts = {
  enAttente: number;
  enCours: number;
  terminee: number;
};

function getStatusBadge(statut: string) {
  switch (statut) {
    case "EN_ATTENTE":
      return { label: "En attente", color: "bg-yellow-100 text-yellow-800" };
    case "EN_COURS":
      return { label: "En cours", color: "bg-blue-100 text-blue-800" };
    case "TERMINEE":
      return { label: "Terminée", color: "bg-green-100 text-green-800" };
    case "ANNULEE":
      return { label: "Annulée", color: "bg-red-100 text-red-800" };
    default:
      return { label: "Inconnu", color: "bg-gray-100 text-gray-800" };
  }
}

export default function SocieteTaches({
  societeId,
  className,
  onCountsChange,
}: {
  societeId: number;
  className?: string;
  /** Optionnel : renvoie les compteurs au parent */
  onCountsChange?: (c: Counts) => void;
}) {
  const { toast } = useToast();
  const [taches, setTaches] = useState<Tache[]>([]);
  const [counts, setCounts] = useState<Counts>({ enAttente: 0, enCours: 0, terminee: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getTacheForSociete(societeId);
        if (!mounted) return;
        setTaches(Array.isArray(data?.tasks) ? data.tasks : []);
        const nextCounts: Counts = {
          enAttente: data?.counts?.enAttente ?? 0,
          enCours: data?.counts?.enCours ?? 0,
          terminee: data?.counts?.terminee ?? 0,
        };
        setCounts(nextCounts);
        onCountsChange?.(nextCounts);
      } catch (e: any) {
        if (mounted) {
          toast({
            title: "Erreur",
            description: e?.message || "Impossible de récupérer les tâches.",
            variant: "destructive",
          });
        }
      } finally {
        mounted && setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [societeId, toast, onCountsChange]);

  const sorted = useMemo(() => {
    return [...taches].sort((a, b) => {
      if (a.statut === b.statut) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      // Option : ordonner par statut (EN_COURS > EN_ATTENTE > TERMINEE > ANNULEE)
      const order: Record<string, number> = { EN_COURS: 0, EN_ATTENTE: 1, TERMINEE: 2, ANNULEE: 3 };
      return (order[a.statut] ?? 99) - (order[b.statut] ?? 99);
    });
  }, [taches]);

  return (
    <div className={className}>
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{counts.enAttente}</p>
                <p className="text-sm text-gray-600">Tâches en attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{counts.enCours}</p>
                <p className="text-sm text-gray-600">Tâches en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{counts.terminee}</p>
                <p className="text-sm text-gray-600">Tâches terminées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste */}
      <div className="space-y-4 mt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900">
            Tâches {loading ? "(chargement…)" : `(${taches.length})`}
          </h2>
        </div>

        {loading ? (
          <Card className="p-8 text-center">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chargement des tâches…</h3>
          </Card>
        ) : sorted.length === 0 ? (
          <Card className="p-8 text-center">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche créée</h3>
          </Card>
        ) : (
          sorted.map((mission) => {
            const status = getStatusBadge(mission.statut);
            return (
              <Card
                key={mission.id}
                className="transition-shadow hover:shadow-lg border-l-4 border-blue-500"
              >
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {mission.titre}
                        </h3>
                        <Badge className={`${status.color} font-medium px-3 py-1 rounded-full text-xs`}>
                          {status.label}
                        </Badge>
                      </div>

                      <p className="text-gray-600 text-sm">{mission.description}</p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700 mt-2">
                        <div>
                          <span className="font-medium">Type:</span> {mission.type}
                        </div>
                        <div>
                          <span className="font-medium">Urgente:</span> {mission.urgente ? "Oui" : "Non"}
                        </div>
                        <div>
                          <span className="font-medium">Temps passé:</span> {mission.tempsPasse ?? "-"} min
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                        <div>
                          <span className="font-medium">Date début:</span>{" "}
                          {mission.dateTache ? new Date(mission.dateTache).toLocaleDateString() : "-"}
                        </div>
                        <div>
                          <span className="font-medium">Date échéance:</span>{" "}
                          {mission.dateEcheance ? new Date(mission.dateEcheance).toLocaleDateString() : "-"}
                        </div>
                        <div>
                          <span className="font-medium">Créée le:</span>{" "}
                          {new Date(mission.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
                        <div>
                          <span className="font-medium">Société:</span> Celle ci !
                        </div>
                        <div>
                          <span className="font-medium">Assigné à:</span>{" "}
                          {mission.collaborateur?.name} {mission.collaborateur?.firstName}
                        </div>
                        <div>
                          <span className="font-medium">Créé par:</span>{" "}
                          {mission.createur?.name} {mission.createur?.firstName}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
