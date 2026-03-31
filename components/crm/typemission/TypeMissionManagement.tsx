"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, Plus, Trash2, ListTodo } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  TypeMissionItem,
  getTypeMissions,
  createTypeMission,
  deleteTypeMission,
} from "@/lib/api/typemission";

const TypeMissionManagement = () => {
  const [typeMissions, setTypeMissions] = useState<TypeMissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [newMissionName, setNewMissionName] = useState("");
  const [deleting, setDeleting] = useState<TypeMissionItem | null>(null);
  const [saving, setSaving] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    loadTypeMissions();
  }, []);

  const loadTypeMissions = async () => {
    try {
      setLoading(true);
      const data = await getTypeMissions();
      setTypeMissions(data);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de charger les types de mission.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTypeMissions = typeMissions.filter((tm) =>
    tm.libelle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreate = async () => {
    if (!newMissionName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom du type de mission est requis.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const created = await createTypeMission(newMissionName.trim().toUpperCase());
      setTypeMissions((prev) => [...prev, created]);
      setNewMissionName("");
      setShowCreateDialog(false);
      toast({
        title: "Type créé",
        description: `Le type "${created.libelle}" a été créé.`,
      });
    } catch (err: unknown) {
      const status = (err as { status?: number })?.status;
      toast({
        title: "Erreur",
        description: status === 409 ? "Ce type de mission existe déjà." : "Erreur lors de la création.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openDeleteDialog = (tm: TypeMissionItem) => {
    setDeleting(tm);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (!deleting) return;

    setSaving(true);
    try {
      await deleteTypeMission(deleting.id);
      setTypeMissions((prev) => prev.filter((tm) => tm.id !== deleting.id));
      setShowDeleteDialog(false);
      setDeleting(null);
      toast({
        title: "Type supprimé",
        description: `Le type "${deleting.libelle}" a été supprimé.`,
      });
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer ce type de mission.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un type de mission..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nouveau type
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ListTodo className="h-5 w-5" />
            Types de mission ({filteredTypeMissions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : filteredTypeMissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? "Aucun type trouvé." : "Aucun type de mission enregistré."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Date de création</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTypeMissions.map((tm) => (
                  <TableRow key={tm.id}>
                    <TableCell className="font-medium">{tm.libelle}</TableCell>
                    <TableCell>
                      {new Date(tm.createdAt).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openDeleteDialog(tm)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog création */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouveau type de mission</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Nom du type</label>
              <Input
                placeholder="Ex: TENUE_COMPTABLE, REVISION..."
                value={newMissionName}
                onChange={(e) => setNewMissionName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <p className="text-xs text-gray-500">
                Le nom sera automatiquement mis en majuscules.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleCreate} disabled={saving}>
                Créer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setNewMissionName("");
                }}
              >
                Annuler
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog suppression */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p>
              Supprimer le type{" "}
              <span className="font-semibold">&quot;{deleting?.libelle}&quot;</span> ?
            </p>
            <p className="text-sm text-gray-500">
              Cette action est irréversible. Les missions existantes liées à ce type ne seront pas supprimées mais resteront orphelines.
            </p>
            <div className="flex gap-2 pt-2">
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                Supprimer
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleting(null);
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

export default TypeMissionManagement;
