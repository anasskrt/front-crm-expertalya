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
import { Loader2, Plus } from "lucide-react";
import {
  EmailListePlanification,
  StatutPlanification,
  planifierEnvoi,
  annulerPlanification,
} from "@/lib/api/emailListe";
import { EmailTemplate, TYPE_TEMPLATE_LABELS } from "@/lib/api/email";

const STATUT_COLORS: Record<StatutPlanification, string> = {
  PLANIFIE: "bg-blue-100 text-blue-700",
  ENVOYE:   "bg-green-100 text-green-700",
  ANNULE:   "bg-red-100 text-red-700",
};

const STATUT_LABELS: Record<StatutPlanification, string> = {
  PLANIFIE: "Planifié",
  ENVOYE:   "Envoyé",
  ANNULE:   "Annulé",
};

interface Props {
  listeId: number;
  planifications: EmailListePlanification[];
  activeTemplates: EmailTemplate[];
  onRefresh: () => void;
}

export default function PlanificationsTab({ listeId, planifications, activeTemplates, onRefresh }: Props) {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ templateId: "", dateEnvoi: "" });
  const [saving, setSaving] = useState(false);

  const openModal = () => {
    setForm({ templateId: "", dateEnvoi: "" });
    setOpen(true);
  };

  const handlePlanifier = async () => {
    if (!form.templateId || !form.dateEnvoi) {
      toast({ title: "Template et date obligatoires", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await planifierEnvoi(listeId, {
        templateId: Number(form.templateId),
        dateEnvoi: form.dateEnvoi,
      });
      setOpen(false);
      onRefresh();
      toast({ title: "Envoi planifié" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de planifier.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleAnnuler = async (p: EmailListePlanification) => {
    if (!confirm("Annuler cette planification ?")) return;
    try {
      await annulerPlanification(listeId, p.id);
      onRefresh();
      toast({ title: "Planification annulée" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'annuler.", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={openModal}>
          <Plus className="h-4 w-4 mr-1" />
          Planifier un envoi
        </Button>
      </div>

      {planifications.length === 0 ? (
        <p className="text-center text-gray-500 py-6 text-sm">Aucune planification</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Date d&apos;envoi</th>
                <th className="pb-2 font-medium">Template</th>
                <th className="pb-2 font-medium">Statut</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {planifications.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="py-2 pr-3 whitespace-nowrap">
                    {new Date(p.dateEnvoi).toLocaleDateString("fr-FR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </td>
                  <td className="py-2 pr-3">
                    <span className="font-medium">{p.template.nom}</span>
                    <span className="ml-1 text-gray-400 text-xs">
                      (
                      {TYPE_TEMPLATE_LABELS[p.template.type as keyof typeof TYPE_TEMPLATE_LABELS] ??
                        p.template.type}
                      )
                    </span>
                  </td>
                  <td className="py-2 pr-3">
                    <Badge className={`text-xs ${STATUT_COLORS[p.statut]}`}>
                      {STATUT_LABELS[p.statut]}
                    </Badge>
                  </td>
                  <td className="py-2">
                    {p.statut === "PLANIFIE" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAnnuler(p)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs h-7 px-2"
                      >
                        Annuler
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Planifier un envoi</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Template *</Label>
              <Select value={form.templateId} onValueChange={(v) => setForm((p) => ({ ...p, templateId: v }))}>
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
              <Label>Date d&apos;envoi *</Label>
              <Input
                type="date"
                value={form.dateEnvoi}
                onChange={(e) => setForm((p) => ({ ...p, dateEnvoi: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handlePlanifier} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Planifier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
