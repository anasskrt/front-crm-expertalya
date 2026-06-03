"use client";

import { useState, useEffect } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Pencil, Euro } from "lucide-react";
import {
  Tarif,
  CreateTarifDto,
  getTarifsBySociete,
  createTarif,
  updateTarifCommentaire,
  deleteTarif,
} from "@/lib/api/tarif";
import { useUser } from "@/context/UserContext";

interface TarifSocieteProps {
  societeId: number;
}

const EMPTY_FORM: Omit<CreateTarifDto, "societeId"> = {
  compta: 0,
  sociale: 0,
  exceptionnel: 0,
  autre: 0,
  dateDebut: "",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("fr-FR");
}

export default function TarifSociete({ societeId }: TarifSocieteProps) {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 1;

  const [tarifs, setTarifs] = useState<Tarif[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Création
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});

  // Édition commentaire
  const [editingCommentaire, setEditingCommentaire] = useState<Tarif | null>(null);
  const [commentaireDraft, setCommentaireDraft] = useState("");
  const [savingCommentaire, setSavingCommentaire] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTarifsBySociete(societeId)
      .then(setTarifs)
      .catch(() =>
        toast({ title: "Erreur", description: "Impossible de charger les tarifs", variant: "destructive" })
      )
      .finally(() => setLoading(false));
  }, [societeId, toast]);

  const tarifActif = tarifs.find((t) => t.actif);
  const historique = tarifs.filter((t) => !t.actif);

  // --- Création ---
  const validateForm = () => {
    const errors: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
    if (!form.dateDebut) errors.dateDebut = "Obligatoire";
    if (form.compta < 0) errors.compta = "≥ 0";
    if (form.sociale < 0) errors.sociale = "≥ 0";
    if (form.exceptionnel < 0) errors.exceptionnel = "≥ 0";
    if (form.autre < 0) errors.autre = "≥ 0";
    return errors;
  };

  const handleCreate = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    setFormErrors({});
    setSaving(true);
    try {
      const dto: CreateTarifDto = { societeId, ...form };
      const created = await createTarif(dto);
      // désactive l'ancien actif localement
      setTarifs((prev) =>
        [created, ...prev.map((t) => (t.actif ? { ...t, actif: false } : t))]
      );
      setIsCreateOpen(false);
      setForm(EMPTY_FORM);
      toast({ title: "Tarif créé", description: "Le nouveau tarif est maintenant actif." });
    } catch {
      toast({ title: "Erreur", description: "Impossible de créer le tarif.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // --- Suppression ---
  const handleDelete = async (tarif: Tarif) => {
    if (!confirm("Supprimer ce tarif ?")) return;
    try {
      await deleteTarif(tarif.id);
      setTarifs((prev) => {
        const remaining = prev.filter((t) => t.id !== tarif.id);
        // si on a supprimé l'actif, le plus récent des restants redevient actif
        if (tarif.actif && remaining.length > 0) {
          remaining[0] = { ...remaining[0], actif: true };
        }
        return remaining;
      });
      toast({ title: "Tarif supprimé" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer le tarif.", variant: "destructive" });
    }
  };

  // --- Commentaire ---
  const openCommentaire = (tarif: Tarif) => {
    setEditingCommentaire(tarif);
    setCommentaireDraft(tarif.commentaire ?? "");
  };

  const handleSaveCommentaire = async () => {
    if (!editingCommentaire) return;
    setSavingCommentaire(true);
    try {
      const updated = await updateTarifCommentaire(
        editingCommentaire.id,
        commentaireDraft.trim() || null
      );
      setTarifs((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      setEditingCommentaire(null);
      toast({ title: "Commentaire enregistré" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer le commentaire.", variant: "destructive" });
    } finally {
      setSavingCommentaire(false);
    }
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
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Euro className="h-5 w-5" />
            Tarifs
          </CardTitle>
          {isAdmin && (
            <Button
              size="sm"
              onClick={() => {
                setForm(EMPTY_FORM);
                setFormErrors({});
                setIsCreateOpen(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Nouveau tarif
            </Button>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {tarifs.length === 0 && (
            <p className="text-gray-500 text-center py-6">Aucun tarif enregistré</p>
          )}

          {/* Tarif actif */}
          {tarifActif && (
            <TarifRow
              tarif={tarifActif}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onEditCommentaire={openCommentaire}
            />
          )}

          {/* Historique */}
          {historique.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-500 pt-2">Historique</p>
              {historique.map((t) => (
                <TarifRow
                  key={t.id}
                  tarif={t}
                  isAdmin={isAdmin}
                  onDelete={handleDelete}
                  onEditCommentaire={openCommentaire}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog création */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nouveau tarif</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              L&apos;ancien tarif actif sera automatiquement désactivé.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {(["compta", "sociale", "exceptionnel", "autre"] as const).map((field) => (
                <div key={field}>
                  <label className="text-sm font-medium capitalize">{field} (€) *</label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={form[field]}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }))
                    }
                    className={formErrors[field] ? "border-destructive" : ""}
                  />
                  {formErrors[field] && (
                    <p className="text-xs text-destructive">{formErrors[field]}</p>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="text-sm font-medium">Date de début *</label>
              <Input
                type="date"
                value={form.dateDebut}
                onChange={(e) => setForm((prev) => ({ ...prev, dateDebut: e.target.value }))}
                className={formErrors.dateDebut ? "border-destructive" : ""}
              />
              {formErrors.dateDebut && (
                <p className="text-xs text-destructive">{formErrors.dateDebut}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Créer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog commentaire */}
      <Dialog open={!!editingCommentaire} onOpenChange={() => setEditingCommentaire(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Commentaire</DialogTitle>
          </DialogHeader>
          <div>
            <textarea
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="Ajouter un commentaire..."
              value={commentaireDraft}
              onChange={(e) => setCommentaireDraft(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingCommentaire(null)}>
              Annuler
            </Button>
            <Button onClick={handleSaveCommentaire} disabled={savingCommentaire}>
              {savingCommentaire && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

interface TarifRowProps {
  tarif: Tarif;
  isAdmin: boolean;
  onDelete: (tarif: Tarif) => void;
  onEditCommentaire: (tarif: Tarif) => void;
}

function TarifRow({ tarif, isAdmin, onDelete, onEditCommentaire }: TarifRowProps) {
  return (
    <div
      className={`rounded-lg border p-4 space-y-3 ${
        tarif.actif ? "border-green-300 bg-green-50" : "bg-gray-50"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">
            Depuis le {formatDate(tarif.dateDebut)}
          </span>
          {tarif.actif && (
            <Badge className="bg-green-100 text-green-800 border-green-300">Actif</Badge>
          )}
        </div>
        {isAdmin && (
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditCommentaire(tarif)}
              title="Modifier le commentaire"
            >
              <Pencil className="h-4 w-4 text-gray-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(tarif)}
              className="text-red-500 hover:text-red-700 hover:bg-red-50"
              title="Supprimer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-gray-500">Compta</p>
          <p className="font-semibold">{formatCurrency(tarif.compta)}</p>
        </div>
        <div>
          <p className="text-gray-500">Sociale</p>
          <p className="font-semibold">{formatCurrency(tarif.sociale)}</p>
        </div>
        <div>
          <p className="text-gray-500">Exceptionnel</p>
          <p className="font-semibold">{formatCurrency(tarif.exceptionnel)}</p>
        </div>
        <div>
          <p className="text-gray-500">Autre</p>
          <p className="font-semibold">{formatCurrency(tarif.autre)}</p>
        </div>
      </div>

      {tarif.commentaire && (
        <p className="text-sm text-gray-600 italic border-t pt-2">{tarif.commentaire}</p>
      )}
    </div>
  );
}
