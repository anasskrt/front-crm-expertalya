/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  CheckCircle,
  Clock,
  Goal
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiGet, apiPatch, apiPost } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { Societe, Tache, TypeTache, UserCabinet, ALL_STATUTS } from '@/data/data'

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

const TacheManagement = () => {
  const [taches, setTaches] = useState<Tache[]>([]);
  const [infoGlobal, setInfoGlobal] = useState<any>([]);
  const { currentUser } = useUser();
  const [role, setRole] = useState(false);
  const [users] = useState<UserCabinet[]>([]);
  const [societes, setSocietes] = useState<Societe[]>([]);
  const [errors] = useState<Record<string, string>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newMission, setNewMission] = useState({
    societeId: "",
    titre: "",
    description: "",
    assigneA: "",
    type: TypeTache.DEMANDE_INFO,
    urgente: false,
    dateEcheance: "",
    dateTache: ""
  });

  const [statusFilters, setStatusFilters] = useState<string[]>(["EN_ATTENTE", "EN_COURS"]);
  const [openCommentFor, setOpenCommentFor] = useState<number>(0);
  const [commentDrafts, setCommentDrafts] = useState<Record<number, string>>({});
  const [commentLoading, setCommentLoading] = useState<Record<number, boolean>>({});
  
  const toggleStatusFilter = (status: string) => {
    setStatusFilters(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const { toast } = useToast();

  useEffect(() => {
    apiGet<number>("/auth/roles").then((data) => {
      if (data == 1) { 
        setRole(true);
      } 
    });
    apiGet<any>("/task", { status: statusFilters.join(",") }).then((data) => {
      setTaches(data.tasks);
      setInfoGlobal(data.counts);
    });
    apiGet<Societe[]>("/societe/short").then((societes) => setSocietes(societes));
  }, []);

  useEffect(() => {
    apiGet<any>("/task", { status: statusFilters.join(",") }).then((data) => {
      setTaches(Array.isArray(data.tasks) ? data.tasks : []);
      setInfoGlobal(data.counts ?? {});
    });
  }, [statusFilters]);


  const handleChangeStatut = async (mission: Tache) => {
    const nextStatusMap: Record<string, string> = {
      EN_ATTENTE: 'EN_COURS',
      EN_COURS: 'TERMINEE',
      TERMINEE: 'TERMINEE', // pas de transition plus loin
      ANNULEE: 'EN_ATTENTE',
      CLIENT: 'CLIENT',
      INPI: 'INPI',
      COLLAB: 'COLLAB',
    };
  
    const nextStatut = nextStatusMap[mission.statut];
  
    // Si on veut terminer la tâche, demander le temps passé
    let tempsPasse: number | undefined;
    if (nextStatut === 'TERMINEE') {
      const input = window.prompt("Combien de minutes avez-vous passées sur cette tâche ?");
      if (!input) return;
  
      const parsed = parseInt(input);
      if (isNaN(parsed) || parsed <= 0) {
        toast({
          title: "Entrée invalide",
          description: "Veuillez entrer un nombre de minutes valide.",
          variant: "destructive"
        });
        return;
      }
      tempsPasse = parsed;
    }
  
    try {
      await apiPatch(`/task/${mission.id}`, {
        statut: nextStatut,
        ...(tempsPasse !== undefined ? { tempsPasse } : {})
      });
  
      toast({
        title: "Statut mis à jour",
        description: `Tâche passée à "${nextStatut}".`,
      });
  
      // Refresh tasks
      const updated = await apiGet<any>("/task", { status: statusFilters.join(",") });
      setTaches(updated.tasks);
      setInfoGlobal(updated.counts);
    } catch (err: any) {
      toast({
        title: "Erreur API",
        description: err?.message || "Erreur lors du changement de statut.",
        variant: "destructive",
      });
    }
  };

  const handleSubmitComment = async (missionId: number) => {
    const commentaire = (commentDrafts[missionId] ?? "").trim();
    if (!commentaire) {
      toast({
        title: "Commentaire vide",
        description: "Écris quelque chose avant de publier.",
        variant: "destructive",
      });
      return;
    }
  
    setCommentLoading((p) => ({ ...p, [missionId]: true }));
    try {
      const newComment = await apiPost<any>(`/commentaire/${missionId}`, { contenu: commentaire });
  
      // 📌 Maj locale: on pousse le nouveau commentaire dans la tâche
      setTaches((prev) =>
        prev.map((m) =>
          m.id === missionId
            ? {
                ...m,
                commentaires: [...(m.commentaires ?? []), newComment],
              }
            : m
        )
      );
  
      // reset du brouillon et refermer l’éditeur
      setCommentDrafts((p) => ({ ...p, [missionId]: "" }));
      setOpenCommentFor(0);
  
      toast({ title: "Commentaire ajouté", description: "Votre commentaire a été publié." });
    } catch (err: any) {
      toast({
        title: "Erreur API",
        description: err?.message || "Impossible d'ajouter le commentaire.",
        variant: "destructive",
      });
    } finally {
      setCommentLoading((p) => ({ ...p, [missionId]: false }));
    }
  };

  const handleSelectStatut = async (mission: Tache, newStatut: string) => {
    if (newStatut === mission.statut) return;
  
    // Si on termine, demander le temps passé
    let tempsPasse: number | undefined;
    if (newStatut === "TERMINEE") {
      const input = window.prompt("Combien de minutes avez-vous passées sur cette tâche ?");
      if (!input) return;
      const parsed = parseInt(input);
      if (isNaN(parsed) || parsed <= 0) {
        toast({
          title: "Entrée invalide",
          description: "Veuillez entrer un nombre de minutes valide.",
          variant: "destructive",
        });
        return;
      }
      tempsPasse = parsed;
    }
  
    try {
      await apiPatch(`/task/${mission.id}`, {
        statut: newStatut,
        ...(tempsPasse !== undefined ? { tempsPasse } : {}),
      });
  
      toast({
        title: "Statut mis à jour",
        description: `Tâche passée à "${getStatusBadge(newStatut).label}".`,
      });
  
      // refresh pour garder counts/tri à jour (on conserve tes filtres)
      const updated = await apiGet<any>("/task", { status: statusFilters.join(",") });
      setTaches(Array.isArray(updated.tasks) ? updated.tasks : []);
      setInfoGlobal(updated.counts ?? {});
    } catch (err: any) {
      toast({
        title: "Erreur API",
        description: err?.message || "Erreur lors du changement de statut.",
        variant: "destructive",
      });
    }
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

  const fmtDateTime = (iso?: string) =>
    iso ? new Date(iso).toLocaleString() : "";
  
  const filteredMissions = taches.sort((a, b) => {
    if (a.statut === b.statut) {
      if(a.dateTache && b.dateTache) {
        return new Date(b.dateTache).getTime() - new Date(a.dateTache).getTime();
      } else if (a.dateEcheance && b.dateEcheance) {
        return new Date(b.dateEcheance).getTime() - new Date(a.dateEcheance).getTime();
      } else {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    }
    return a.statut ? 1 : -1;
  });

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

      <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Goal  className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{infoGlobal.enAttente}</p>
                <p className="text-sm text-gray-600">Tâche en attente</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{infoGlobal.enCours}</p>
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
                <p className="text-2xl font-bold">{infoGlobal.client}</p>
                <p className="text-sm text-gray-600">Tâche en attente client</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{infoGlobal.inpi}</p>
                <p className="text-sm text-gray-600">Tâche en attente inpi</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{infoGlobal.collab}</p>
                <p className="text-sm text-gray-600">Tâche en attente collaborateur</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{infoGlobal.terminee}</p>
                <p className="text-sm text-gray-600">Tâche terminées</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Formulaire de création */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Action</CardTitle>
            <div>
                <div className="flex gap-2 mb-4">
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
              onValueChange={(value) => setNewMission((prev) => ({ ...prev, societeId: value }))}
            >
              <SelectTrigger className={errors.societeId ? "border-destructive" : ""}>
                <SelectValue placeholder="Sélectionner une société" />
              </SelectTrigger>
              <SelectContent>
                {Array.isArray(societes) && societes.map((societe) => (
                  <SelectItem key={societe.id} value={societe.id.toString()}>
                    {societe.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.societeId && <p className="text-sm text-destructive">{errors.societeId}</p>}
            </div>
        
            <div>
            <Label htmlFor="assigneA">Assigné à *</Label>
            {role ? (
              <Select
                value={newMission.assigneA}
                onValueChange={(value) => setNewMission((prev) => ({ ...prev, assigneA: value }))}
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
            {errors.assigneA && <p className="text-sm text-destructive">{errors.assigneA}</p>}
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
              onValueChange={(value) => setNewMission((prev) => ({ ...prev, type: value as TypeTache }))}
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
              onChange={(e) => setNewMission((prev) => ({ ...prev, dateTache: e.target.value }))}
              className={errors.dateTache ? "border-destructive" : ""}
            />
            {errors.dateTache && <p className="text-sm text-destructive">{errors.dateTache}</p>}
            </div>

            <div>
            <Label htmlFor="dateEcheance">Date d’échéance *</Label>
            <Input
              id="dateEcheance"
              type="date"
              value={newMission.dateEcheance}
              onChange={(e) => setNewMission((prev) => ({ ...prev, dateEcheance: e.target.value }))}
              className={errors.dateEcheance ? "border-destructive" : ""}
            />
            {errors.dateEcheance && <p className="text-sm text-destructive">{errors.dateEcheance}</p>}
            </div>
          </div>
        
          <div>
          <Label htmlFor="titre">Titre de la tâche *</Label>
          <Input
            id="titre"
            placeholder="Titre de la tâche"
            value={newMission.titre}
            onChange={(e) => setNewMission((prev) => ({ ...prev, titre: e.target.value }))}
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
            onChange={(e) => setNewMission((prev) => ({ ...prev, description: e.target.value }))}
            className={errors.description ? "border-destructive" : ""}
          />
          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
          </div>

          <div className="flex items-center gap-2 mt-6">
              <Checkbox
                id="urgente"
                checked={newMission.urgente}
                onCheckedChange={(checked) =>
                  setNewMission(prev => ({ ...prev, urgente: !!checked }))
                }
              />
              <Label htmlFor="urgente">Urgente</Label>
            </div>
        
        </CardContent>
        )}
      </Card>

      {/* Liste des missions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
                  
        <h2 className="text-2xl font-bold text-gray-900">
          Tâches ({taches.length})
        </h2>

        </div>
        
        {filteredMissions.map((mission) => {
          return (
            <Card key={mission.id} className="transition-shadow hover:shadow-lg border-l-4 border-blue-500">
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-semibold text-gray-800">{mission.titre}</h3>
                      <div className="min-w-[200px]">
                        <Select
                          value={mission.statut}                      // pré-sélectionné
                          onValueChange={(v) => handleSelectStatut(mission, v)}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Choisir un statut" />
                          </SelectTrigger>
                          <SelectContent>
                            {ALL_STATUTS.map((s) => (
                              <SelectItem key={s} value={s}>
                                {getStatusBadge(s).label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
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
                        <span className="font-medium">Assigné à:</span> VOUS
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
                      onClick={() => handleChangeStatut(mission)}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      {mission.statut === 'EN_COURS' ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setOpenCommentFor((prev) => (prev === mission.id ? 0 : mission.id))
                      }
                      className="hover:bg-gray-50"
                    >
                      Commenter
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
                                {mission.createur?.firstName} {mission.createur?.name}
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

                {openCommentFor === mission.id && (
                  <div className="pt-4 mt-4 border-t">
                    <Label htmlFor={`comment-${mission.id}`} className="mb-2 block">
                      Nouveau commentaire
                    </Label>
                    <Textarea
                      id={`comment-${mission.id}`}
                      placeholder="Écrire un commentaire…"
                      value={commentDrafts[mission.id] ?? ""}
                      onChange={(e) =>
                        setCommentDrafts((prev) => ({ ...prev, [mission.id]: e.target.value }))
                      }
                      className="min-h-[120px] mb-2"
                    />
                      <Button
                        onClick={() => handleSubmitComment(mission.id)}
                        className="w-full"
                      >
                        Ajouter
                      </Button>
                    {/* aucun autre bouton : uniquement la zone de texte comme demandé */}
                  </div>
                )}

              </CardContent>
            </Card>


            
          );
        })}
        
        {taches.length === 0 && (
          <Card className="p-8 text-center">
            <Clock className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Aucune tâche créée
            </h3>
            <p className="text-gray-600 mb-4">
              Créez votre première tâche pour commencer à organiser vos tâches.
            </p>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Créer une tâches
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TacheManagement;