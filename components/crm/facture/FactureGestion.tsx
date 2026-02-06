// components/crm/FactureGestion.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Plus, Download, Calendar, Euro, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllFacturesForSos } from "@/app/api/facture";
import { createFacture, updateFacture } from "@/app/api/facture"; // <-- ajouté
import { Textarea } from "../../ui/textarea";
import React from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "../../ui/dialog";

interface FactureGestionProps {
  societeId: number;
}

interface FactureModel {
  id: number;
  montantCompta: number;
  montantSocial: number;
  montantRattrapage: number;
  montantAutres: number;
  date: string;
  paye: boolean; // true = payée
  commentaire: string;
}

export default function FactureGestion({ societeId }: FactureGestionProps) {
  const [factures, setFactures] = useState<FactureModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false); // <-- toggle formulaire
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10), // "YYYY-MM-DD"
    montantCompta: 0,
    montantSocial: 0,
    montantRattrapage: 0,
    montantAutres: 0,
    paye: false,
    commentaire: "",
  });

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [societeId]);

  const refresh = () => {
    setLoading(true);
    getAllFacturesForSos(societeId)
      .then((data) => setFactures(data))
      .catch((err) => {
        console.error(err);
        toast({
          title: "Erreur",
          description: "Impossible de charger les factures.",
          variant: "destructive",
        });
      })
      .finally(() => setLoading(false));
  };

  const totalMontant = factures.reduce(
    (sum, f) =>
      sum + f.montantCompta + f.montantSocial + f.montantRattrapage,
    0
  );
  const payees = factures.filter((f) => f.paye).length;
  const nonPayees = factures.length - payees;

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("fr-FR");

  const toInt = (n: number) => (Number.isFinite(n) ? Math.trunc(n) : 0);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target as HTMLInputElement;
    const { name, type, value, valueAsNumber } = el;

    setForm(prev => ({
      ...prev,
      [name]: type === "number" ? toInt(valueAsNumber) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // validations simples
    if (!form.date) {
      toast({
        title: "Date manquante",
        description: "Merci de renseigner une date.",
        variant: "destructive",
      });
      return;
    }
    const amounts = [
      form.montantCompta,
      form.montantSocial,
      form.montantRattrapage,
    ];
    if (amounts.some((n) => n < 0)) {
      toast({
        title: "Montants invalides",
        description: "Les montants doivent être positifs.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      await createFacture(societeId, form);
      toast({
        title: "Facture créée",
        description: "La facture a été ajoutée avec succès.",
      });
      setShowForm(false);
      // reset form
      setForm({
        date: new Date().toISOString().slice(0, 10),
        montantCompta: 0,
        montantSocial: 0,
        montantRattrapage: 0,
        montantAutres: 0,
        paye: false,
        commentaire: "",
      });
      refresh(); // recharger la liste
    } catch (err) {
      console.error(err);
      toast({
        title: "Erreur",
        description: "Échec de la création de la facture.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // Édition
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    date: "",
    montantCompta: 0,
    montantSocial: 0,
    montantRattrapage: 0,
    montantAutres: 0,
    paye: false,
    commentaire: "",
  });

  const openEdit = (f: FactureModel) => {
    setEditingId(f.id);
    setEditForm({
      date: f.date?.slice(0, 10) ?? new Date().toISOString().slice(0, 10),
      montantCompta: f.montantCompta ?? 0,
      montantSocial: f.montantSocial ?? 0,
      montantRattrapage: f.montantRattrapage ?? 0,
      montantAutres: f.montantAutres ?? 0,
      paye: f.paye ?? false,
      commentaire: f.commentaire ?? "",
    });
    setShowEdit(true);
  };
  
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const el = e.target as HTMLInputElement;
    const { name, type, value, valueAsNumber } = el;
  
    setEditForm(prev => ({
      ...prev,
      [name]: type === "number" ? toInt(valueAsNumber) : value,
    }));
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // validations simples
    if (!editForm.date) {
      toast({
        title: "Date manquante",
        description: "Merci de renseigner une date.",
        variant: "destructive",
      });
      return;
    }
    const amounts = [
      editForm.montantCompta,
      editForm.montantSocial,
      editForm.montantRattrapage,
      editForm.montantAutres,
    ];
    if (amounts.some((n) => n < 0)) {
      toast({
        title: "Montants invalides",
        description: "Les montants doivent être positifs.",
        variant: "destructive",
      });
      return;
    }
  
    // Mise à jour locale (front only)
    await updateFacture(editingId!, editForm);

    setFactures((prev) =>
      prev.map((f) =>
        f.id === editingId
          ? {
              ...f,
              ...editForm,
              // s'assurer du format de date ISO si besoin de cohérence
              date: editForm.date,
            }
          : f
      )
    );
  
    setShowEdit(false);
    setEditingId(null);
    toast({ title: "Facture modifiée", description: "Modifications enregistrées (front)." });
  };
  
  const cancelEdit = () => {
    setShowEdit(false);
    setEditingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Euro className="h-8 w-8 text-green-600" />
            <div>
              <p className="text-2xl font-bold">
                {totalMontant.toLocaleString()} €
              </p>
              <p className="text-sm text-gray-600">Total facturé</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Calendar className="h-8 w-8 text-blue-600" />
            <div>
              <p className="text-2xl font-bold">{payees}</p>
              <p className="text-sm text-gray-600">Factures payées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-2">
            <Download className="h-8 w-8 text-orange-600" />
            <div>
              <p className="text-2xl font-bold">{nonPayees}</p>
              <p className="text-sm text-gray-600">Non payées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Gestion des factures</h3>
        <Button onClick={() => setShowForm((v) => !v)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Fermer" : "Nouvelle facture"}
        </Button>
      </div>

      {/* Formulaire de création */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Créer une facture</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleFormChange}
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="montantCompta">Montant compta (€)</Label>
                <Input
                  id="montantCompta"
                  name="montantCompta"
                  type="number"
                  min={0}
                  step={1}
                  value={form.montantCompta}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="montantSocial">Montant social (€)</Label>
                <Input
                  id="montantSocial"
                  name="montantSocial"
                  type="number"
                  min={0}
                  step={1}
                  value={form.montantSocial}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="montantRattrapage">Montant exceptionnel (€)</Label>
                <Input
                  id="montantRattrapage"
                  name="montantRattrapage"
                  type="number"
                  min={0}
                  step={1}
                  value={form.montantRattrapage}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex flex-col gap-2 ">
                <Label htmlFor="montantAutres">Montant autres (€)</Label>
                <Input
                  id="montantAutres"
                  name="montantAutres"
                  type="number"
                  min={0}
                  step={1}
                  value={form.montantAutres}
                  onChange={handleFormChange}
                />
              </div>

              <div className="flex items-center gap-3 md:col-span-2">
                <Switch
                  id="paye"
                  checked={form.paye}
                  onCheckedChange={(v) => setForm((p) => ({ ...p, paye: v }))}
                />
                <Label htmlFor="paye">Facture payée</Label>
              </div>

              <div>
                <Label htmlFor="commentaire">Commentaire</Label>
                <Textarea 
                  id="commentaire"
                  name="commentaire"
                  value={form.commentaire}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, commentaire: e.target.value }))
                  }
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForm(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Enregistrement..." : "Créer la facture"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Tableau des factures */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des factures</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p>Chargement des factures…</p>
          ) : factures.length === 0 ? (
            <p>Aucune facture trouvée.</p>
          ) : (
            <Table className="border-separate border-spacing-y-2">
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Compta (€)</TableHead>
                  <TableHead className="text-right">Social (€)</TableHead>
                  <TableHead className="text-right">Rattrapage (€)</TableHead>
                  <TableHead className="text-right">Exceptionnel (€)</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {factures.map((f) => {
                  const hasComment = !!f.commentaire?.trim();

                  return (
                    <React.Fragment key={f.id}>
                      {/* Ligne principale alignée (bordures haut + côtés) */}
                      <TableRow className="bg-white">
                        <TableCell className="border-y border-gray-200 first:border-l last:border-r first:rounded-tl-xl last:rounded-tr-xl">
                          {formatDate(f.date)}
                        </TableCell>

                        <TableCell className="text-right border-y border-gray-200">
                          {f.montantCompta.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right border-y border-gray-200">
                          {f.montantSocial.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right border-y border-gray-200">
                          {f.montantRattrapage.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right border-y border-gray-200">
                          {f.montantAutres.toLocaleString()}
                        </TableCell>

                        <TableCell className="border-y border-gray-200">
                          <Badge
                            className={
                              f.paye
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }
                          >
                            {f.paye ? "Payée" : "Non payée"}
                          </Badge>
                        </TableCell>

                        <TableCell className="text-center border-y border-gray-200 last:border-r last:rounded-tr-xl">
                          <div className="flex justify-center gap-1">
                            <Button variant="outline" size="sm" onClick={() => openEdit(f)}>
                              Modifier
                            </Button>
                            <Button variant="ghost" size="sm">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>

                        </TableCell>
                      </TableRow>

                      {/* Ligne commentaire (bordures bas + côtés) */}
                      <TableRow className="bg-white">
                        <TableCell
                          colSpan={7}
                          className="border-x border-b border-gray-200 rounded-b-xl p-3 text-sm"
                        >
                          <div
                            className={
                              hasComment
                                ? "text-gray-800 font-semibold"
                                : "text-gray-500 italic"
                            }
                          >
                            {hasComment ? f.commentaire : "Pas de commentaire"}
                          </div>
                        </TableCell>
                      </TableRow>
                    </React.Fragment>
                  );
                })}
              </TableBody>
            </Table>

          )}
        </CardContent>
      </Card>

      {/* Dialogue d'édition */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la facture</DialogTitle>
          </DialogHeader>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleEditSubmit}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-date">Date</Label>
              <Input
                id="edit-date"
                name="date"
                type="date"
                value={editForm.date}
                onChange={handleEditChange}
                required
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-montantCompta">Montant compta (€)</Label>
              <Input
                id="edit-montantCompta"
                name="montantCompta"
                type="number"
                min={0}
                step={1}
                value={editForm.montantCompta}
                onChange={handleEditChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-montantSocial">Montant social (€)</Label>
              <Input
                id="edit-montantSocial"
                name="montantSocial"
                type="number"
                min={0}
                step={1}
                value={editForm.montantSocial}
                onChange={handleEditChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-montantRattrapage">Montant exceptionnel (€)</Label>
              <Input
                id="edit-montantRattrapage"
                name="montantRattrapage"
                type="number"
                min={0}
                step={1}
                value={editForm.montantRattrapage}
                onChange={handleEditChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-montantAutres">Montant autres (€)</Label>
              <Input
                id="edit-montantAutres"
                name="montantAutres"
                type="number"
                min={0}
                step={1}
                value={editForm.montantAutres}
                onChange={handleEditChange}
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <Switch
                id="edit-paye"
                checked={editForm.paye}
                onCheckedChange={(v) => setEditForm((p) => ({ ...p, paye: v }))}
              />
              <Label htmlFor="edit-paye">Facture payée</Label>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="edit-commentaire">Commentaire</Label>
              <Textarea
                id="edit-commentaire"
                name="commentaire"
                value={editForm.commentaire}
                onChange={(e) =>
                  setEditForm((p) => ({ ...p, commentaire: e.target.value }))
                }
                rows={3}
              />
            </div>

            <DialogFooter className="md:col-span-2">
              <Button type="button" variant="ghost" onClick={cancelEdit}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
