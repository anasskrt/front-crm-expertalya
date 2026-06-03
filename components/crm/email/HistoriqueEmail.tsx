"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Mail, Send, List, Plus, Trash2 } from "lucide-react";
import {
  EmailHistorique,
  EmailTemplate,
  StatutEmail,
  TYPE_TEMPLATE_LABELS,
  getHistoriqueEmails,
  getTemplates,
  sendEmail,
} from "@/lib/api/email";
import {
  EmailListeSummary,
  SocieteListeSummary,
  getAllEmailListes,
  getListesBySociete,
  addContactToListe,
  removeContactFromListe,
} from "@/lib/api/emailListe";
import { useUser } from "@/context/UserContext";

interface HistoriqueEmailProps {
  societeId: number;
  societeEmail: string;
  societeName?: string;
}

const STATUT_CONFIG: Record<StatutEmail, { label: string; className: string }> = {
  ENVOYE:     { label: "Envoyé",     className: "bg-green-100 text-green-700" },
  ECHEC:      { label: "Échec",      className: "bg-red-100 text-red-700" },
  EN_ATTENTE: { label: "En attente", className: "bg-gray-100 text-gray-600" },
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoriqueEmail({ societeId, societeEmail, societeName }: HistoriqueEmailProps) {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const isAdmin = currentUser?.role === 1;

  // Données
  const [historique, setHistorique] = useState<EmailHistorique[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [listesAppartenance, setListesAppartenance] = useState<SocieteListeSummary[]>([]);
  const [toutesListes, setToutesListes] = useState<EmailListeSummary[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal envoi direct
  const [sendModal, setSendModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [destinataire, setDestinataire] = useState(societeEmail);
  const [sending, setSending] = useState(false);

  // Modal ajout à une liste
  const [ajoutListeModal, setAjoutListeModal] = useState(false);
  const [selectedListeId, setSelectedListeId] = useState("");
  const [emailContact, setEmailContact] = useState(societeEmail);
  const [savingAjout, setSavingAjout] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [hist, tpls, appartenance, listes] = await Promise.all([
        getHistoriqueEmails(societeId),
        getTemplates(),
        getListesBySociete(societeId),
        getAllEmailListes(),
      ]);
      setHistorique(hist);
      setTemplates(tpls.filter((t) => t.actif));
      setListesAppartenance(appartenance);
      setToutesListes(listes);
    } catch {
      toast({ title: "Erreur", description: "Impossible de charger les données email.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }, [societeId, toast]);

  useEffect(() => { load(); }, [load]);

  // Listes disponibles = toutes les listes dont la société n'est pas encore membre
  const listesDisponibles = toutesListes.filter(
    (l) => !listesAppartenance.some((a) => a.listeId === l.id)
  );

  // --- Envoi direct ---
  const openSendModal = () => {
    setSelectedTemplateId("");
    setDestinataire(societeEmail);
    setSendModal(true);
  };

  const handleSend = async () => {
    if (!selectedTemplateId) return;
    setSending(true);
    try {
      await sendEmail({
        templateId: Number(selectedTemplateId),
        societeId,
        destinataire: destinataire.trim() || undefined,
      });
      const updated = await getHistoriqueEmails(societeId);
      setHistorique(updated);
      setSendModal(false);
      toast({ title: "Email envoyé" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'envoyer l'email.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  // --- Ajout à une liste ---
  const openAjoutModal = () => {
    setSelectedListeId("");
    setEmailContact(societeEmail);
    setAjoutListeModal(true);
  };

  const handleAjouterAListe = async () => {
    if (!selectedListeId || !emailContact.trim()) {
      toast({ title: "Liste et email obligatoires", variant: "destructive" });
      return;
    }
    setSavingAjout(true);
    try {
      await addContactToListe(Number(selectedListeId), {
        email: emailContact.trim(),
        nom: societeName,
        societeId,
      });
      const updated = await getListesBySociete(societeId);
      setListesAppartenance(updated);
      setAjoutListeModal(false);
      toast({ title: "Société ajoutée à la liste" });
    } catch {
      toast({ title: "Erreur", description: "Impossible d'ajouter à la liste.", variant: "destructive" });
    } finally {
      setSavingAjout(false);
    }
  };

  // --- Retrait d'une liste ---
  const handleRetirerDeListe = async (entry: SocieteListeSummary) => {
    if (!confirm(`Retirer cette société de la liste "${entry.listeTitre}" ?`)) return;
    try {
      await removeContactFromListe(entry.listeId, entry.contactId);
      setListesAppartenance((prev) => prev.filter((a) => a.listeId !== entry.listeId));
      toast({ title: "Société retirée de la liste" });
    } catch {
      toast({ title: "Erreur", description: "Impossible de retirer de la liste.", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* --- Section : Listes de diffusion --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <List className="h-5 w-5" />
            Listes de diffusion
            <Badge variant="outline" className="text-xs ml-1">
              {listesAppartenance.length}
            </Badge>
          </CardTitle>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              onClick={openAjoutModal}
              disabled={listesDisponibles.length === 0}
              title={listesDisponibles.length === 0 ? "Cette société est déjà dans toutes les listes" : undefined}
            >
              <Plus className="h-4 w-4 mr-1" />
              Ajouter à une liste
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {listesAppartenance.length === 0 ? (
            <p className="text-gray-500 text-center py-6 text-sm">
              Cette société n&apos;appartient à aucune liste de diffusion
            </p>
          ) : (
            <div className="divide-y">
              {listesAppartenance.map((entry) => (
                <div key={entry.listeId} className="px-4 py-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-sm">{entry.listeTitre}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{entry.contactEmail}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className={`text-xs ${entry.listeActif ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}
                    >
                      {entry.listeActif ? "Active" : "Inactive"}
                    </Badge>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRetirerDeListe(entry)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Retirer de la liste"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* --- Section : Historique emails --- */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Mail className="h-5 w-5" />
            Historique des emails
            <Badge variant="outline" className="text-xs ml-1">
              {historique.length}
            </Badge>
          </CardTitle>
          {isAdmin && (
            <Button size="sm" onClick={openSendModal}>
              <Send className="h-4 w-4 mr-1" />
              Envoyer un email
            </Button>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {historique.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">
              Aucun email envoyé pour cette société
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Template</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Destinataire</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Statut</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-500">Déclencheur</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {historique.map((entry) => (
                    <tr key={entry.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDate(entry.envoyeAt ?? entry.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{entry.template.nom}</p>
                        <p className="text-xs text-gray-400">
                          {TYPE_TEMPLATE_LABELS[entry.template.type as keyof typeof TYPE_TEMPLATE_LABELS] ?? entry.template.type}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{entry.destinataire}</td>
                      <td className="px-4 py-3">
                        <Badge className={STATUT_CONFIG[entry.statut].className}>
                          {STATUT_CONFIG[entry.statut].label}
                        </Badge>
                        {entry.erreur && (
                          <p className="text-xs text-red-500 mt-1">{entry.erreur}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className="text-xs">
                          {entry.declencheur === "MANUEL" ? "Manuel" : "Automatique"}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal — Envoyer un email */}
      <Dialog open={sendModal} onOpenChange={(open) => !open && setSendModal(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Envoyer un email</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <Label>Template *</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir un template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>
                      <span className="font-medium">{t.nom}</span>
                      <span className="ml-2 text-xs text-gray-400">{TYPE_TEMPLATE_LABELS[t.type]}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Destinataire</Label>
              <Input
                type="email"
                value={destinataire}
                onChange={(e) => setDestinataire(e.target.value)}
                placeholder={societeEmail || "email@exemple.fr"}
              />
              <p className="text-xs text-gray-400 mt-1">
                Laissez vide pour utiliser l&apos;email de la société.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendModal(false)}>Annuler</Button>
            <Button onClick={handleSend} disabled={sending || !selectedTemplateId}>
              {sending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal — Ajouter à une liste */}
      <Dialog open={ajoutListeModal} onOpenChange={(open) => !open && setAjoutListeModal(false)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter à une liste de diffusion</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1">
            <div>
              <Label>Liste *</Label>
              <Select value={selectedListeId} onValueChange={setSelectedListeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une liste..." />
                </SelectTrigger>
                <SelectContent>
                  {listesDisponibles.map((l) => (
                    <SelectItem key={l.id} value={String(l.id)}>
                      <span className="font-medium">{l.titre}</span>
                      <span className="ml-2 text-xs text-gray-400">
                        {l._count.contacts} contact{l._count.contacts !== 1 ? "s" : ""}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Email de contact *</Label>
              <Input
                type="email"
                value={emailContact}
                onChange={(e) => setEmailContact(e.target.value)}
                placeholder="email@exemple.fr"
              />
              <p className="text-xs text-gray-400 mt-1">
                Email utilisé pour cette société dans la liste.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAjoutListeModal(false)}>Annuler</Button>
            <Button onClick={handleAjouterAListe} disabled={savingAjout || !selectedListeId}>
              {savingAjout && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
