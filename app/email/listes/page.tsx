"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navigation from "@/components/crm/Navigation";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import {
  EmailListeSummary,
  EmailListe,
  EmailListeRegle,
  getAllEmailListes,
  getEmailListeDetail,
  getRegles,
} from "@/lib/api/emailListe";
import { EmailTemplate, getTemplates } from "@/lib/api/email";
import { apiGet } from "@/lib/api";
import { SocieteShort } from "@/components/crm/emailListe/types";
import EmailListePanel from "@/components/crm/emailListe/EmailListePanel";
import EmailListeDetail from "@/components/crm/emailListe/EmailListeDetail";

export default function EmailListesPage() {
  const { toast } = useToast();
  const { currentUser } = useUser();
  const router = useRouter();

  // Garde admin
  useEffect(() => {
    if (currentUser !== undefined && currentUser?.role !== 1) {
      router.replace("/");
    }
  }, [currentUser, router]);

  // --- État global ---
  const [listes, setListes] = useState<EmailListeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [societes, setSocietes] = useState<SocieteShort[]>([]);

  // --- Détail sélectionné ---
  const [selectedListe, setSelectedListe] = useState<EmailListe | null>(null);
  const [regles, setRegles] = useState<EmailListeRegle[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Chargement initial
  useEffect(() => {
    Promise.all([
      getAllEmailListes(),
      getTemplates(),
      apiGet<SocieteShort[]>("/societe/short"),
    ])
      .then(([l, t, s]) => {
        setListes(l);
        setTemplates(t);
        setSocietes(s);
      })
      .catch(() => toast({ title: "Erreur de chargement", variant: "destructive" }))
      .finally(() => setLoading(false));
  }, [toast]);

  // Chargement du détail + règles en parallèle
  const loadDetail = useCallback(
    async (id: number) => {
      setLoadingDetail(true);
      try {
        const [detail, reglesList] = await Promise.all([
          getEmailListeDetail(id),
          getRegles(id),
        ]);
        setSelectedListe(detail);
        setRegles(reglesList);
      } catch {
        toast({ title: "Erreur", description: "Impossible de charger le détail.", variant: "destructive" });
      } finally {
        setLoadingDetail(false);
      }
    },
    [toast]
  );

  const refreshDetail = useCallback(() => {
    if (selectedListe) loadDetail(selectedListe.id);
  }, [selectedListe, loadDetail]);

  // --- Callbacks vers EmailListePanel ---
  const handleListeCreated = (l: EmailListeSummary) => setListes((prev) => [...prev, l]);

  const handleListeUpdated = (l: EmailListeSummary) => {
    setListes((prev) => prev.map((x) => (x.id === l.id ? l : x)));
    setSelectedListe((prev) => (prev?.id === l.id ? { ...prev, ...l } : prev));
  };

  const handleListeDeleted = (id: number) => {
    setListes((prev) => prev.filter((x) => x.id !== id));
    if (selectedListe?.id === id) setSelectedListe(null);
  };

  // --- Callback vers EmailListeDetail ---
  const handleCountChange = (delta: number) => {
    if (!selectedListe) return;
    setListes((prev) =>
      prev.map((l) =>
        l.id === selectedListe.id
          ? { ...l, _count: { contacts: l._count.contacts + delta } }
          : l
      )
    );
  };

  if (currentUser === undefined || (currentUser && currentUser.role !== 1)) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Listes de diffusion</h1>
          <p className="text-gray-500 mt-1">Gérez vos listes email et planifiez des envois</p>
        </div>

        <Navigation />

        <div className="flex gap-6 items-start">
          <EmailListePanel
            listes={listes}
            loading={loading}
            selectedId={selectedListe?.id ?? null}
            hasDetail={selectedListe !== null}
            onSelect={loadDetail}
            onListeCreated={handleListeCreated}
            onListeUpdated={handleListeUpdated}
            onListeDeleted={handleListeDeleted}
          />

          {selectedListe && (
            <div className="w-3/5">
              <EmailListeDetail
                liste={selectedListe}
                regles={regles}
                loading={loadingDetail}
                templates={templates}
                societes={societes}
                onClose={() => setSelectedListe(null)}
                onRefresh={refreshDetail}
                onCountChange={handleCountChange}
                onReglesChange={setRegles}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
