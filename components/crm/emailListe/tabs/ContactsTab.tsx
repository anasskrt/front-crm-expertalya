"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Loader2, Plus, Trash2 } from "lucide-react";
import { EmailListeContact, AddContactDto, addContactToListe, removeContactFromListe } from "@/lib/api/emailListe";
import { apiGet } from "@/lib/api";
import { SocieteShort } from "../types";

interface Props {
  listeId: number;
  contacts: EmailListeContact[];
  societes: SocieteShort[];
  onRefresh: () => void;
  onCountChange: (delta: number) => void;
}

export default function ContactsTab({ listeId, contacts, societes, onRefresh, onCountChange }: Props) {
  const { toast } = useToast();

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<AddContactDto>({ email: "", nom: "", societeId: undefined });
  const [saving, setSaving] = useState(false);
  const [loadingSociete, setLoadingSociete] = useState(false);

  const openModal = () => {
    setForm({ email: "", nom: "", societeId: undefined });
    setOpen(true);
  };

  const handleSocieteSelect = async (value: string) => {
    if (value === "none") {
      setForm({ email: "", nom: "", societeId: undefined });
      return;
    }
    const id = Number(value);
    const societe = societes.find((s) => s.id === id);
    const nomAuto = societe
      ? [societe.dirigeantNom, societe.dirigeantPrenom].filter(Boolean).join(" ").trim() || societe.name
      : "";
    setForm((p) => ({ ...p, societeId: id, nom: nomAuto, email: "" }));

    setLoadingSociete(true);
    try {
      const detail = await apiGet<{ email?: string }>(`/societe/${id}`);
      setForm((p) => ({ ...p, email: detail.email ?? "" }));
    } catch {
      // l'utilisateur saisit manuellement
    } finally {
      setLoadingSociete(false);
    }
  };

  const handleAdd = async () => {
    if (!form.email.trim()) {
      toast({ title: "L'email est obligatoire", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await addContactToListe(listeId, {
        email: form.email,
        nom: form.nom || undefined,
        societeId: form.societeId,
      });
      setOpen(false);
      onRefresh();
      onCountChange(1);
      toast({ title: "Contact ajouté" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ajouter le contact.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (contact: EmailListeContact) => {
    if (!confirm(`Retirer ${contact.email} de la liste ?`)) return;
    try {
      await removeContactFromListe(listeId, contact.id);
      onRefresh();
      onCountChange(-1);
      toast({ title: "Contact retiré" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de retirer le contact.", variant: "destructive" });
    }
  };

  return (
    <>
      <div className="flex justify-end mb-3">
        <Button size="sm" onClick={openModal}>
          <Plus className="h-4 w-4 mr-1" />
          Ajouter un contact
        </Button>
      </div>

      {contacts.length === 0 ? (
        <p className="text-center text-gray-500 py-6 text-sm">Aucun contact dans cette liste</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-gray-500">
                <th className="pb-2 font-medium">Email</th>
                <th className="pb-2 font-medium">Nom</th>
                <th className="pb-2 font-medium">Société</th>
                <th className="pb-2 font-medium">Ajouté le</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {contacts.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="py-2 pr-3">{c.email}</td>
                  <td className="py-2 pr-3 text-gray-600">{c.nom ?? "—"}</td>
                  <td className="py-2 pr-3 text-gray-600">{c.societe?.name ?? "—"}</td>
                  <td className="py-2 pr-3 text-gray-500 whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="py-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(c)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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
            <DialogTitle>Ajouter un contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Société</Label>
              <Select
                value={form.societeId ? String(form.societeId) : "none"}
                onValueChange={handleSocieteSelect}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner une société..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Aucune société —</SelectItem>
                  {societes.map((s) => (
                    <SelectItem key={s.id} value={String(s.id)}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400 mt-1">
                L&apos;email et le nom seront pré-remplis automatiquement.
              </p>
            </div>

            <div>
              <Label>Email *</Label>
              <div className="relative">
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="contact@exemple.fr"
                  disabled={loadingSociete}
                  className={loadingSociete ? "pr-9 opacity-60" : ""}
                />
                {loadingSociete && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                )}
              </div>
            </div>

            <div>
              <Label>Nom</Label>
              <Input
                value={form.nom ?? ""}
                onChange={(e) => setForm((p) => ({ ...p, nom: e.target.value }))}
                placeholder="Nom du contact (optionnel)"
                disabled={loadingSociete}
                className={loadingSociete ? "opacity-60" : ""}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
            <Button onClick={handleAdd} disabled={saving || loadingSociete}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
