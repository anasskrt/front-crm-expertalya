/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Edit, Trash2, Tags } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  getAllActivites, 
  createActivite, 
  updateActivite, 
  deleteActivite,
  Activite 
} from "@/lib/api/activite";

const ActiviteManagement = () => {
  const [activites, setActivites] = useState<Activite[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  
  // États pour les dialogs
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // États pour les formulaires
  const [newActiviteName, setNewActiviteName] = useState("");
  const [editingActivite, setEditingActivite] = useState<Activite | null>(null);
  const [editActiviteName, setEditActiviteName] = useState("");
  const [deletingActivite, setDeletingActivite] = useState<Activite | null>(null);
  
  const { toast } = useToast();

  // Charger les activités
  useEffect(() => {
    loadActivites();
  }, []);

  const loadActivites = async () => {
    try {
      setLoading(true);
      const data = await getAllActivites();
      setActivites(data);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les activités.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filtrer les activités
  const filteredActivites = activites.filter((activite) =>
    activite.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Créer une activité
  const handleCreate = async () => {
    if (!newActiviteName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'activité est requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      const newActivite = await createActivite(newActiviteName.trim());
      setActivites((prev) => [...prev, newActivite].sort((a, b) => a.name.localeCompare(b.name)));
      setNewActiviteName("");
      setShowCreateDialog(false);
      toast({
        title: "Activité créée",
        description: `L'activité "${newActivite.name}" a été créée avec succès.`,
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.response?.data?.message || "Erreur lors de la création.",
        variant: "destructive",
      });
    }
  };

  // Ouvrir le dialog d'édition
  const openEditDialog = (activite: Activite) => {
    setEditingActivite(activite);
    setEditActiviteName(activite.name);
    setShowEditDialog(true);
  };

  // Modifier une activité
  const handleEdit = async () => {
    if (!editingActivite || !editActiviteName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de l'activité est requis.",
        variant: "destructive",
      });
      return;
    }

    try {
      const updated = await updateActivite(editingActivite.id, editActiviteName.trim());
      setActivites((prev) =>
        prev
          .map((a) => (a.id === editingActivite.id ? updated : a))
          .sort((a, b) => a.name.localeCompare(b.name))
      );
      setShowEditDialog(false);
      setEditingActivite(null);
      setEditActiviteName("");
      toast({
        title: "Activité modifiée",
        description: `L'activité a été renommée en "${updated.name}".`,
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.response?.data?.message || "Erreur lors de la modification.",
        variant: "destructive",
      });
    }
  };

  // Ouvrir le dialog de suppression
  const openDeleteDialog = (activite: Activite) => {
    setDeletingActivite(activite);
    setShowDeleteDialog(true);
  };

  // Supprimer une activité
  const handleDelete = async () => {
    if (!deletingActivite) return;

    try {
      await deleteActivite(deletingActivite.id);
      setActivites((prev) => prev.filter((a) => a.id !== deletingActivite.id));
      setShowDeleteDialog(false);
      setDeletingActivite(null);
      toast({
        title: "Activité supprimée",
        description: `L'activité "${deletingActivite.name}" a été supprimée.`,
      });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.response?.data?.message || "Erreur lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header avec recherche et bouton d'ajout */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher une activité..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle activité
        </Button>
      </div>

      {/* Liste des activités */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Liste des activités ({filteredActivites.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : filteredActivites.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "Aucune activité trouvée." : "Aucune activité enregistrée."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead>Dernière modification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActivites.map((activite) => (
                  <TableRow key={activite.id}>
                    <TableCell className="font-medium">{activite.name}</TableCell>
                    <TableCell>
                      {new Date(activite.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>
                      {new Date(activite.updatedAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditDialog(activite)}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openDeleteDialog(activite)}
                          title="Supprimer"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle activité</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l&apos;activité</label>
              <Input
                placeholder="Ex: Comptabilité, Audit, Conseil..."
                value={newActiviteName}
                onChange={(e) => setNewActiviteName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreate}>Créer</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewActiviteName("");
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l&apos;activité</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom de l&apos;activité</label>
              <Input
                placeholder="Nom de l'activité"
                value={editActiviteName}
                onChange={(e) => setEditActiviteName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEdit()}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleEdit}>Enregistrer</Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowEditDialog(false);
                  setEditingActivite(null);
                  setEditActiviteName("");
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              Êtes-vous sûr de vouloir supprimer l&apos;activité{" "}
              <span className="font-semibold">&quot;{deletingActivite?.name}&quot;</span> ?
            </p>
            <p className="text-sm text-gray-500">
              Cette action est irréversible. La suppression échouera si des sociétés utilisent encore cette activité.
            </p>
            <div className="flex gap-2 pt-4">
              <Button variant="destructive" onClick={handleDelete}>
                Supprimer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeletingActivite(null);
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActiviteManagement;
