"use client";

import { useState, useEffect, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Pencil, Receipt, TrendingUp } from "lucide-react";
import {
  Facture,
  BilanFacture,
  TypeFacture,
  TYPE_FACTURE_LABELS,
  CreateFactureDto,
  UpdateFactureDto,
  getFacturesBySociete,
  getBilanFacture,
  createFacture,
  updateFacture,
  deleteFacture,
} from "@/lib/api/facture";
import { useUser } from "@/context/UserContext";

interface FactureSocieteProps {
  societeId: number;
}

const TYPE_FACTURE_COLORS: Record<TypeFacture, string> = {
  COMPTA: "bg-blue-100 text-blue-800",
  SOCIALE: "bg-purple-100 text-purple-800",
  EXCEPTIONNEL: "bg-orange-100 text-orange-800",
  AUTRE: "bg-gray-100 text-gray-700",
};

const ALL_TYPES: TypeFacture[] = ["COMPTA", "SOCIALE", "EXCEPTIONNEL", "AUTRE"];

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

const EMPTY_FORM = {
  montant: 0,
  dateFacture: "",
  typeFacture: "COMPTA" as TypeFacture,
  payer: false,
};

type FormState = typeof EMPTY_FORM;
type FormErrors = Partial<Record<keyof FormState, string>>;

function validateForm(form: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!form.dateFacture) errors.dateFacture = "Obligatoire";
  if (form.montant < 0) errors.montant = "≥ 0";
  return errors;
}

