"use client";

import { useState, useEffect, useRef } from "react";
import Navigation from "@/components/crm/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Mail,
  X,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import {
  EmailTemplate,
  TypeEmailTemplate,
  TYPE_TEMPLATE_LABELS,
  VARIABLES_EMAIL,
  CreateTemplateDto,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from "@/lib/api/email";

const ALL_TYPES: TypeEmailTemplate[] = [
  "RELANCE_TVA",
  "FACTURE_IMPAYEE",
  "CLOTURE_PROCHE",
  "RELANCE_DOCUMENT",
  "LIBRE",
];

const TYPE_COLORS: Record<TypeEmailTemplate, string> = {
  RELANCE_TVA:       "bg-blue-100 text-blue-700",
  FACTURE_IMPAYEE:   "bg-red-100 text-red-700",
  CLOTURE_PROCHE:    "bg-orange-100 text-orange-700",
  RELANCE_DOCUMENT:  "bg-purple-100 text-purple-700",
  LIBRE:             "bg-gray-100 text-gray-600",
};

const EMPTY_FORM: CreateTemplateDto = {
  nom: "",
  sujet: "",
  corps: "",
  type: "LIBRE",
  actif: true,
};

export default function EmailAdminPage() {
  const { toast } = useToast();

  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Éditeur
  const [editing, setEditing] = useState<EmailTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [form, setForm] = useState<CreateTemplateDto>(EMPTY_FORM);

  // Refs pour insertion de variables
  const sujetRef = useRef<HTMLInputElement>(null);
  const corpsRef = useRef<HTMLTextAreaElement>(null);
  const [focusedField, setFocusedField] = useState<"sujet" | "corps">("corps");

  useEffect(() => {
    setLoading(true);
    getTemplates()
      .then(setTemplates)
      .catch(() => toast({ title: "Erreur", description: "Impossible de charger les templates.", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  const isEditorOpen = editing !== null || isCreating;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setIsCreating(true);
  };

  const openEdit = (t: EmailTemplate) => {
    setIsCreating(false);
    setEditing(t);
    setForm({ nom: t.nom, sujet: t.sujet, corps: t.corps, type: t.type, actif: t.actif });
  };

  const closeEditor = () => {
    setEditing(null);
    setIsCreating(false);
  };

  const set = <K extends keyof CreateTemplateDto>(key: K, value: CreateTemplateDto[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  // Insertion de variable au curseur
  const insertVariable = (variable: string) => {
    if (focusedField === "sujet" && sujetRef.current) {
      const el = sujetRef.current;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const newVal = form.sujet.slice(0, start) + variable + form.sujet.slice(end);
      set("sujet", newVal);
      setTimeout(() => {
        el.setSelectionRange(start + variable.length, start + variable.length);
        el.focus();
      }, 0);
    } else if (corpsRef.current) {
      const el = corpsRef.current;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const newVal = form.corps.slice(0, start) + variable + form.corps.slice(end);
      set("corps", newVal);
      setTimeout(() => {
        el.setSelectionRange(start + variable.length, start + variable.length);
        el.focus();
      }, 0);
    }
  };

  const handleSave = async () => {
    if (!form.nom.trim() || !form.sujet.trim() || !form.corps.trim()) {
      toast({ title: "Champs obligatoires manquants", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const updated = await updateTemplate(editing.id, form);
        setTemplates((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
        toast({ title: "Template mis à jour" });
      } else {
        const created = await createTemplate(form);
        setTemplates((prev) => [...prev, created]);
        toast({ title: "Template créé" });
      }
      closeEditor();
    } catch {
      toast({ title: "Erreur", description: "Impossible d'enregistrer le template.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (t: EmailTemplate) => {
    if (!confirm(`Supprimer le template "${t.nom}" ?`)) return;
    try {
      await deleteTemplate(t.id);
      setTemplates((prev) => prev.filter((x) => x.id !== t.id));
      if (editing?.id === t.id) closeEditor();
      toast({ title: "Template supprimé" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de supprimer le template.", variant: "destructive" });
    }
  };

  const handleToggleActif = async (t: EmailTemplate) => {
    try {
      const updated = await updateTemplate(t.id, { actif: !t.actif });
      setTemplates((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
    } catch {
      toast({ title: "Erreur", description: "Impossible de modifier le statut.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gestion des templates email</h1>
          <p className="text-gray-500 mt-1">Créez et gérez les modèles d&apos;emails du cabinet</p>
        </div>

        <Navigation />

        <div className={`flex gap-6 ${isEditorOpen ? "items-start" : ""}`}>
          {/* Zone liste */}
          <div className={`${isEditorOpen ? "w-2/5" : "w-full"} transition-all`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Mail className="h-5 w-5" />
                  Templates ({templates.length})
                </CardTitle>
                <Button size="sm" onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-1" />
                  Nouveau template
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                ) : templates.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">Aucun template</p>
                ) : (
                  <div className="divide-y">
                    {templates.map((t) => (
                      <div
                        key={t.id}
                        className={`px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-50 transition-colors ${
                          editing?.id === t.id ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="min-w-0">
                          <p className="font-medium truncate">{t.nom}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`text-xs ${TYPE_COLORS[t.type]}`}>
                              {TYPE_TEMPLATE_LABELS[t.type]}
                            </Badge>
                            <span className={`text-xs ${t.actif ? "text-green-600" : "text-gray-400"}`}>
                              {t.actif ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleToggleActif(t)}
                            className="text-gray-400 hover:text-gray-700 p-1"
                            title={t.actif ? "Désactiver" : "Activer"}
                          >
                            {t.actif
                              ? <ToggleRight className="h-5 w-5 text-green-500" />
                              : <ToggleLeft className="h-5 w-5" />
                            }
                          </button>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(t)}>
                            <Pencil className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(t)}
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

          {/* Zone éditeur */}
          {isEditorOpen && (
            <div className="w-3/5">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <CardTitle className="text-base">
                    {editing ? `Modifier — ${editing.nom}` : "Nouveau template"}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={closeEditor}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Nom */}
                  <div>
                    <Label>Nom *</Label>
                    <Input
                      value={form.nom}
                      onChange={(e) => set("nom", e.target.value)}
                      placeholder="Ex : Relance TVA mensuelle"
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <Label>Type *</Label>
                    <Select value={form.type} onValueChange={(v) => set("type", v as TypeEmailTemplate)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_TYPES.map((t) => (
                          <SelectItem key={t} value={t}>
                            {TYPE_TEMPLATE_LABELS[t]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Variables cliquables */}
                  <div className="rounded-md bg-blue-50 border border-blue-100 p-3">
                    <p className="text-xs font-medium text-blue-700 mb-2">
                      Variables disponibles — cliquez pour insérer dans le champ actif
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {VARIABLES_EMAIL.map((v) => (
                        <button
                          key={v.value}
                          type="button"
                          onClick={() => insertVariable(v.value)}
                          className="inline-flex items-center px-2 py-1 rounded bg-white border border-blue-200 text-xs text-blue-700 hover:bg-blue-100 transition-colors font-mono"
                        >
                          {v.value}
                          <span className="ml-1 text-blue-400 font-sans">({v.label})</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sujet */}
                  <div>
                    <Label>Sujet *</Label>
                    <Input
                      ref={sujetRef}
                      value={form.sujet}
                      onChange={(e) => set("sujet", e.target.value)}
                      onFocus={() => setFocusedField("sujet")}
                      placeholder="Ex : Rappel TVA — {{mois_echeance}}"
                      className={focusedField === "sujet" ? "ring-2 ring-blue-300" : ""}
                    />
                  </div>

                  {/* Corps */}
                  <div>
                    <Label>Corps (HTML) *</Label>
                    <textarea
                      ref={corpsRef}
                      value={form.corps}
                      onChange={(e) => set("corps", e.target.value)}
                      onFocus={() => setFocusedField("corps")}
                      placeholder="<p>Bonjour {{dirigeant_prenom}},</p>..."
                      rows={10}
                      className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono resize-y focus:outline-none focus:ring-2 focus:ring-ring ${
                        focusedField === "corps" ? "ring-2 ring-blue-300" : ""
                      }`}
                    />
                  </div>

                  {/* Actif */}
                  <div className="flex items-center gap-3">
                    <input
                      id="actif"
                      type="checkbox"
                      checked={form.actif}
                      onChange={(e) => set("actif", e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <Label htmlFor="actif" className="cursor-pointer">Actif</Label>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    {editing && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(editing)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    )}
                    <div className="flex gap-2 ml-auto">
                      <Button variant="outline" onClick={closeEditor}>
                        Annuler
                      </Button>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {editing ? "Enregistrer" : "Créer"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
