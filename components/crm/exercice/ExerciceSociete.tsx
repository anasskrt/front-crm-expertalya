"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Calendar,
  User,
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  Loader2,
  ChevronDown,
  ChevronRight,
  FolderOpen,
  ListTodo,
} from "lucide-react";
import {
  Exercice,
  StatutExercice,
  STATUT_EXERCICE_LABELS,
  getExercicesBySociete,
  createExercice,
  updateExercice,
  deleteExercice,
  CreateExerciceDto,
  UpdateExerciceDto,
} from "@/lib/api/exercice";
import {
  Mission,
  createMission,
  updateMission,
  deleteMission,
  toggleMissionTerminer as apiToggleMissionTerminer,
  CreateMissionDto,
  UpdateMissionDto,
} from "@/lib/api/mission";
import { TypeMissionItem, getTypeMissions } from "@/lib/api/typemission";
import { getUserCab } from "@/lib/api/user";
import { useUser } from "@/context/UserContext";

interface ExerciceSocieteProps {
  societeId: number;
}

interface UserOption {
  id: number;
  name: string;
  email: string;
}

export default function ExerciceSociete({ societeId }: ExerciceSocieteProps) {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 1;
  
  const [exercices, setExercices] = useState<Exercice[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [typeMissions, setTypeMissions] = useState<TypeMissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Modal states
  const [isCreateExerciceOpen, setIsCreateExerciceOpen] = useState(false);
  const [isEditExerciceOpen, setIsEditExerciceOpen] = useState(false);
  const [isCreateMissionOpen, setIsCreateMissionOpen] = useState(false);
  const [isEditMissionOpen, setIsEditMissionOpen] = useState(false);
  
  const [selectedExercice, setSelectedExercice] = useState<Exercice | null>(null);
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);
  
  // Expanded exercices
  const [expandedExercices, setExpandedExercices] = useState<Set<number>>(new Set());
  
  // Form state pour Exercice
  const [exerciceForm, setExerciceForm] = useState({
    dateDeCloture: "",
    dateMiseEnCloture: "",
    statut: StatutExercice.EN_COURS,
  });
  
  // Form state pour Mission
  const [missionForm, setMissionForm] = useState({
    exerciceId: 0,
    typeMissionId: 0,
    dateEcheance: "",
    collaborateurId: 0,
    managerId: 0,
    terminer: false,
  });

  // Load exercices and users
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [exercicesData, usersData, typeMissionsData] = await Promise.all([
          getExercicesBySociete(societeId),
          getUserCab(),
          getTypeMissions(),
        ]);
        setExercices(exercicesData);
        setUsers(usersData);
        setTypeMissions(typeMissionsData);

        console.log("Exercices chargés:", exercicesData);
        // Auto-expand first exercice if any
        if (exercicesData.length > 0) {
          setExpandedExercices(new Set([exercicesData[0].id]));
        }
      } catch (error) {
        console.error("Erreur chargement:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les exercices",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [societeId, toast]);

  // Sort exercices by dateCloture (descending)
  const sortedExercices = useMemo(() => {
    return [...exercices].sort((a, b) => {
      const dateA = new Date(a.dateDeCloture).getTime();
      const dateB = new Date(b.dateDeCloture).getTime();
      return dateB - dateA;
    });
  }, [exercices]);

  const toggleExercice = (id: number) => {
    setExpandedExercices((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const resetExerciceForm = () => {
    const today = new Date();
    const endOfYear = new Date(today.getFullYear(), 11, 31);
    setExerciceForm({
      dateDeCloture: endOfYear.toISOString().slice(0, 10),
      dateMiseEnCloture: "",
      statut: StatutExercice.EN_COURS,
    });
  };

  const resetMissionForm = () => {
    setMissionForm({
      exerciceId: 0,
      typeMissionId: typeMissions[0]?.id || 0,
      dateEcheance: "",
      collaborateurId: users[0]?.id || 0,
      managerId: users[0]?.id || 0,
      terminer: false,
    });
  };

  // ========== EXERCICE HANDLERS ==========
  
  const openCreateExerciceModal = () => {
    resetExerciceForm();
    setIsCreateExerciceOpen(true);
  };

  const openEditExerciceModal = (exercice: Exercice) => {
    setSelectedExercice(exercice);
    setExerciceForm({
      dateDeCloture: exercice.dateDeCloture.slice(0, 10),
      dateMiseEnCloture: exercice.dateMiseEnCloture ? exercice.dateMiseEnCloture.slice(0, 10) : "",
      statut: exercice.statut,
    });
    setIsEditExerciceOpen(true);
  };

  const handleCreateExercice = async () => {
    if (!exerciceForm.dateDeCloture) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir une date de clôture",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const dto: CreateExerciceDto = {
        societeId,
        dateDeCloture: exerciceForm.dateDeCloture,
        dateMiseEnCloture: exerciceForm.dateMiseEnCloture || undefined,
        statut: exerciceForm.statut,
      };

      const newExercice = await createExercice(dto);
      setExercices((prev) => [...prev, newExercice]);
      setExpandedExercices((prev) => new Set([...prev, newExercice.id]));
      setIsCreateExerciceOpen(false);
      toast({
        title: "Succès",
        description: "Exercice créé avec ses 9 missions",
      });
    } catch (error) {
      console.error("Erreur création:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'exercice",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateExercice = async () => {
    if (!selectedExercice) return;

    setSaving(true);
    try {
      const dto: UpdateExerciceDto = {
        dateDeCloture: exerciceForm.dateDeCloture || undefined,
        dateMiseEnCloture: exerciceForm.dateMiseEnCloture || undefined,
        statut: exerciceForm.statut,
      };

      const updated = await updateExercice(selectedExercice.id, dto);
      setExercices((prev) =>
        prev.map((ex) => (ex.id === updated.id ? updated : ex))
      );
      setIsEditExerciceOpen(false);
      setSelectedExercice(null);
      toast({
        title: "Succès",
        description: "Exercice mis à jour",
      });
    } catch (error) {
      console.error("Erreur mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'exercice",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExercice = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet exercice et toutes ses missions ?")) return;

    try {
      await deleteExercice(id);
      setExercices((prev) => prev.filter((ex) => ex.id !== id));
      toast({
        title: "Succès",
        description: "Exercice supprimé",
      });
    } catch (error) {
      console.error("Erreur suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'exercice",
        variant: "destructive",
      });
    }
  };

  // ========== MISSION HANDLERS ==========

  const openCreateMissionModal = (exercice: Exercice) => {
    setSelectedExercice(exercice);
    resetMissionForm();
    setIsCreateMissionOpen(true);
  };

  const openEditMissionModal = (mission: Mission, exercice: Exercice) => {
    setSelectedExercice(exercice);
    setSelectedMission(mission);
    setMissionForm({
      exerciceId: mission.exerciceId,
      typeMissionId: mission.typeMissionId,
      dateEcheance: mission.dateEcheance ? mission.dateEcheance.slice(0, 10) : "",
      collaborateurId: mission.collaborateurId || 0,
      managerId: mission.managerId || 0,
      terminer: mission.terminer,
    });
    setIsEditMissionOpen(true);
  };

  const handleCreateMission = async () => {
    if (!selectedExercice) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un exercice",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const dto: CreateMissionDto = {
        exerciceId: selectedExercice.id,
        typeMissionId: missionForm.typeMissionId,
        dateEcheance: missionForm.dateEcheance || undefined,
        terminer: missionForm.terminer,
        collaborateurId: missionForm.collaborateurId || undefined,
        managerId: missionForm.managerId || undefined,
      };

      const newMission = await createMission(dto);
      
      // Update local state
      setExercices((prev) =>
        prev.map((ex) =>
          ex.id === selectedExercice.id
            ? { ...ex, missions: [...(ex.missions || []), newMission] }
            : ex
        )
      );
      
      setIsCreateMissionOpen(false);
      setSelectedExercice(null);
      toast({
        title: "Succès",
        description: "Mission créée",
      });
    } catch (error) {
      console.error("Erreur création mission:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la mission",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateMission = async () => {
    if (!selectedMission || !selectedExercice) return;

    setSaving(true);
    try {
      const dto: UpdateMissionDto = {
        dateEcheance: missionForm.dateEcheance || undefined,
        terminer: missionForm.terminer,
        collaborateurId: missionForm.collaborateurId || undefined,
        managerId: missionForm.managerId || undefined,
      };

      const updated = await updateMission(selectedMission.id, dto);
      
      // Update local state
      setExercices((prev) =>
        prev.map((ex) =>
          ex.id === selectedExercice.id
            ? {
                ...ex,
                missions: ex.missions.map((m) =>
                  m.id === updated.id ? updated : m
                ),
              }
            : ex
        )
      );
      
      setIsEditMissionOpen(false);
      setSelectedMission(null);
      setSelectedExercice(null);
      toast({
        title: "Succès",
        description: "Mission mise à jour",
      });
    } catch (error) {
      console.error("Erreur mise à jour mission:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la mission",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMission = async (missionId: number, exerciceId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette mission ?")) return;

    try {
      await deleteMission(missionId);
      setExercices((prev) =>
        prev.map((ex) =>
          ex.id === exerciceId
            ? { ...ex, missions: ex.missions.filter((m) => m.id !== missionId) }
            : ex
        )
      );
      toast({
        title: "Succès",
        description: "Mission supprimée",
      });
    } catch (error) {
      console.error("Erreur suppression mission:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la mission",
        variant: "destructive",
      });
    }
  };

  const toggleMissionTerminer = async (mission: Mission, exerciceId: number) => {
    try {
      const updated = await apiToggleMissionTerminer(mission.id, !mission.terminer);
      setExercices((prev) =>
        prev.map((ex) =>
          ex.id === exerciceId
            ? {
                ...ex,
                missions: ex.missions.map((m) =>
                  m.id === updated.id ? updated : m
                ),
              }
            : ex
        )
      );
      toast({
        title: "Succès",
        description: mission.terminer
          ? "Mission marquée comme non terminée"
          : "Mission marquée comme terminée",
      });
    } catch (error: unknown) {
      console.error("Erreur:", error);
      // Gérer les erreurs 403 (pas les droits)
      const errorMessage = error instanceof Error && error.message.includes("403")
        ? "Vous ne pouvez valider que les missions qui vous sont attribuées"
        : "Impossible de mettre à jour la mission";
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("fr-FR");
  };

  const getUserName = (userId: number) => {
    const user = users.find((u) => u.id === userId);
    return user?.name || `User #${userId}`;
  };

  const getMissionsStats = (missions: Mission[]) => {
    const total = missions.length;
    const completed = missions.filter((m) => m.terminer).length;
    return { total, completed };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Exercices & Missions
        </CardTitle>
        {isAdmin && (
          <Button onClick={openCreateExerciceModal} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Nouvel exercice
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {exercices.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Aucun exercice pour cette société
          </p>
        ) : (
          <div className="space-y-4">
            {sortedExercices.map((exercice) => {
              const stats = getMissionsStats(exercice.missions || []);
              const isExpanded = expandedExercices.has(exercice.id);
              
              return (
                <Collapsible
                  key={exercice.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExercice(exercice.id)}
                >
                  <div className="border rounded-lg overflow-hidden">
                    <CollapsibleTrigger asChild>
                      <button className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-5 w-5 text-blue-600" />
                          <span className="font-semibold">
                            Clôture: {formatDate(exercice.dateDeCloture)}
                          </span>
                          <Badge
                            variant={exercice.statut === StatutExercice.TERMINE ? "default" : "outline"}
                            className={
                              exercice.statut === StatutExercice.TERMINE
                                ? "bg-green-100 text-green-800"
                                : ""
                            }
                          >
                            {STATUT_EXERCICE_LABELS[exercice.statut]}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge variant="secondary">
                            {stats.completed}/{stats.total} missions
                          </Badge>
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    
                    <CollapsibleContent>
                      <div className="border-t">
                        {/* Exercice details */}
                        <div className="px-4 py-3 bg-blue-50 flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            {exercice.dateMiseEnCloture && (
                              <div>
                                <span className="text-gray-500">Fini le:</span>{" "}
                                <span className="font-medium">
                                  {formatDate(exercice.dateMiseEnCloture)}
                                </span>
                              </div>
                            )}
                          </div>
                          {isAdmin && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openCreateMissionModal(exercice);
                                }}
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Mission
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditExerciceModal(exercice);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteExercice(exercice.id);
                                }}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                        
                        {/* Missions list */}
                        <div className="divide-y">
                          {(!exercice.missions || exercice.missions.length === 0) ? (
                            <p className="px-4 py-6 text-gray-500 text-center">
                              Aucune mission pour cet exercice
                            </p>
                          ) : (
                            exercice.missions.map((mission) => {
                              const canEdit = isAdmin || currentUser?.id === mission.collaborateurId;
                              return (
                              <div
                                key={mission.id}
                                className="px-4 py-3 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                      {canEdit ? (
                                        <button
                                          onClick={() =>
                                            toggleMissionTerminer(mission, exercice.id)
                                          }
                                          className="flex-shrink-0"
                                        >
                                          {mission.terminer ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                          ) : (
                                            <Circle className="h-5 w-5 text-gray-400" />
                                          )}
                                        </button>
                                      ) : (
                                        <span className="flex-shrink-0">
                                          {mission.terminer ? (
                                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                                          ) : (
                                            <Circle className="h-5 w-5 text-gray-400" />
                                          )}
                                        </span>
                                      )}
                                      <ListTodo className="h-4 w-4 text-gray-400" />
                                      <Badge
                                        variant={mission.terminer ? "default" : "outline"}
                                        className={
                                          mission.terminer
                                            ? "bg-green-100 text-green-800"
                                            : ""
                                        }
                                      >
                                        {mission.typeMission?.libelle}
                                      </Badge>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm ml-8">
                                      <div>
                                        <span className="text-gray-500">Date d'échéance:</span>{" "}
                                        <span className="font-medium">
                                          {formatDate(mission.dateEcheance)}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <User className="h-4 w-4 text-gray-400" />
                                        <span className="text-gray-500">Collab:</span>{" "}
                                        <span className="font-medium">
                                          {mission.collaborateur?.name ||
                                            (mission.collaborateurId ? getUserName(mission.collaborateurId) : "—")}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <User className="h-4 w-4 text-blue-400" />
                                        <span className="text-gray-500">Manager:</span>{" "}
                                        <span className="font-medium">
                                          {mission.manager?.name ||
                                            (mission.managerId ? getUserName(mission.managerId) : "—")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {isAdmin && (
                                    <div className="flex items-center gap-2 ml-4">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          openEditMissionModal(mission, exercice)
                                        }
                                      >
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          handleDeleteMission(mission.id, exercice.id)
                                        }
                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            );})
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Create Exercice Modal */}
      <Dialog open={isCreateExerciceOpen} onOpenChange={setIsCreateExerciceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvel exercice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Un exercice représente une période comptable. Les 9 missions
              seront créées automatiquement.
            </p>
            
            <div>
              <label className="text-sm font-medium">Date de clôture *</label>
              <Input
                type="date"
                value={exerciceForm.dateDeCloture}
                onChange={(e) =>
                  setExerciceForm((prev) => ({
                    ...prev,
                    dateDeCloture: e.target.value,
                  }))
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Fini le :</label>
              <Input
                type="date"
                value={exerciceForm.dateMiseEnCloture}
                onChange={(e) =>
                  setExerciceForm((prev) => ({
                    ...prev,
                    dateMiseEnCloture: e.target.value,
                  }))
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select
                value={exerciceForm.statut}
                onValueChange={(val) =>
                  setExerciceForm((prev) => ({
                    ...prev,
                    statut: val as StatutExercice,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUT_EXERCICE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateExerciceOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateExercice} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Exercice Modal */}
      <Dialog open={isEditExerciceOpen} onOpenChange={setIsEditExerciceOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l&apos;exercice</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Date de clôture</label>
              <Input
                type="date"
                value={exerciceForm.dateDeCloture}
                onChange={(e) =>
                  setExerciceForm((prev) => ({
                    ...prev,
                    dateDeCloture: e.target.value,
                  }))
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Fini le :</label>
              <Input
                type="date"
                value={exerciceForm.dateMiseEnCloture}
                onChange={(e) =>
                  setExerciceForm((prev) => ({
                    ...prev,
                    dateMiseEnCloture: e.target.value,
                  }))
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Statut</label>
              <Select
                value={exerciceForm.statut}
                onValueChange={(val) =>
                  setExerciceForm((prev) => ({
                    ...prev,
                    statut: val as StatutExercice,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STATUT_EXERCICE_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditExerciceOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateExercice} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Mission Modal */}
      <Dialog open={isCreateMissionOpen} onOpenChange={setIsCreateMissionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouvelle mission t</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type de mission</label>
              <Select
                value={missionForm.typeMissionId.toString()}
                onValueChange={(val) =>
                  setMissionForm((prev) => ({
                    ...prev,
                    typeMissionId: parseInt(val),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeMissions.map((tm) => (
                    <SelectItem key={tm.id} value={tm.id.toString()}>
                      {tm.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">A finir avant le : </label>
              <Input
                type="date"
                value={missionForm.dateEcheance}
                onChange={(e) =>
                  setMissionForm((prev) => ({
                    ...prev,
                    dateEcheance: e.target.value,
                  }))
                }
              />
            </div>

            <div>
              <label className="text-sm font-medium">Collaborateur</label>
              <Select
                value={missionForm.collaborateurId.toString()}
                onValueChange={(val) =>
                  setMissionForm((prev) => ({
                    ...prev,
                    collaborateurId: parseInt(val),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un collaborateur" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Manager</label>
              <Select
                value={missionForm.managerId.toString()}
                onValueChange={(val) =>
                  setMissionForm((prev) => ({
                    ...prev,
                    managerId: parseInt(val),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un manager" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateMissionOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleCreateMission} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mission Modal */}
      <Dialog open={isEditMissionOpen} onOpenChange={setIsEditMissionOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la mission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type de mission</label>
              <Select
                value={missionForm.typeMissionId.toString()}
                disabled
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeMissions.map((tm) => (
                    <SelectItem key={tm.id} value={tm.id.toString()}>
                      {tm.libelle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Date d'échéance</label>
              <Input
                type="date"
                value={missionForm.dateEcheance}
                onChange={(e) =>
                  setMissionForm((prev) => ({
                    ...prev,
                    dateEcheance: e.target.value,
                  }))
                }
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Collaborateur</label>
              <Select
                value={missionForm.collaborateurId.toString()}
                onValueChange={(val) =>
                  setMissionForm((prev) => ({
                    ...prev,
                    collaborateurId: parseInt(val),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un collaborateur" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Manager</label>
              <Select
                value={missionForm.managerId.toString()}
                onValueChange={(val) =>
                  setMissionForm((prev) => ({
                    ...prev,
                    managerId: parseInt(val),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un manager" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditMissionOpen(false)}
            >
              Annuler
            </Button>
            <Button onClick={handleUpdateMission} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
