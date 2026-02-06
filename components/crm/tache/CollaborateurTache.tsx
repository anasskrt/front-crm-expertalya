/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash, CheckCircle, Clock, Goal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPost } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { Societe, Tache, TypeTache, UserCabinet } from "@/data/data";

const TYPE_LABELS: Record<TypeTache, string> = {
  [TypeTache.DEMANDE_INFO]: "Demande d'information",
  [TypeTache.FLUX_BANCAIRES]: "Flux bancaires",
  [TypeTache.PAIEMENT_REJETE]: "Paiement rejeté",
  [TypeTache.EXCEPTION_SOCIALE]: "Exception sociale",
  [TypeTache.TVA]: "TVA",
  [TypeTache.REVISION_COMPTABLE]: "Révision comptable",
  [TypeTache.JURIDIQUE]: "Juridique",
  [TypeTache.AUTRE]: "Autre",
};

const TYPE_OPTIONS = Object.values(TypeTache).map((t) => ({
  value: t,
  label: TYPE_LABELS[t] ?? t,
}));

const TacheManagementCollabo = () => {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [infoGlobal, setInfoGlobal] = useState<any>({});
  const { currentUser } = useUser();
  const [role, setRole] = useState(false); // true = manager
  const [users, setUsers] = useState<UserCabinet[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);

  // ⬇️ NOUVEAU : l’utilisateur dont on veut voir les tâches
  const [selectedUserId, setSelectedUserId] = useState<number>(0);

  const [newMission, setNewMission] = useState({
    societeId: "",
    titre: "",
    description: "",
    assigneA: "",
    type: TypeTache.DEMANDE_INFO,
    urgente: false,
    dateEcheance: "",
    dateTache: "",
  });

  const [statusFilters, setStatusFilters] = useState<string[]>(["EN_ATTENTE", "EN_COURS"]);

  const toggleStatusFilter = (status: string) => {
    setStatusFilters((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const { toast } = useToast();

  const validate = () => {
    const e: Record<string, string> = {};

    if (!newMission.societeId) e.societeId = "Obligatoire";
    if (role && !newMission.assigneA) e.assigneA = "Obligatoire";
    if (!newMission.type) e.type = "Obligatoire";
    if (!newMission.dateTache) e.dateTache = "Obligatoire";
    if (!newMission.dateEcheance) e.dateEcheance = "Obligatoire";
    if (!newMission.titre.trim()) e.titre = "Obligatoire";
    if (!newMission.description.trim()) e.description = "Obligatoire";

    if (newMission.dateTache && newMission.dateEcheance) {
      const d1 = new Date(newMission.dateTache).getTime();
      const d2 = new Date(newMission.dateEcheance).getTime();
      if (d2 < d1) e.dateEcheance = "Doit être ≥ à la date de début";
    }

    return e;
  };

  const handleCreateMission = async () => {
    const v = validate();

    if (Object.keys(v).length > 0) {
      setErrors(v);
      toast({
        title: "Formulaire incomplet",
        description: "Corrigez les champs en rouge.",
        variant: "destructive",
      });
      return;
    }

    setErrors({});

    try {
      // Déterminer l'userId pour l'assignation et le refresh
      const assignedUserId = role 
        ? parseInt(newMission.assigneA) 
        : currentUser?.id;

      await apiPost("/task", {
        titre: newMission.titre,
        description: newMission.description,
        type: newMission.type,
        urgente: newMission.urgente,
        dateEcheance: newMission.dateEcheance ? new Date(newMission.dateEcheance) : undefined,
        dateTache: newMission.dateTache ? new Date(newMission.dateTache) : undefined,
        societeId: parseInt(newMission.societeId),
        assignedTo: assignedUserId,
        statut: "EN_ATTENTE",
      });
      
      // Rafraîchir les tâches seulement si on a un userId valide
      const userIdToFetch = selectedUserId || currentUser?.id;
      if (userIdToFetch) {
        const data = await apiGet<any>(`/task/collaborateur/${userIdToFetch}`, { statuts: statusFilters.join(",") });
        setTaches(Array.isArray(data.tasks) ? data.tasks : []);
        setInfoGlobal(data.counts ?? {});
      }

      setNewMission({
        societeId: "",
        titre: "",
        description: "",
        assigneA: "",
        type: TypeTache.DEMANDE_INFO,
        urgente: false,
        dateEcheance: "",
        dateTache: "",
      });
      setIsCreating(false);
      toast({
        title: "Tâche créée",
        description: "La nouvelle tâche a été créée avec succès.",
      });
    } catch (err: any) {
      toast({
        title: "Erreur API",
        description: err?.response?.data?.message || "Erreur lors de la création de la tâche.",
        variant: "destructive",
      });
    }
  };

  // ————— INIT : rôle, liste users, sociétés, user sélectionné par défaut —————
  useEffect(() => {
    // Attendre que currentUser soit chargé
    if (!currentUser) return;

    (async () => {
      try {
        // Utiliser currentUser.role au lieu de getRoles()
        if (currentUser.role == 1) {
          setRole(true);
          const us = await apiGet<UserCabinet[]>("/user/cabinet");
          setUsers(us || []);
        } else {
          // Si collaborateur, on fixe son ID directement
          if (currentUser.id) setSelectedUserId(currentUser.id);
        }
      } finally {
        apiGet<Societe[]>("/societe/nom-id").then((socs) => setSocietes(socs || []));
      }
    })();
  }, [currentUser]);

  // ————— Chargement des tâches en fonction des filtres + utilisateur —————
  useEffect(() => {
    if (!selectedUserId) return; // pas d’utilisateur => pas d’appel
  
    apiGet<any>(`/task/collaborateur/${selectedUserId}`, { statuts: statusFilters.join(",") })
      .then((data) => {
        setTaches(Array.isArray(data.tasks) ? data.tasks : []);
        setInfoGlobal(data.counts ?? {});
      })
      .catch(() =>
        toast({
          title: "Erreur",
          description: "Impossible de charger les tâches.",
          variant: "destructive",
        })
      );
  }, [statusFilters, selectedUserId]);

  const deleteMission = (missionId: number) => {
    setTaches((prev) => prev.filter((m) => m.id !== missionId));
    toast({
      title: "Tâche supprimée",
      description: "La tâche a été supprimée avec succès.",
    });
  };


  const getStatusBadge = (statut: string) => {
    switch (statut) {
      case "EN_ATTENTE":
        return { label: "En attente", color: "bg-yellow-100 text-yellow-800" };
      case "EN_COURS":
        return { label: "En cours", color: "bg-blue-100 text-blue-800" };
      case "TERMINEE":
        return { label: "Terminée", color: "bg-green-100 text-green-800" };
      case "ANNULEE":
        return { label: "Annulée", color: "bg-red-100 text-red-800" };
      case "CLIENT":
        return { label: "En attente client", color: "bg-red-100 text-red-800" };
      case "INPI":
        return { label: "En attente INPI", color: "bg-red-100 text-red-800" };
      case "COLLAB":
        return { label: "En attente Collab ", color: "bg-red-100 text-red-800" };
      default:
        return { label: "Inconnu", color: "bg-gray-100 text-gray-800" };
    }
  };

  const filteredMissions = useMemo(() => {
    const sorted = [...taches].sort((a, b) => {
      if (a.statut === b.statut) {
        if (a.dateTache && b.dateTache) {
          return new Date(b.dateTache).getTime() - new Date(a.dateTache).getTime();
        } else if (a.dateEcheance && b.dateEcheance) {
          return new Date(b.dateEcheance).getTime() - new Date(a.dateEcheance).getTime();
        } else {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      }
      // garde EN_ATTENTE/EN_COURS en tête
      const order: Record<string, number> = { EN_ATTENTE: 0, EN_COURS: 1, TERMINEE: 2, ANNULEE: 3 };
      return (order[a.statut] ?? 99) - (order[b.statut] ?? 99);
    });

    return sorted;
  }, [taches]);

  const fmtDateTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "";

  const selectedUser = useMemo(
    () => (selectedUserId ? users.find((u) => u.id === selectedUserId) : null),
    [users, selectedUserId]
  );

  {role && selectedUserId === 0 && (
    <Card className="p-8 text-center">
      <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Sélectionnez un utilisateur
      </h3>
      <p className="text-gray-600">
        Choisissez un collaborateur dans la liste pour afficher ses tâches.
      </p>
    </Card>
  )}
  
  return (
    
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Goal className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{users.length ?? 0}</p>
                <p className="text-sm text-gray-600">Nombres de collaborateurs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{infoGlobal.enCours ?? 0}</p>
                <p className="text-sm text-gray-600">Tâche en cours</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
              <p className="text-2xl font-bold">
                {Number(infoGlobal?.client ?? 0)
                + Number(infoGlobal?.inpi ?? 0)
                + Number(infoGlobal?.collab ?? 0)
                + Number(infoGlobal?.enAttente ?? 0)}
              </p>                
              <p className="text-sm text-gray-600">Tâche en attente</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* En-tête : filtres + sélecteur utilisateur */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
            <CardTitle>Filtres :</CardTitle>

            <div className="flex flex-col md:flex-row gap-3 md:items-center">
              {/* Filtres statut */}
              <div className="flex gap-2">
                {["EN_ATTENTE", "EN_COURS", "CLIENT", "INPI", "COLLAB","TERMINEE"].map((status) => (
                  <Button
                    key={status}
                    variant={statusFilters.includes(status) ? "default" : "outline"}
                    onClick={() => toggleStatusFilter(status)}
                  >
                    {getStatusBadge(status).label}
                  </Button>
                ))}
              </div>

              {/* ⬇️ NOUVEAU : Select utilisateur (manager seulement) */}
              {role && (
                <div className="min-w-[240px]">
                  <Label className="sr-only">Utilisateur</Label>
                  <Select
                    value={selectedUserId ? String(selectedUserId) : undefined}
                    onValueChange={(v) => setSelectedUserId(Number(v))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Option “moi” en premier si présent dans la liste */}
                      <SelectItem value={String(null)}>  </SelectItem>

                      {users.map((u) => (
                        <SelectItem key={u.id} value={String(u.id)}>
                          {u.firstName} {u.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Boutons création */}
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    if (!isCreating) {
                      const data = await apiGet<Societe[]>("/societe/nom-id");
                      setSocietes(data || []);
                    }
                    setIsCreating((p) => !p);
                  }}
                  variant={isCreating ? "outline" : "default"}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {isCreating ? "Annuler" : "Nouvelle Tâche"}
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        {isCreating && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="societe">Société *</Label>
                <Select
                  value={newMission.societeId}
                  onValueChange={(value) =>
                    setNewMission((prev) => ({ ...prev, societeId: value }))
                  }
                >
                  <SelectTrigger className={errors.societeId ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner une société" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.isArray(societes) &&
                      societes.map((societe) => (
                        <SelectItem key={societe.id} value={societe.id.toString()}>
                          {societe.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.societeId && (
                  <p className="text-sm text-destructive">{errors.societeId}</p>
                )}
              </div>

              <div>
                <Label htmlFor="assigneA">Assigné à *</Label>
                {role ? (
                  <Select
                    value={newMission.assigneA}
                    onValueChange={(value) =>
                      setNewMission((prev) => ({ ...prev, assigneA: value }))
                    }
                  >
                    <SelectTrigger className={errors.assigneA ? "border-destructive" : ""}>
                      <SelectValue placeholder="Sélectionner un utilisateur" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id.toString()}>
                          {user.firstName} {user.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="assigneA" value={currentUser ? `Vous` : ""} disabled />
                )}
                {errors.assigneA && (
                  <p className="text-sm text-destructive">{errors.assigneA}</p>
                )}
              </div>

              <div>
                <Label>Statut</Label>
                <div className="bg-yellow-100 text-yellow-800 rounded px-3 py-2 text-sm font-medium mt-1">
                  En attente (défaut)
                </div>
              </div>

              <div>
                <Label htmlFor="type">Type de tâche *</Label>
                <Select
                  value={newMission.type}
                  onValueChange={(value) =>
                    setNewMission((prev) => ({ ...prev, type: value as TypeTache }))
                  }
                >
                  <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                    <SelectValue placeholder="Sélectionner un type de tâche" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
              </div>

              <div>
                <Label htmlFor="dateTache">Date de début *</Label>
                <Input
                  id="dateTache"
                  type="date"
                  value={newMission.dateTache}
                  onChange={(e) =>
                    setNewMission((prev) => ({ ...prev, dateTache: e.target.value }))
                  }
                  className={errors.dateTache ? "border-destructive" : ""}
                />
                {errors.dateTache && (
                  <p className="text-sm text-destructive">{errors.dateTache}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dateEcheance">Date d’échéance *</Label>
                <Input
                  id="dateEcheance"
                  type="date"
                  value={newMission.dateEcheance}
                  onChange={(e) =>
                    setNewMission((prev) => ({ ...prev, dateEcheance: e.target.value }))
                  }
                  className={errors.dateEcheance ? "border-destructive" : ""}
                />
                {errors.dateEcheance && (
                  <p className="text-sm text-destructive">{errors.dateEcheance}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="titre">Titre de la tâche *</Label>
              <Input
                id="titre"
                placeholder="Titre de la tâche"
                value={newMission.titre}
                onChange={(e) =>
                  setNewMission((prev) => ({ ...prev, titre: e.target.value }))
                }
                className={errors.titre ? "border-destructive" : ""}
              />
              {errors.titre && <p className="text-sm text-destructive">{errors.titre}</p>}
            </div>

            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Détails de la tâche"
                value={newMission.description}
                onChange={(e) =>
                  setNewMission((prev) => ({ ...prev, description: e.target.value }))
                }
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-2">
              <Checkbox
                id="urgente"
                checked={newMission.urgente}
                onCheckedChange={(checked) =>
                  setNewMission((prev) => ({ ...prev, urgente: !!checked }))
                }
              />
              <Label htmlFor="urgente">Urgente</Label>
            </div>

            <Button onClick={handleCreateMission} className="w-full">
              Créer la Tâche
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Liste des missions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Tâches ({taches.length})</h2>
        </div>

        {filteredMissions.map((mission) => {
          const status = getStatusBadge(mission.statut);
          return (
            <Card key={mission.id} className="transition-shadow hover:shadow-lg border-l-4 border-blue-500">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-800">{mission.titre}</h3>
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
                        <span className="font-medium">Date tâche:</span>{" "}
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
                        <span className="font-medium">Société:</span>{" "}
                        {mission.societe?.name ?? "-"}
                      </div>
                      <div>
                        <span className="font-medium">Assigné à:</span>{" "}
                        {role
                          ? selectedUser
                            ? `${selectedUser.firstName} ${selectedUser.name}`
                            : "—"
                          : "Vous"}
                      </div>
                      <div>
                        <span className="font-medium">Créé par:</span>{" "}
                        {mission.createur?.name} {mission.createur?.firstName}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4 mt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteMission(mission.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Commentaires</span>
                        <Badge variant="outline">
                          {Array.isArray(mission.commentaires) ? mission.commentaires.length : 0}
                        </Badge>
                      </div>
                    </div>

                    {!mission.commentaires || mission.commentaires.length === 0 ? (
                      <p className="text-sm text-gray-500">Aucun commentaire.</p>
                    ) : (
                      <ul className="space-y-3">
                        {mission.commentaires.map((c) => (
                          <li key={c.id} className="rounded-md border p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">
                                {mission.createur?.name} {mission.createur?.firstName}
                              </span>
                              <span className="text-xs text-gray-500">
                                {fmtDateTime(c.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">
                              {c.commentaire}
                            </p>
                          </li>
                        ))}
                      </ul>
                    )}
                </div>

              </CardContent>
            </Card>
          );
        })}

        {taches.length === 0 && (
          <Card className="p-8 text-center">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune tâche</h3>
            <p className="text-gray-600 mb-4">
              Sélectionne un utilisateur (si manager) ou crée ta première tâche.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une tâche
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TacheManagementCollabo;
