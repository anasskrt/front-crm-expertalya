"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Users } from "lucide-react";
import {
  EmailListeSummary,
  CreateEmailListeDto,
  createEmailListe,
  updateEmailListe,
  deleteEmailListe,
} from "@/lib/api/emailListe";

const EMPTY_FORM: CreateEmailListeDto = { titre: "", description: "", actif: true };

interface Props {
  listes: EmailListeSummary[];
  loading: boolean;
  selectedId: number | null;
  hasDetail: boolean;
  onSelect: (id: number) => void;
  onListeCreated: (l: EmailListeSummary) => void;
  onListeUpdated: (l: EmailListeSummary) => void;
  onListeDeleted: (id: number) => void;
}

export default function EmailListePanel({
  listes,
  loading,
  selectedId,
  hasDetail,
  onSelect,
  onListeCreated,
  onListeUpdated,
  onListeDeleted,
}: Props) {
  const { toast } = useToast();

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<EmailListeSummary | null>(null);
  const [form, setForm] = useState<CreateEmailListeDto>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal("create");
  };

  const openEdit = (l: EmailListeSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditing(l);
    setForm({ titre: l.titre, description: l.description ?? "", actif: l.actif });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.titre.trim()) {
      toast({ title: "Le titre est obligatoire", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (modal === "create") {
        const created = await createEmailListe(form);
        onListeCreated(created);
        toast({ title: "Liste créée" });
      } else if (modal === "edit" && editing) {
        const updated = await updateEmailListe(editing.id, form);
        onListeUpdated(updated);
        toast({ title: "Liste mise à jour" });
      }
      setModal(null);
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (l: EmailListeSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Supprimer la liste "${l.titre}" et tous ses contacts ?`)) return;
    try {
      await deleteEmailListe(l.id);
      onListeDeleted(l.id);
      toast({ title: "Liste supprimée" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer.", variant: "destructive" });
    }
  };

  const handleToggle = async (l: EmailListeSummary, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const updated = await updateEmailListe(l.id, { actif: !l.actif });
      onListeUpdated(updated);
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier le statut.", variant: "destructive" });
    }
  };

  return (
    <>
      <div className={`${hasDetail ? "w-2/5" : "w-full"} transition-all`}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="h-5 w-5" />
              {loading ? "Chargement..." : `Listes (${listes.length})`}
            </CardTitle>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle liste
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : listes.length === 0 ? (
              <p className="text-center text-gray-500 py-10">Aucune liste de diffusion</p>
            ) : (
              <div className="divide-y">
                {listes.map((l) => (
                  <div
                    key={l.id}
                    onClick={() => onSelect(l.id)}
                    className={`px-4 py-3 flex items-center justify-between gap-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      selectedId === l.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-medium truncate">{l.titre}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-0.5">
                          <Users className="h-3 w-3" />
                          {l._count.contacts} contact{l._count.contacts !== 1 ? "s" : ""}
                        </span>
                        <Badge
                          className={`text-xs ${
                            l.actif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {l.actif ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={(e) => handleToggle(l, e)}
                        className="text-gray-400 hover:text-gray-700 p-1"
                        title={l.actif ? "Désactiver" : "Activer"}
                      >
                        {l.actif ? (
                          <ToggleRight className="h-5 w-5 text-green-500" />
                        ) : (
                          <ToggleLeft className="h-5 w-5" />
                        )}
                      </button>
                      <Button variant="ghost" size="sm" onClick={(e) => openEdit(l, e)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(l, e)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal — Créer / Modifier liste */}
      <Dialog open={modal !== null} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal === "create" ? "Nouvelle liste de diffusion" : "Modifier la liste"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Titre *</Label>
              <Input
                value={form.titre}
                onChange={(e) => setForm((p) => ({ ...p, titre: e.target.value }))}
                placeholder="Ex : Clients TVA mensuelle"
              />
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                value={form.description ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Description optionnelle..."
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-3">
              <input
                id="liste-actif"
                type="checkbox"
                checked={form.actif}
                onChange={(e) => setForm((p) => ({ ...p, actif: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="liste-actif" className="cursor-pointer">Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setModal(null)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {modal === "create" ? "Créer" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
