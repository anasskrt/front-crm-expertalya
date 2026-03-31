/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/crm/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { apiGet, apiPost } from "@/lib/api";
import {
  LogOut,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  ListTodo,
} from "lucide-react";
import {
  Mission,
  getMyMissions,
  updateMission,
} from "@/lib/api/mission";
import Link from "next/link";

export default function MesMissionsPage() {
  const { currentUser, setCurrentUser } = useUser();
  const router = useRouter();
  const { toast } = useToast();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedSocietes, setExpandedSocietes] = useState<Set<number>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "done">("all");

  useEffect(() => {
    if (!currentUser) {
      apiGet<any>("/user/profil")
        .then(setCurrentUser)
        .catch(() => {
          setCurrentUser(null);
          router.push("/");
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [currentUser, router, setCurrentUser]);

  useEffect(() => {
    if (!currentUser) return;
    async function loadMissions() {
      try {
        const data = await getMyMissions();
        setMissions(data);
        console.log("Missions chargées pour collaborateur", data);
        // Auto-expand all societes
        const societeIds = new Set<number>();
        data.forEach((m) => {
          if (m.exercice?.societe?.id) {
            societeIds.add(m.exercice.societe.id);
          }
        });
        setExpandedSocietes(societeIds);
      } catch (error) {
        console.error("Erreur chargement:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger vos missions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadMissions();
  }, [currentUser, toast]);

  const handleLogout = async () => {
    try {
      await apiPost("/auth/logout", {});
    } catch {
      // Ignorer les erreurs de logout
    }
    window.location.href = "/login";
  };

  // Filter missions
  const filteredMissions = useMemo(() => {
    if (filterStatus === "all") return missions;
    if (filterStatus === "pending") return missions.filter((m) => !m.terminer);
    return missions.filter((m) => m.terminer);
  }, [missions, filterStatus]);

  // Group missions by société → exercice
  const missionsBySociete = useMemo(() => {
    const grouped: Record<number, {
      societe: { id: number; name: string };
      exercices: Record<number, {
        exercice: { id: number; dateDeCloture: string; dateMiseEnCloture: string | null };
        missions: Mission[];
      }>;
    }> = {};

    filteredMissions.forEach((mission) => {
      const societe = mission.exercice?.societe;
      const exercice = mission.exercice;
      if (!societe || !exercice) return;

      if (!grouped[societe.id]) {
        grouped[societe.id] = { societe: { id: societe.id, name: societe.name }, exercices: {} };
      }
      if (!grouped[societe.id].exercices[exercice.id]) {
        grouped[societe.id].exercices[exercice.id] = { exercice, missions: [] };
      }
      grouped[societe.id].exercices[exercice.id].missions.push(mission);
    });

    return Object.values(grouped)
      .sort((a, b) => a.societe.name.localeCompare(b.societe.name))
      .map((s) => ({
        societe: s.societe,
        exercices: Object.values(s.exercices).sort((a, b) =>
          new Date(b.exercice.dateDeCloture).getTime() - new Date(a.exercice.dateDeCloture).getTime()
        ),
      }));
  }, [filteredMissions]);

  const toggleSociete = (societeId: number) => {
    setExpandedSocietes((prev) => {
      const next = new Set(prev);
      if (next.has(societeId)) {
        next.delete(societeId);
      } else {
        next.add(societeId);
      }
      return next;
    });
  };

  const toggleTerminer = async (mission: Mission) => {
    try {
      const updated = await updateMission(mission.id, {
        terminer: !mission.terminer,
      });
      setMissions((prev) =>
        prev.map((m) => (m.id === updated.id ? updated : m))
      );
      toast({
        title: "Succès",
        description: mission.terminer
          ? "Mission marquée comme non terminée"
          : "Mission marquée comme terminée",
      });
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la mission",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

  // Stats
  const stats = useMemo(() => {
    const total = missions.length;
    const done = missions.filter((m) => m.terminer).length;
    const pending = total - done;
    const societes = new Set(missions.map((m) => m.exercice?.societe?.id).filter(Boolean)).size;
    return { total, done, pending, societes };
  }, [missions]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Mes Missions
            </h1>
            <p className="text-gray-600">
              Liste des missions qui vous sont attribuées
            </p>
          </div>
          <Button
            onClick={() => handleLogout()}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Se déconnecter
          </Button>
        </div>

        <Navigation />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card
            className={`cursor-pointer transition-all ${filterStatus === "all" ? "ring-2 ring-blue-500" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total</p>
                  <p className="text-3xl font-bold">{stats.total}</p>
                </div>
                <ListTodo className="h-10 w-10 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Sociétés</p>
                  <p className="text-3xl font-bold">{stats.societes}</p>
                </div>
                <Building2 className="h-10 w-10 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${filterStatus === "pending" ? "ring-2 ring-orange-500" : ""}`}
            onClick={() => setFilterStatus("pending")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">En cours</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <Clock className="h-10 w-10 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${filterStatus === "done" ? "ring-2 ring-green-500" : ""}`}
            onClick={() => setFilterStatus("done")}
          >
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Terminées</p>
                  <p className="text-3xl font-bold text-green-600">{stats.done}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Missions List */}
        <Card>
          <CardHeader>
            <CardTitle>
              {filterStatus === "all" && "Toutes les missions"}
              {filterStatus === "pending" && "Missions en cours"}
              {filterStatus === "done" && "Missions terminées"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredMissions.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                {filterStatus === "all"
                  ? "Aucune mission attribuée"
                  : filterStatus === "pending"
                    ? "Aucune mission en cours"
                    : "Aucune mission terminée"}
              </p>
            ) : (
              <div className="space-y-4">
                {missionsBySociete.map(({ societe, exercices }) => {
                  const isExpanded = expandedSocietes.has(societe.id);
                  const totalMissions = exercices.flatMap((e) => e.missions);
                  const completedCount = totalMissions.filter((m: Mission) => m.terminer).length;

                  return (
                    <div key={societe.id} className="border rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleSociete(societe.id)}
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Building2 className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">{societe.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">
                            {completedCount}/{totalMissions.length} terminées
                          </Badge>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div>
                          {exercices.map(({ exercice, missions: exerciceMissions }) => (
                            <div key={exercice.id}>
                              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-t border-b text-sm font-medium text-blue-800">
                                <Calendar className="h-4 w-4" />
                                Clôture exercice : {formatDate(exercice.dateDeCloture)}
                              </div>
                              <div className="divide-y">
                                {exerciceMissions.map((mission: Mission) => (
                                  <div
                                    key={mission.id}
                                    className="p-4 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                          <button
                                            onClick={() => toggleTerminer(mission)}
                                            className="flex-shrink-0"
                                          >
                                            {mission.terminer ? (
                                              <CheckCircle2 className="h-5 w-5 text-green-600" />
                                            ) : (
                                              <Circle className="h-5 w-5 text-gray-400" />
                                            )}
                                          </button>
                                          <Badge
                                            variant={mission.terminer ? "default" : "outline"}
                                            className={mission.terminer ? "bg-green-100 text-green-800" : ""}
                                          >
                                            {mission.typeMission?.libelle}
                                          </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm ml-8">
                                          <div>
                                            <span className="text-gray-500">A finir avant le:</span>{" "}
                                            <span className="font-medium">
                                              {formatDate(mission.dateEcheance)}
                                            </span>
                                          </div>
                                          {mission.manager && (
                                            <div>
                                              <span className="text-gray-500">Manager:</span>{" "}
                                              <span className="font-medium">
                                                {mission.manager.name}
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </div>

                                      <Button
                                        variant="outline"
                                        size="sm"
                                        asChild
                                      >
                                        <Link href={`/societe/${societe.id}`}>
                                          <ExternalLink className="h-4 w-4 mr-1" />
                                          Voir
                                        </Link>
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