export default function FactureSociete({ societeId }: FactureSocieteProps) {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 1;

  const [factures, setFactures] = useState<Facture[]>([]);
  const [bilan, setBilan] = useState<BilanFacture | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Création
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormState>(EMPTY_FORM);
  const [createErrors, setCreateErrors] = useState<FormErrors>({});

  // Édition
  const [editingFacture, setEditingFacture] = useState<Facture | null>(null);
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM);
  const [editErrors, setEditErrors] = useState<FormErrors>({});

  const refreshBilan = useCallback(() => {
    getBilanFacture(societeId).then(setBilan).catch(() => null);
  }, [societeId]);

  useEffect(() => {
    setLoading(true);
    Promise.all([getFacturesBySociete(societeId), getBilanFacture(societeId)])
      .then(([facturesData, bilanData]) => {
        setFactures(facturesData);
        setBilan(bilanData);
      })
      .catch(() =>
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        })
      )
      .finally(() => setLoading(false));
  }, [societeId, toast]);

  // --- Création ---
  const openCreate = () => {
    setCreateForm(EMPTY_FORM);
    setCreateErrors({});
    setIsCreateOpen(true);
  };

  const handleCreate = async () => {
    const errors = validateForm(createForm);
    if (Object.keys(errors).length > 0) {
      setCreateErrors(errors);
      return;
    }
    setCreateErrors({});
    setSaving(true);
    try {
      const dto: CreateFactureDto = { societeId, ...createForm };
      const created = await createFacture(dto);
      setFactures((prev) => [created, ...prev]);
      refreshBilan();
      setIsCreateOpen(false);
      toast({ title: "Facture créée" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de créer la facture.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // --- Édition ---
  const openEdit = (facture: Facture) => {
    setEditingFacture(facture);
    setEditForm({
      montant: facture.montant,
      dateFacture: new Date(facture.dateFacture).toISOString().slice(0, 10),
      typeFacture: facture.typeFacture,
      payer: facture.payer,
    });
    setEditErrors({});
  };

  const handleEdit = async () => {
    if (!editingFacture) return;
    const errors = validateForm(editForm);
    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }
    setEditErrors({});
    setSaving(true);
    try {
      const dto: UpdateFactureDto = { ...editForm };
      const updated = await updateFacture(editingFacture.id, dto);
      setFactures((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
      refreshBilan();
      setEditingFacture(null);
      toast({ title: "Facture mise à jour" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier la facture.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  // --- Suppression ---
  const handleDelete = async (facture: Facture) => {
    if (!confirm("Supprimer cette facture ?")) return;
    try {
      await deleteFacture(facture.id);
      setFactures((prev) => prev.filter((f) => f.id !== facture.id));
      refreshBilan();
      toast({ title: "Facture supprimée" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer la facture.", variant: "destructive" });
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
      {/* Bilan financier */}
      {bilan && <BilanCard bilan={bilan} />}

      {/* Liste des factures */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Factures
          </CardTitle>
          {isAdmin && (
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Nouvelle facture
            </Button>
          )}
        </CardHeader>

        <CardContent>
          {factures.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Aucune facture enregistrée</p>
          ) : (
            <div className="divide-y">
              {factures.map((facture) => (
                <div key={facture.id} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <p className="text-sm text-gray-500 shrink-0">{formatDate(facture.dateFacture)}</p>
                    <Badge className={`shrink-0 ${TYPE_FACTURE_COLORS[facture.typeFacture]}`}>
                      {TYPE_FACTURE_LABELS[facture.typeFacture]}
                    </Badge>
                    <span className="font-semibold">{formatCurrency(facture.montant)}</span>
                    <Badge
                      className={
                        facture.payer
                          ? "bg-green-100 text-green-700 shrink-0"
                          : "bg-red-100 text-red-600 shrink-0"
                      }
                    >
                      {facture.payer ? "Payé" : "Non payé"}
                    </Badge>
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(facture)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(facture)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog création */}
      <FactureDialog
        title="Nouvelle facture"
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        form={createForm}
        setForm={setCreateForm}
        errors={createErrors}
        saving={saving}
        onSubmit={handleCreate}
        submitLabel="Créer"
      />

      {/* Dialog édition */}
      <FactureDialog
        title="Modifier la facture"
        open={!!editingFacture}
        onOpenChange={(open) => { if (!open) setEditingFacture(null); }}
        form={editForm}
        setForm={setEditForm}
        errors={editErrors}
        saving={saving}
        onSubmit={handleEdit}
        submitLabel="Enregistrer"
      />
    </>
  );
}

// --- Bilan ---

const DETAIL_ROWS: { key: keyof BilanFacture["detail"]; label: string; color: string }[] = [
  { key: "compta",       label: "Compta",       color: "text-blue-700" },
  { key: "sociale",      label: "Sociale",      color: "text-purple-700" },
  { key: "exceptionnel", label: "Exceptionnel", color: "text-orange-600" },
  { key: "autre",        label: "Autre",        color: "text-gray-600" },
];

function BilanCard({ bilan }: { bilan: BilanFacture }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-5 w-5" />
          Bilan financier
          {bilan.dateDebutFacturation && (
            <span className="text-sm font-normal text-gray-500 ml-1">
              depuis le {new Date(bilan.dateDebutFacturation).toLocaleDateString("fr-FR")}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* KPIs globaux */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-1">Mensualité actuelle</p>
            <p className="text-base font-bold">{formatCurrency(bilan.mensualiteActuelle)}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs text-gray-500 mb-1">Total dû</p>
            <p className="text-base font-bold">{formatCurrency(bilan.totalDu)}</p>
          </div>
          <div className="rounded-lg bg-green-50 p-3">
            <p className="text-xs text-gray-500 mb-1">Payé</p>
            <p className="text-base font-bold text-green-600">{formatCurrency(bilan.totalPaye)}</p>
          </div>
          <div className={`rounded-lg p-3 ${bilan.solde > 0 ? "bg-red-50" : "bg-green-50"}`}>
            <p className="text-xs text-gray-500 mb-1">Solde restant</p>
            <p className={`text-base font-bold ${bilan.solde > 0 ? "text-red-600" : "text-green-600"}`}>
              {formatCurrency(bilan.solde)}
            </p>
          </div>
        </div>

        {/* Détail par type */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 font-medium text-gray-500">Type</th>
                <th className="text-right py-2 font-medium text-gray-500">Dû</th>
                <th className="text-right py-2 font-medium text-gray-500">Payé</th>
                <th className="text-right py-2 font-medium text-gray-500">Solde</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {DETAIL_ROWS.map(({ key, label, color }) => {
                const row = bilan.detail[key];
                return (
                  <tr key={key} className="hover:bg-gray-50">
                    <td className={`py-2 font-medium ${color}`}>{label}</td>
                    <td className="py-2 text-right">{formatCurrency(row.du)}</td>
                    <td className="py-2 text-right text-green-600">{formatCurrency(row.paye)}</td>
                    <td className={`py-2 text-right font-semibold ${row.solde > 0 ? "text-red-500" : "text-gray-500"}`}>
                      {formatCurrency(row.solde)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// --- Dialog formulaire ---

interface FactureDialogProps {
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: FormState;
  setForm: (form: FormState) => void;
  errors: FormErrors;
  saving: boolean;
  onSubmit: () => void;
  submitLabel: string;
}

function FactureDialog({
  title,
  open,
  onOpenChange,
  form,
  setForm,
  errors,
  saving,
  onSubmit,
  submitLabel,
}: FactureDialogProps) {
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm({ ...form, [key]: value });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Type de facture *</label>
            <Select
              value={form.typeFacture}
              onValueChange={(val) => set("typeFacture", val as TypeFacture)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {TYPE_FACTURE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Montant (€) *</label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={form.montant}
              onChange={(e) => set("montant", parseFloat(e.target.value) || 0)}
              className={errors.montant ? "border-destructive" : ""}
            />
            {errors.montant && <p className="text-xs text-destructive">{errors.montant}</p>}
          </div>

          <div>
            <label className="text-sm font-medium">Date de facture *</label>
            <Input
              type="date"
              value={form.dateFacture}
              onChange={(e) => set("dateFacture", e.target.value)}
              className={errors.dateFacture ? "border-destructive" : ""}
            />
            {errors.dateFacture && <p className="text-xs text-destructive">{errors.dateFacture}</p>}
          </div>

          <div className="flex items-center gap-3">
            <input
              id="payer-toggle"
              type="checkbox"
              checked={form.payer}
              onChange={(e) => set("payer", e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="payer-toggle" className="text-sm font-medium cursor-pointer">
              Payé
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={onSubmit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {submitLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
