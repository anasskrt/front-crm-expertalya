/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  MapPin,
  Calendar,
  FileText,
  User,
  X,
  BadgeEuro
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import FactureGestion from "../facture/FactureGestion";
import { Societe } from "@/data/data";
import { updateSociete } from "@/app/api/societe";

import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatsJuridiques, activitesPrincipales } from "@/data/mockData";
import { createTarif } from "@/app/api/tarif";
import SocieteDocuments from "../Document/Document";
import SocieteTaches from "../tache/TacheSociete";


interface SocieteDetailsProps {
  societe: Societe;
  isOpen: boolean;
  onClose: () => void;
  currentUserRole: number;
  isFullPage?: boolean;
}

const SocieteDetails = ({
  societe,
  isOpen,
  onClose,
  currentUserRole,
  isFullPage = false
}: SocieteDetailsProps) => {
  const [activeTab, setActiveTab] = useState("infos");
  const isAdmin = currentUserRole === 1;

  const renderOrNull = (value: any) =>
    value === null || value === undefined || value === "" ? "null" : value;

  const renderDate = (date: any) => {
    if (!date) return "null";
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return "null";
    }
  };

  const canManageFactures = true;

  const { toast } = useToast();

  // --- Édition des infos ---
  const [societeState, setSocieteState] = useState<Societe>(societe);


  const [isEditingInfos, setIsEditingInfos] = useState(false);
  const [savingInfos, setSavingInfos] = useState(false);
  const [infosDraft, setInfosDraft] = useState(() => ({
    name: societe.name ?? "",
    formeJuridique: (societe.formeJuridique as string) ?? "SAS",
    siret: societe.siret ?? "",
    rcs: societe.rcs ?? "",
    codeNaf: societe.codeNaf ?? "",
    siegeSocial: societe.siegeSocial ?? "",
    dirigeantPrenom: societe.dirigeantPrenom ?? "",
    dirigeantNom: societe.dirigeantNom ?? "",
    email: societe.email ?? "",
    telephone: societe.telephone ?? "",
    dateCloture1: societe.dateCloture1 ? new Date(societe.dateCloture1).toISOString().slice(0, 10) : "",
    dateSignatureMission: societe.dateSignatureMission ? new Date(societe.dateSignatureMission).toISOString().slice(0, 10) : "",
    dateRepriseMission: societe.dateRepriseMission ? new Date(societe.dateRepriseMission).toISOString().slice(0, 10) : "",
    regimeTva: (societe.regimeTva as string) ?? "",
    regimeImposition: (societe.regimeImposition as string) ?? "",
    activite: String(societe.activiteId),
    dateDebutFacturation: societe.dateDebutFacturation ? new Date(societe.dateDebutFacturation).toISOString().slice(0, 10) : "",

    responsable: societe.responsable ?? "",
    collaborateurCompta: societe.collaborateurCompta ?? "",
    collaborateurSocial: societe.collaborateurSocial ?? "",
    intervenant: societe.intervenant ?? "",
    frontOffice: societe.frontOffice ?? "",
    ancienEC: societe.ancienEC ?? "",
  }));

  const setDraft = <K extends keyof typeof infosDraft>(key: K, value: (typeof infosDraft)[K]) =>
    setInfosDraft(prev => ({ ...prev, [key]: value }));

  const handleSaveInfos = async () => {
    try {

      if (!isAdmin) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits pour modifier cette société.",
          variant: "destructive",
        });

        return;
      }

      setSavingInfos(true);

      const payload = {
        name: infosDraft.name.trim(),
        formeJuridique: infosDraft.formeJuridique,
        siret: infosDraft.siret.trim(),
        rcs: infosDraft.rcs.trim(),
        codeNaf: infosDraft.codeNaf.trim(),
        siegeSocial: infosDraft.siegeSocial.trim(),
        dirigeantPrenom: infosDraft.dirigeantPrenom.trim(),
        dirigeantNom: infosDraft.dirigeantNom.trim(),
        email: infosDraft.email.trim(),
        telephone: infosDraft.telephone.trim(),
        dateCloture1: infosDraft.dateCloture1 ? new Date(infosDraft.dateCloture1).toISOString() : null,
        dateSignatureMission: infosDraft.dateSignatureMission ? new Date(infosDraft.dateSignatureMission).toISOString() : null,
        dateRepriseMission: infosDraft.dateRepriseMission ? new Date(infosDraft.dateRepriseMission).toISOString() : null,
        regimeTva: infosDraft.regimeTva || null,
        regimeImposition: infosDraft.regimeImposition || null,
        activiteId: infosDraft.activite ? Number(infosDraft.activite) : null,
        dateDebutFacturation: infosDraft.dateDebutFacturation ? new Date(infosDraft.dateDebutFacturation).toISOString() : null,

        responsable: infosDraft.responsable.trim() || null,
        collaborateurCompta: infosDraft.collaborateurCompta.trim() || null,
        collaborateurSocial: infosDraft.collaborateurSocial.trim() || null,
        intervenant: infosDraft.intervenant.trim() || null,
        frontOffice: infosDraft.frontOffice.trim() || null,
        ancienEC: infosDraft.ancienEC.trim() || null,
      };

      const updatedFromApi = await updateSociete(societeState.id, payload);

      const next = (updatedFromApi && updatedFromApi.id)
        ? updatedFromApi
        : {
          ...societeState,
          ...payload,
          // Harmonise les undefined attendu par ton front
          dateCloture1: payload.dateCloture1 ?? undefined,
          dateSignatureMission: payload.dateSignatureMission ?? undefined,
          dateRepriseMission: payload.dateRepriseMission ?? undefined,
          dateDebutFacturation: payload.dateDebutFacturation ?? undefined,
          activiteId: payload.activiteId ?? societeState.activiteId,
        };

      // 🔁 Met à jour l’état affiché
      setSocieteState(next);

      setInfosDraft({
        name: next.name ?? "",
        formeJuridique: (next.formeJuridique as string) ?? "SAS",
        siret: next.siret ?? "",
        rcs: next.rcs ?? "",
        codeNaf: next.codeNaf ?? "",
        siegeSocial: next.siegeSocial ?? "",
        dirigeantPrenom: next.dirigeantPrenom ?? "",
        dirigeantNom: next.dirigeantNom ?? "",
        email: next.email ?? "",
        telephone: next.telephone ?? "",
        dateCloture1: next.dateCloture1 ? new Date(next.dateCloture1).toISOString().slice(0, 10) : "",
        dateSignatureMission: next.dateSignatureMission ? new Date(next.dateSignatureMission).toISOString().slice(0, 10) : "",
        dateRepriseMission: next.dateRepriseMission ? new Date(next.dateRepriseMission).toISOString().slice(0, 10) : "",
        regimeTva: (next.regimeTva as string) ?? "",
        regimeImposition: (next.regimeImposition as string) ?? "",
        activite: String(next.activiteId ?? ""),
        dateDebutFacturation: next.dateDebutFacturation ? new Date(next.dateDebutFacturation).toISOString().slice(0, 10) : "",
        responsable: next.responsable ?? "",
        collaborateurCompta: next.collaborateurCompta ?? "",
        collaborateurSocial: next.collaborateurSocial ?? "",
        intervenant: next.intervenant ?? "",
        frontOffice: next.frontOffice ?? "",
        ancienEC: next.ancienEC ?? "",
      });

      toast({ title: "Modifications enregistrées", description: "Les informations de la société ont été mises à jour." });
      setIsEditingInfos(false);
    } catch (e: any) {
      toast({
        title: "Erreur",
        description: e?.message || "Échec de la mise à jour.",
        variant: "destructive",
      });
    } finally {
      setSavingInfos(false);
    }
  };

  //tarif 
  const [tarifs, setTarifs] = useState((societe as any).tarifs || []);

  const [newTarif, setNewTarif] = useState({
    dateFacturation: "",
    montantCompta: "",
    montantSocial: "",
    montantRattrapage: "",
    montantAutres: "",
    dateDebut: "",
  });

  const handleNewTarifChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTarif((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitNewTarif = async (e: React.FormEvent) => {
    e.preventDefault();

    const nouveau = {
      id: Math.floor(Math.random() * 1000000),
      dateFacturation: newTarif.dateFacturation,
      montantCompta: Number(newTarif.montantCompta) || 0,
      montantSocial: Number(newTarif.montantSocial) || 0,
      montantRattrapage: Number(newTarif.montantRattrapage) || 0,
      montantAutres: Number(newTarif.montantAutres) || 0,
      actif: true,
      dateDebut: newTarif.dateDebut || "",
    };
    try {
      const created = await createTarif(societe.id, nouveau)

      const newTarifEntity = created && created.id ? created : nouveau;

      // Tous les anciens deviennent inactifs, on ajoute le nouveau actif
      setTarifs((prev: any[]) => {
        const updated = prev.map((t) => ({ ...t, actif: false }));
        // 🔹 Le nouveau tarif est ajouté en premier dans la liste
        return [newTarifEntity, ...updated];
      });

      setNewTarif({
        dateFacturation: "",
        montantCompta: "",
        montantSocial: "",
        montantRattrapage: "",
        montantAutres: "",
        dateDebut: "",
      });


      toast({
        title: "Tarif ajouté",
        description: `Le tarif ${nouveau.dateFacturation} a été ajouté.`,
      });

    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible d’ajouter le tarif.",
        variant: "destructive",
      });
    }
  };


  const renderContent = () => (
    <div className="w-full">
      {!isFullPage && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{renderOrNull(societe.name)}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="infos">Informations</TabsTrigger>
          {canManageFactures && <TabsTrigger value="factures">Factures</TabsTrigger>}
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="taches">Tâches</TabsTrigger>
        </TabsList>

        {/* Onglet Informations */}
        <TabsContent value="infos" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Informations générales
                </CardTitle>

                {isAdmin && (
                  <div className="flex gap-2">
                    {isEditingInfos ? (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // reset le draft depuis le prop
                            setInfosDraft({
                              name: societe.name ?? "",
                              formeJuridique: (societe.formeJuridique as string) ?? "SAS",
                              siret: societe.siret ?? "",
                              rcs: societe.rcs ?? "",
                              codeNaf: societe.codeNaf ?? "",
                              siegeSocial: societe.siegeSocial ?? "",
                              dirigeantPrenom: societe.dirigeantPrenom ?? "",
                              dirigeantNom: societe.dirigeantNom ?? "",
                              email: societe.email ?? "",
                              telephone: societe.telephone ?? "",
                              dateCloture1: societe.dateCloture1 ? new Date(societe.dateCloture1).toISOString().slice(0, 10) : "",
                              dateSignatureMission: societe.dateSignatureMission ? new Date(societe.dateSignatureMission).toISOString().slice(0, 10) : "",
                              dateRepriseMission: societe.dateRepriseMission ? new Date(societe.dateRepriseMission).toISOString().slice(0, 10) : "",
                              regimeTva: (societe.regimeTva as string) ?? "",
                              regimeImposition: (societe.regimeImposition as string) ?? "",
                              activite: (societe.activite?.id ?? 0).toString(),
                              dateDebutFacturation: societe.dateDebutFacturation ? new Date(societe.dateDebutFacturation).toISOString().slice(0, 10) : "",

                              responsable: societe.responsable ?? "",
                              collaborateurCompta: societe.collaborateurCompta ?? "",
                              collaborateurSocial: societe.collaborateurSocial ?? "",
                              intervenant: societe.intervenant ?? "",
                              frontOffice: societe.frontOffice ?? "",
                              ancienEC: societe.ancienEC ?? "",
                            });
                            setIsEditingInfos(false);
                          }}
                        >
                          Annuler
                        </Button>
                        <Button onClick={handleSaveInfos} disabled={savingInfos}>
                          {savingInfos ? "Sauvegarde..." : "Sauvegarder"}
                        </Button>
                      </>
                    ) : (
                      <Button variant="outline" onClick={() =>  setIsEditingInfos(true) }>
                        Modifier
                      </Button>

                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="font-medium text-gray-700">Dénomination sociale</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.name} onChange={e => setDraft("name", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societe.name)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Forme juridique</label>
                  {isEditingInfos ? (
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={infosDraft.formeJuridique}
                      onChange={(e) => setDraft("formeJuridique", e.target.value)}
                    >
                      {formatsJuridiques.map((f) => (
                        <option key={f.id} value={f.format}>
                          {f.format}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <Badge variant="outline">{renderOrNull(societe.formeJuridique)}</Badge>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">SIRET</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.siret} onChange={e => setDraft("siret", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societe.siret)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">RCS</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.rcs} onChange={e => setDraft("rcs", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societe.rcs)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Code NAF</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.codeNaf} onChange={e => setDraft("codeNaf", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societe.codeNaf)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Activité</label>
                  {isEditingInfos ? (
                    <select
                      className="w-full rounded-md border px-3 py-2 text-sm"
                      value={infosDraft.activite}
                      onChange={(e) => setDraft("activite", e.target.value)}
                    >
                      {activitesPrincipales.map((a) => (
                        <option key={a.id} value={String(a.id)}>
                          {a.libelle}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="text-gray-900">
                      {activitesPrincipales.find(a => a.id === societe.activiteId)?.libelle ?? "—"}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Date de création</label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{renderDate(societe.dateCreation)}</p>
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Date de clôture</label>
                  <div className="flex items-center gap-1">
                    {isEditingInfos ? (
                      <Input type="date" value={infosDraft.dateCloture1} onChange={e => setDraft("dateCloture1", e.target.value)} />
                    ) : (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{renderDate(societe.dateCloture1)}</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="font-medium text-gray-700">Date signature mission</label>

                  {isEditingInfos ? (
                    <Input type="date" value={infosDraft.dateSignatureMission} onChange={e => setDraft("dateSignatureMission", e.target.value)} />
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{renderDate(societe.dateSignatureMission)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Date reprise mission</label>

                  {isEditingInfos ? (
                    <Input type="date" value={infosDraft.dateRepriseMission} onChange={e => setDraft("dateRepriseMission", e.target.value)} />
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{renderDate(societe.dateRepriseMission)}</p>
                    </div>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Régime TVA</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.regimeTva} onChange={e => setDraft("regimeTva", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societe.regimeTva)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Régime imposition</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.regimeImposition} onChange={e => setDraft("regimeImposition", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societe.regimeImposition)}</p>
                  )}
                </div>

                <div>
                  <label className="font-medium text-gray-700">Date début de la facturation</label>

                  {isEditingInfos ? (
                    <Input type="date" value={infosDraft.dateDebutFacturation} onChange={e => setDraft("dateDebutFacturation", e.target.value)} />
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{renderDate(societe.dateDebutFacturation)}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          {/* Adresse */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse du siège social
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditingInfos ? (
                <Input value={infosDraft.siegeSocial} onChange={e => setDraft("siegeSocial", e.target.value)} />
              ) : (
                <p className="text-gray-900">{renderOrNull(societe.siegeSocial)}</p>
              )}
            </CardContent>
          </Card>
          {/* Dirigeant */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Dirigeant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div>
                <label className="font-medium text-gray-700">Nom complet</label>
                {isEditingInfos ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <Input placeholder="Prénom" value={infosDraft.dirigeantPrenom} onChange={e => setDraft("dirigeantPrenom", e.target.value)} />
                    <Input placeholder="Nom" value={infosDraft.dirigeantNom} onChange={e => setDraft("dirigeantNom", e.target.value)} />
                  </div>
                ) : (
                  <p className="text-gray-900">
                    {renderOrNull(societe.dirigeantPrenom)} {renderOrNull(societe.dirigeantNom)}
                  </p>
                )}
              </div>
              <div>
                <label className="font-medium text-gray-700">Email</label>
                {isEditingInfos ? (
                  <Input type="email" value={infosDraft.email} onChange={e => setDraft("email", e.target.value)} />
                ) : (
                  <p className="text-gray-900">{renderOrNull(societe.email)}</p>
                )}
              </div>
              <div>
                <label className="font-medium text-gray-700">Téléphone</label>
                {isEditingInfos ? (
                  <Input value={infosDraft.telephone} onChange={e => setDraft("telephone", e.target.value)} />
                ) : (
                  <p className="text-gray-900">{renderOrNull(societe.telephone)}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* info cabinet */}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Information cabinet
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="">
                  <label className="font-medium text-gray-700">Responsable</label>
                  {isEditingInfos ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input placeholder="Responsable" value={infosDraft.responsable} onChange={e => setDraft("responsable", e.target.value)} />
                    </div>
                  ) : (
                    <p className="text-gray-900">
                      {renderOrNull(societe.responsable)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Front Office</label>
                  {isEditingInfos ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input placeholder="Front Office" value={infosDraft.frontOffice} onChange={e => setDraft("frontOffice", e.target.value)} />
                    </div>
                  ) : (
                    <p className="text-gray-900">
                      {renderOrNull(societe.frontOffice)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Collaborateur Comptable</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.collaborateurCompta} onChange={e => setDraft("collaborateurCompta", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societe.collaborateurCompta)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Collaborateur Social</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.collaborateurSocial} onChange={e => setDraft("collaborateurSocial", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societe.collaborateurSocial)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Intervenant</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.intervenant} onChange={e => setDraft("intervenant", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societe.intervenant)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Ancien E.C.</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.ancienEC} onChange={e => setDraft("ancienEC", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societe.ancienEC)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tarifaction */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BadgeEuro className="h-5 w-5" />
                Tarification
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Liste des tarifs liés */}
              <div>
                <h4 className="text-base font-semibold mb-3">Historique des tarifs</h4>

                {tarifs.length > 0 ? (
                  <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
                    <div className="max-h-[360px] overflow-auto">
                      <table className="min-w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50/95 backdrop-blur supports-[backdrop-filter]:bg-gray-50/75 border-b">
                          <tr className="text-left text-gray-600">
                            <th className="py-2.5 px-3 font-medium">Intitulé</th>
                            <th className="py-2.5 px-3 font-medium">Date début</th>
                            <th className="py-2.5 px-3 font-medium text-right">Compta (€)</th>
                            <th className="py-2.5 px-3 font-medium text-right">Social (€)</th>
                            <th className="py-2.5 px-3 font-medium text-right">Rattrapage (€)</th>
                            <th className="py-2.5 px-3 font-medium text-right">Autres (€)</th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100">
                          {[...tarifs].map((t: any) => {
                            const isActive = !!t.actif;
                            return (
                              <tr
                                key={t.id}
                                className={[
                                  "transition-colors",
                                  "hover:bg-emerald-50/40",
                                  isActive ? "bg-emerald-50 ring-1 ring-emerald-200/60" : "",
                                ].join(" ")}
                              >
                                <td className="py-2.5 px-3 font-medium text-gray-800">
                                  <span className="inline-flex items-center gap-2">
                                    {t.dateFacturation}
                                    {isActive && (
                                      <span className="text-[11px] inline-flex items-center rounded-full bg-emerald-100 text-emerald-800 px-2 py-0.5">
                                        Actif
                                      </span>
                                    )}
                                  </span>
                                </td>

                                {/* ✅ corrige le <p> en <td> */}
                                <td className="py-2.5 px-3 text-gray-700">
                                  {renderDate(t.dateDebut)}
                                </td>

                                <td className="py-2.5 px-3 text-right tabular-nums font-medium text-gray-900">
                                  {t.montantCompta} €
                                </td>
                                <td className="py-2.5 px-3 text-right tabular-nums font-medium text-gray-900">
                                  {t.montantSocial} €
                                </td>
                                <td className="py-2.5 px-3 text-right tabular-nums text-gray-800">
                                  {t.montantRattrapage} €
                                </td>
                                <td className="py-2.5 px-3 text-right tabular-nums text-gray-800">
                                  {t.montantAutres} €
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm text-gray-600 bg-gray-50">
                    Aucun tarif enregistré pour cette société.
                  </div>
                )}
              </div>


              {/* Formulaire d’ajout d’un nouveau tarif */}
              <form onSubmit={handleSubmitNewTarif}>
                <div className="rounded-xl border p-4 md:p-5 bg-gray-50">
                  <h4 className="text-sm font-semibold mb-4">Ajouter un nouveau tarif</h4>

                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-4">
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label htmlFor="dateFacturation" className="text-sm text-gray-700">
                        Intitulé facture
                      </label>
                      <input
                        type="text"
                        name="dateFacturation"
                        id="dateFacturation"
                        placeholder="ex: 2025 - janvier à février"
                        value={newTarif.dateFacturation}
                        onChange={handleNewTarifChange}
                        className="input focus-visible:ring-2 focus-visible:ring-emerald-500"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="montantCompta" className="text-sm text-gray-700">Tarif compta</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        name="montantCompta"
                        id="montantCompta"
                        placeholder="ex: 100"
                        value={newTarif.montantCompta}
                        onChange={handleNewTarifChange}
                        className="input focus-visible:ring-2 focus-visible:ring-emerald-500 text-right tabular-nums"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="montantSocial" className="text-sm text-gray-700">Tarif social</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        name="montantSocial"
                        id="montantSocial"
                        placeholder="ex: 100"
                        value={newTarif.montantSocial}
                        onChange={handleNewTarifChange}
                        className="input focus-visible:ring-2 focus-visible:ring-emerald-500 text-right tabular-nums"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="montantRattrapage" className="text-sm text-gray-700">Rattrapage</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        name="montantRattrapage"
                        id="montantRattrapage"
                        placeholder="ex: 100"
                        value={newTarif.montantRattrapage}
                        onChange={handleNewTarifChange}
                        className="input focus-visible:ring-2 focus-visible:ring-emerald-500 text-right tabular-nums"
                      />
                    </div>

                    <div className="flex flex-col gap-1">
                      <label htmlFor="montantAutres" className="text-sm text-gray-700">Autres</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.01"
                        name="montantAutres"
                        id="montantAutres"
                        placeholder="ex: 100"
                        value={newTarif.montantAutres}
                        onChange={handleNewTarifChange}
                        className="input focus-visible:ring-2 focus-visible:ring-emerald-500 text-right tabular-nums"
                      />
                    </div>

                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label htmlFor="dateDebut" className="text-sm text-gray-700">Date début</label>
                      <input
                        type="date"
                        name="dateDebut"
                        id="dateDebut"
                        value={newTarif.dateDebut}
                        onChange={handleNewTarifChange}
                        className="input focus-visible:ring-2 focus-visible:ring-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                      Ajouter le tarif
                    </Button>
                  </div>
                </div>
              </form>



            </CardContent>
          </Card>

        </TabsContent>

        {/* Onglet Factures */}
        {canManageFactures && (
          <TabsContent value="factures">
            <FactureGestion societeId={societe.id} />
          </TabsContent>
        )}

        {/* Onglet Documents */}
        <TabsContent value="documents" className="space-y-4">
          <SocieteDocuments societeId={societe.id} />
        </TabsContent>


        {/* Onglet Tache */}
        <TabsContent value="taches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Tâches liées à la société
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SocieteTaches societeId={societe.id} />
            </CardContent>
          </Card>
        </TabsContent>



      </Tabs>
    </div>
  );

  if (isFullPage) {
    return renderContent();
  }
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default SocieteDetails;
