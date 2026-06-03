"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import {
  EmailListeRegle,
  FrequenceEmail,
  CreateRegleDto,
  createRegle,
  updateRegle,
  deleteRegle,
} from "@/lib/api/emailListe";
import { EmailTemplate, TYPE_TEMPLATE_LABELS } from "@/lib/api/email";

const FREQUENCE_LABELS: Record<FrequenceEmail, string> = {
  MENSUEL:     "Mensuel",
  TRIMESTRIEL: "Trimestriel",
  SEMESTRIEL:  "Semestriel",
  ANNUEL:      "Annuel",
};

const FREQUENCE_COLORS: Record<FrequenceEmail, string> = {
  MENSUEL:     "bg-blue-100 text-blue-700",
  TRIMESTRIEL: "bg-violet-100 text-violet-700",
  SEMESTRIEL:  "bg-orange-100 text-orange-700",
  ANNUEL:      "bg-red-100 text-red-700",
};

const ALL_FREQUENCES: FrequenceEmail[] = ["MENSUEL", "TRIMESTRIEL", "SEMESTRIEL", "ANNUEL"];

const EMPTY_FORM: CreateRegleDto = { templateId: 0, jourDuMois: 1, frequence: "MENSUEL", actif: true };

interface Props {
  listeId: number;
  regles: EmailListeRegle[];
  activeTemplates: EmailTemplate[];
  allTemplates: EmailTemplate[];
  onReglesChange: (regles: EmailListeRegle[]) => void;
}

export default function ReglesTab({ listeId, regles, activeTemplates, allTemplates, onReglesChange }: Props) {
  const { toast } = useToast();

  const [modal, setModal] = useState<"create" | "edit" | null>(null);
  const [editing, setEditing] = useState<EmailListeRegle | null>(null);
  const [form, setForm] = useState<CreateRegleDto>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setModal("create");
  };

  const openEdit = (r: EmailListeRegle) => {
    setEditing(r);
    const tpl = allTemplates.find((t) => t.nom === r.template.nom);
    setForm({
      templateId: tpl?.id ?? 0,
      jourDuMois: r.jourDuMois,
      frequence: r.frequence,
      actif: r.actif,
    });
    setModal("edit");
  };

  const handleSave = async () => {
    if (!form.templateId || form.jourDuMois < 1 || form.jourDuMois > 28) {
      toast({ title: "Template obligatoire et jour entre 1 et 28", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (modal === "create") {
        const created = await createRegle(listeId, form);
        onReglesChange([...regles, created]);
        toast({ title: "Règle créée" });
      } else if (modal === "edit" && editing) {
        const updated = await updateRegle(listeId, editing.id, form);
        onReglesChange(regles.map((r) => (r.id === updated.id ? updated : r)));
        toast({ title: "Règle mise à jour" });
      }
      setModal(null);
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer la règle.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (r: EmailListeRegle) => {
    if (!confirm(`Supprimer la règle "${FREQUENCE_LABELS[r.frequence]} — ${r.template.nom}" ?`)) return;
    try {
      await deleteRegle(listeId, r.id);
      onReglesChange(regles.filter((x) => x.id !== r.id));
      toast({ title: "Règle supprimée" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer la règle.", variant: "destructive" });
    }
  };

  const handleToggle = async (r: EmailListeRegle) => {
    try {
      const updated = await updateRegle(listeId, r.id, { actif: !r.actif });
      onReglesChange(regles.map((x) => (x.id === updated.id ? updated : x)));
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier le statut.", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="rounded-md bg-violet-50 border border-violet-100 p-3 mb-3 text-xs text-violet-700">
        <strong>Règles récurrentes</strong> — envois automatiques répétés selon une fréquence.
        Différent des <em>Planifications</em> qui sont des envois uniques à date fixe.
      </div>

      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={openCreate}>
          <Plus className="h-4 w-4 mr-1" />
          Nouvelle règle
        </Button>
      </div>

      {regles.length === 0 ? (
        <p className="text-center text-gray-500 py-6 text-sm">Aucune règle récurrente</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Template</th>
                <th className="pb-2 font-medium">Fréquence</th>
                <th className="pb-2 font-medium">Jour</th>
                <th className="pb-2 font-medium">Prochain envoi</th>
                <th className="pb-2 font-medium">Actif</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {regles.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="py-2 pr-3">
                    <p className="font-medium">{r.template.nom}</p>
                    <p className="text-xs text-gray-400">
                      {TYPE_TEMPLATE_LABELS[r.template.type as keyof typeof TYPE_TEMPLATE_LABELS] ??
                        r.template.type}
                    </p>
                  </td>
                  <td className="py-2 pr-3">
                    <Badge className={`text-xs ${FREQUENCE_COLORS[r.frequence]}`}>
                      {FREQUENCE_LABELS[r.frequence]}
                    </Badge>
                  </td>
                  <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">le {r.jourDuMois}</td>
                  <td className="py-2 pr-3 text-gray-600 whitespace-nowrap">
                    {new Date(r.prochainEnvoi).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-2 pr-3">
                    <button
                      onClick={() => handleToggle(r)}
                      className="text-gray-400 hover:text-gray-700"
                      title={r.actif ? "Désactiver" : "Activer"}
                    >
                      {r.actif ? (
                        <ToggleRight className="h-5 w-5 text-green-500" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                  </td>
                  <td className="py-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(r)}>
                        <Pencil className="h-4 w-4 text-gray-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(r)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={modal !== null} onOpenChange={(v) => !v && setModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modal === "create" ? "Nouvelle règle récurrente" : "Modifier la règle"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-md bg-violet-50 border border-violet-100 p-3 text-xs text-violet-700">
              Envoi automatique répété — le backend calculera la prochaine date d&apos;envoi.
            </div>

            <div>
              <Label>Template *</Label>
              <Select
                value={form.templateId ? String(form.templateId) : ""}
                onValueChange={(v) => setForm((p) => ({ ...p, templateId: Number(v) }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un template actif..." />
                </SelectTrigger>
                <SelectContent>
                  {activeTemplates.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      {t.nom} — {TYPE_TEMPLATE_LABELS[t.type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fréquence *</Label>
              <Select
                value={form.frequence}
                onValueChange={(v) => setForm((p) => ({ ...p, frequence: v as FrequenceEmail }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_FREQUENCES.map((f) => (
                    <SelectItem key={f} value={f}>
                      <span className="font-medium">{FREQUENCE_LABELS[f]}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {f === "MENSUEL" && "— tous les mois"}
                        {f === "TRIMESTRIEL" && "— tous les 3 mois"}
                        {f === "SEMESTRIEL" && "— tous les 6 mois"}
                        {f === "ANNUEL" && "— une fois par an"}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Jour du mois *</Label>
              <Input
                type="number"
                min={1}
                max={28}
                value={form.jourDuMois}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    jourDuMois: Math.min(28, Math.max(1, Number(e.target.value))),
                  }))
                }
              />
              <p className="text-xs text-gray-400 mt-1">
                Max 28 pour compatibilité avec tous les mois (y compris février).
              </p>
            </div>

            <div className="flex items-center gap-3">
              <input
                id="regle-actif"
                type="checkbox"
                checked={form.actif ?? true}
                onChange={(e) => setForm((p) => ({ ...p, actif: e.target.checked }))}
                className="h-4 w-4 rounded border-gray-300"
              />
              <Label htmlFor="regle-actif" className="cursor-pointer">
                Active
              </Label>
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
