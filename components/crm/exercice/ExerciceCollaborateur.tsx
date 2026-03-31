"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
  ChevronRight,
  Building2,
  Users,
  ExternalLink,
  ListTodo,
} from "lucide-react";
import {
  Mission,
  getMissionsByCollaborateur,
} from "@/lib/api/mission";
import { getUserCab } from "@/lib/api/user";
import Link from "next/link";

interface UserOption {
  id: number;
  name: string;
  email: string;
}

export default function MissionCollaborateur() {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserOption[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [expandedSocietes, setExpandedSocietes] = useState<Set<number>>(new Set());

  // Load users on mount
  useEffect(() => {
    async function loadUsers() {
      setLoadingUsers(true);
      try {
        const data = await getUserCab();
        setUsers(data);
      } catch (error) {
        console.error("Erreur chargement utilisateurs:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive",
        });
      } finally {
        setLoadingUsers(false);
      }
    }
    loadUsers();
  }, [toast]);

  // Load missions when user is selected
  useEffect(() => {
    if (!selectedUserId) {
      setMissions([]);
      return;
    }

    async function loadMissions() {
      setLoadingMissions(true);
      try {
        const data = await getMissionsByCollaborateur(selectedUserId!);
        setMissions(data);

        
        // Auto-expand all societes
        const societeIds = new Set<number>();
        data.forEach((m) => {
          if (m.exercice?.societe?.id) {
            societeIds.add(m.exercice.societe.id);
          }
        });
        setExpandedSocietes(societeIds);
      } catch (error) {
        console.error("Erreur chargement missions:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les missions du collaborateur",
          variant: "destructive",
        });
      } finally {
        setLoadingMissions(false);
      }
    }
    loadMissions();
  }, [selectedUserId, toast]);

  // Group missions by société
  const missionsBySociete = useMemo(() => {
    const grouped: Record<number, { societe: { id: number; name: string }; missions: Mission[] }> = {};

    missions.forEach((mission) => {
      const societe = mission.exercice?.societe;
      if (!societe) return;
      
      const societeId = societe.id;
      if (!grouped[societeId]) {
        grouped[societeId] = {
          societe: { id: societeId, name: societe.name },
          missions: [],
        };
      }
      grouped[societeId].missions.push(mission);
    });

    // Sort by société name
    const sortedSocietes = Object.values(grouped).sort((a, b) =>
      a.societe.name.localeCompare(b.societe.name)
    );

    return sortedSocietes;
  }, [missions]);

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

  const selectedUser = users.find((u) => u.id === selectedUserId);

  if (loadingUsers) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Missions par collaborateur
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md">
            <label className="text-sm font-medium mb-2 block">
              Sélectionner un collaborateur
            </label>
            <Select
              value={selectedUserId?.toString() || ""}
              onValueChange={(val) => setSelectedUserId(val ? parseInt(val) : null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choisir un collaborateur..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.name} ({user.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stats & Missions */}
      {selectedUserId && (
        <>
          {loadingMissions ? (
            <Card>
              <CardContent className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Total missions</p>
                        <p className="text-2xl font-bold">{stats.total}</p>
                      </div>
                      <ListTodo className="h-8 w-8 text-blue-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Sociétés</p>
                        <p className="text-2xl font-bold">{stats.societes}</p>
                      </div>
                      <Building2 className="h-8 w-8 text-purple-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">En cours</p>
                        <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
                      </div>
                      <Circle className="h-8 w-8 text-orange-500" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Terminées</p>
                        <p className="text-2xl font-bold text-green-600">{stats.done}</p>
                      </div>
                      <CheckCircle2 className="h-8 w-8 text-green-500" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Missions List */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    Missions de {selectedUser?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {missions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Aucune mission attribuée à ce collaborateur
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {missionsBySociete.map(({ societe, missions: societeMissions }) => {
                        const isExpanded = expandedSocietes.has(societe.id);
                        const completedCount = societeMissions.filter((m) => m.terminer).length;
                        
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
                                  {completedCount}/{societeMissions.length} terminées
                                </Badge>
                                {isExpanded ? (
                                  <ChevronDown className="h-5 w-5" />
                                ) : (
                                  <ChevronRight className="h-5 w-5" />
                                )}
                              </div>
                            </button>

                            {isExpanded && (
                              <div className="divide-y">
                                {societeMissions.map((mission) => (
                                  <div
                                    key={mission.id}
                                    className="p-4 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div className="flex-1 space-y-2">
                                        <div className="flex items-center gap-3">
                                          {mission.terminer ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                          ) : (
                                            <Circle className="h-5 w-5 text-gray-400" />
                                          )}
                                          <Badge
                                            variant={mission.terminer ? "default" : "outline"}
                                            className={mission.terminer ? "bg-green-100 text-green-800" : ""}
                                          >
                                            {mission.typeMission?.libelle}
                                          </Badge>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm ml-8">
                                          <div>
                                            <span className="text-gray-500">Exercice:</span>{" "}
                                            <span className="font-medium">
                                              {mission.exercice?.dateDeCloture
                                                ? formatDate(mission.exercice.dateDeCloture)
                                                : "—"}
                                            </span>
                                          </div>
                                          <div>
                                            <span className="text-gray-500">Clôture mission:</span>{" "}
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
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </>
      )}
    </div>
  );
}
