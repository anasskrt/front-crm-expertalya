/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building,
  MapPin,
  Calendar,
  User,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import { Societe } from "@/data/data";
import { apiPatch } from "@/lib/api";

import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { formatsJuridiques } from "@/data/mockData";
import { getAllActivites, Activite } from "@/lib/api/activite";
import SocieteDocuments from "../Document/Document";
import ExerciceSociete from "../exercice/ExerciceSociete";
import { Label } from "@/components/ui/label";


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
    value === null || value === undefined || value === "" ? "Non renseigné" : value;

  const renderDate = (date: any) => {
    if (!date) return "Non renseignée";
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return "Non renseignée";
    }
  };

  const { toast } = useToast();

  // --- Édition des infos ---
  const [societeState, setSocieteState] = useState<Societe>(societe);
  useEffect(() => {
    console.log("[SocieteDetails] societe chargée :", societe);
  }, [societe]);


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
    dateSignatureMission: societe.dateSignatureMission ? new Date(societe.dateSignatureMission).toISOString().slice(0, 10) : "",
    dateRepriseMission: societe.dateRepriseMission ? new Date(societe.dateRepriseMission).toISOString().slice(0, 10) : "",
    regimeTva: (societe.regimeTva as string) ?? "",
    regimeImposition: (societe.regimeImposition as string) ?? "",
    activite: String(societe.activiteId),
    dateDebutFacturation: societe.dateDebutFacturation ? new Date(societe.dateDebutFacturation).toISOString().slice(0, 10) : "",

    frontOffice: societe.frontOffice ?? "",
    ancienEC: societe.ancienEC ?? "",
    iban: societe.iban ?? "",
    bic: societe.bic ?? "",
  }));

  const setDraft = <K extends keyof typeof infosDraft>(key: K, value: (typeof infosDraft)[K]) =>
    setInfosDraft(prev => ({ ...prev, [key]: value }));

  const [editErrors, setEditErrors] = useState<Record<string, string>>({});

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isSiret = (v: string) => /^\d{14}$/.test(v.replace(/\s/g, ""));
  const isNotEmpty = (v?: string | number) =>
    v !== undefined && v !== null && String(v).trim().length > 0;

  const validateEdit = () => {
    const e: Record<string, string> = {};
    if (!isNotEmpty(infosDraft.name)) e.name = "Obligatoire";
    if (!isSiret(infosDraft.siret)) e.siret = "SIRET : 14 chiffres";
    if (!isNotEmpty(infosDraft.dirigeantPrenom)) e.dirigeantPrenom = "Obligatoire";
    if (!isNotEmpty(infosDraft.dirigeantNom)) e.dirigeantNom = "Obligatoire";
    if (!isNotEmpty(infosDraft.telephone)) e.telephone = "Obligatoire";
    if (!isEmail(infosDraft.email)) e.email = "Email invalide";
    if (!isNotEmpty(infosDraft.siegeSocial)) e.siegeSocial = "Obligatoire";
    if (!isNotEmpty(infosDraft.rcs)) e.rcs = "Obligatoire";
    if (!isNotEmpty(infosDraft.codeNaf)) e.codeNaf = "Obligatoire";
    if (!isNotEmpty(infosDraft.activite)) e.activite = "Obligatoire";
    return e;
  };

  // États pour les activités
  const [activites, setActivites] = useState<Activite[]>([]);
  const [activiteSearch, setActiviteSearch] = useState("");
  const [showActiviteDropdown, setShowActiviteDropdown] = useState(false);
  const activiteRef = useRef<HTMLDivElement>(null);

  // Charger les activités depuis l'API
  useEffect(() => {
    getAllActivites()
      .then((data) => {
        const sorted = data.sort((a, b) => a.name.localeCompare(b.name));
        setActivites(sorted);
      })
      .catch(() => {
        // Silencieux en cas d'erreur
      });
  }, []);

  // Fermer le dropdown si clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activiteRef.current && !activiteRef.current.contains(event.target as Node)) {
        setShowActiviteDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filtrer les activités selon la recherche
  const filteredActivites = activites.filter((a) =>
    a.name.toLowerCase().includes(activiteSearch.toLowerCase())
  );

  // Obtenir le nom de l'activité sélectionnée
  const selectedActiviteName = activites.find((a) => a.id === Number(infosDraft.activite))?.name || "";
  const displayActiviteName = activites.find((a) => a.id === societeState.activiteId)?.name || "—";

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

      const v = validateEdit();
      if (Object.keys(v).length > 0) {
        setEditErrors(v);
        toast({
          title: "Formulaire incomplet",
          description: "Merci de corriger les champs en rouge.",
          variant: "destructive",
        });
        return;
      }
      setEditErrors({});

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
        dateSignatureMission: infosDraft.dateSignatureMission ? new Date(infosDraft.dateSignatureMission).toISOString() : null,
        dateRepriseMission: infosDraft.dateRepriseMission ? new Date(infosDraft.dateRepriseMission).toISOString() : null,
        regimeTva: infosDraft.regimeTva || null,
        regimeImposition: infosDraft.regimeImposition || null,
        activiteId: infosDraft.activite ? Number(infosDraft.activite) : null,
        dateDebutFacturation: infosDraft.dateDebutFacturation ? new Date(infosDraft.dateDebutFacturation).toISOString() : null,

        frontOffice: infosDraft.frontOffice.trim() || null,
        ancienEC: infosDraft.ancienEC.trim() || null,
        iban: infosDraft.iban.trim() || null,
        bic: infosDraft.bic.trim() || null,
      };
      console.log("Payload envoyé à l'API :", payload);

      const updatedFromApi = await apiPatch<Societe>(`/societe/${societeState.id}`, payload);

      const next = (updatedFromApi && updatedFromApi.id)
        ? updatedFromApi
        : {
          ...societeState,
          ...payload,
          // Harmonise les undefined attendu par ton front
          dateSignatureMission: payload.dateSignatureMission ?? undefined,
          dateRepriseMission: payload.dateRepriseMission ?? undefined,
          dateDebutFacturation: payload.dateDebutFacturation ?? undefined,
          activiteId: payload.activiteId ?? societeState.activiteId,
          iban: payload.iban ?? societeState.iban,
          bic: payload.bic ?? societeState.bic,
        } as Societe;

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
        dateSignatureMission: next.dateSignatureMission ? new Date(next.dateSignatureMission).toISOString().slice(0, 10) : "",
        dateRepriseMission: next.dateRepriseMission ? new Date(next.dateRepriseMission).toISOString().slice(0, 10) : "",
        regimeTva: (next.regimeTva as string) ?? "",
        regimeImposition: (next.regimeImposition as string) ?? "",
        activite: String(next.activiteId ?? ""),
        dateDebutFacturation: next.dateDebutFacturation ? new Date(next.dateDebutFacturation).toISOString().slice(0, 10) : "",
        frontOffice: next.frontOffice ?? "",
        ancienEC: next.ancienEC ?? "",
        iban: next.iban ?? "",
        bic: next.bic ?? "",
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

  const renderContent = () => (
    <div className="w-full">
      {!isFullPage && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">{renderOrNull(societeState.name)}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="infos">Informations</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="exercices">Exercices</TabsTrigger>
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
                              dateSignatureMission: societe.dateSignatureMission ? new Date(societe.dateSignatureMission).toISOString().slice(0, 10) : "",
                              dateRepriseMission: societe.dateRepriseMission ? new Date(societe.dateRepriseMission).toISOString().slice(0, 10) : "",
                              regimeTva: (societe.regimeTva as string) ?? "",
                              regimeImposition: (societe.regimeImposition as string) ?? "",
                              activite: (societe.activite?.id ?? 0).toString(),
                              dateDebutFacturation: societe.dateDebutFacturation ? new Date(societe.dateDebutFacturation).toISOString().slice(0, 10) : "",

                              frontOffice: societe.frontOffice ?? "",
                              ancienEC: societe.ancienEC ?? "",
                              iban: societe.iban ?? "",
                              bic: societe.bic ?? "",
                            });
                            setEditErrors({});
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
                    <>
                      <Input value={infosDraft.name} onChange={e => setDraft("name", e.target.value)} className={editErrors.name ? "border-destructive" : ""} />
                      {editErrors.name && <p className="text-sm text-destructive">{editErrors.name}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societeState.name)}</p>
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
                    <Badge variant="outline">{renderOrNull(societeState.formeJuridique)}</Badge>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">SIRET</label>
                  {isEditingInfos ? (
                    <>
                      <Input value={infosDraft.siret} onChange={e => setDraft("siret", e.target.value)} className={editErrors.siret ? "border-destructive" : ""} inputMode="numeric" />
                      {editErrors.siret && <p className="text-sm text-destructive">{editErrors.siret}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societeState.siret)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">RCS</label>
                  {isEditingInfos ? (
                    <>
                      <Input value={infosDraft.rcs} onChange={e => setDraft("rcs", e.target.value)} className={editErrors.rcs ? "border-destructive" : ""} />
                      {editErrors.rcs && <p className="text-sm text-destructive">{editErrors.rcs}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societeState.rcs)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Code NAF</label>
                  {isEditingInfos ? (
                    <>
                      <Input value={infosDraft.codeNaf} onChange={e => setDraft("codeNaf", e.target.value)} className={editErrors.codeNaf ? "border-destructive" : ""} />
                      {editErrors.codeNaf && <p className="text-sm text-destructive">{editErrors.codeNaf}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societeState.codeNaf)}</p>
                  )}
                </div>
                <div ref={activiteRef}>
                  <label className="font-medium text-gray-700">Activité</label>
                  {isEditingInfos ? (
                    <>
                    <div className="relative">
                      <Input
                        placeholder="Rechercher une activité..."
                        value={showActiviteDropdown ? activiteSearch : selectedActiviteName}
                        onChange={(e) => {
                          setActiviteSearch(e.target.value);
                          setShowActiviteDropdown(true);
                        }}
                        onFocus={() => setShowActiviteDropdown(true)}
                        className="pr-10"
                        autoComplete="off"
                      />
                      <ChevronDown 
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 cursor-pointer"
                        onClick={() => setShowActiviteDropdown(!showActiviteDropdown)}
                      />
                      
                      {showActiviteDropdown && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-input rounded-md shadow-lg max-h-60 overflow-y-auto">
                          {filteredActivites.length === 0 ? (
                            <div className="px-3 py-2 text-sm text-gray-500">Aucune activité trouvée</div>
                          ) : (
                            <>
                              {(activiteSearch ? filteredActivites : filteredActivites.slice(0, 5)).map((activite) => (
                                <div
                                  key={activite.id}
                                  className={`px-3 py-2 text-sm cursor-pointer hover:bg-blue-50 flex items-center justify-between ${
                                    Number(infosDraft.activite) === activite.id ? "bg-blue-100" : ""
                                  }`}
                                  onClick={() => {
                                    setDraft("activite", String(activite.id));
                                    setActiviteSearch("");
                                    setShowActiviteDropdown(false);
                                  }}
                                >
                                  <span>{activite.name}</span>
                                  {Number(infosDraft.activite) === activite.id && (
                                    <Check className="h-4 w-4 text-blue-600" />
                                  )}
                                </div>
                              ))}
                              {!activiteSearch && filteredActivites.length > 5 && (
                                <div className="px-3 py-2 text-xs text-gray-400 border-t">
                                  Tapez pour voir les {filteredActivites.length - 5} autres activités...
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    {editErrors.activite && <p className="text-sm text-destructive">{editErrors.activite}</p>}
                    </>
                  ) : (
                    <p className="text-gray-900">
                      {displayActiviteName}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Date de création</label>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <p className="text-gray-900">{renderDate(societeState.dateCreation)}</p>
                  </div>
                </div>
                {/* <div>
                  <label className="font-medium text-gray-700">Date de clôture</label>
                  <div className="flex items-center gap-1">
                    {isEditingInfos ? (
                      <Input type="date" value={infosDraft.dateCloture1} onChange={e => setDraft("dateCloture1", e.target.value)} />
                    ) : (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <p className="text-gray-900">{renderDate(societeState.dateCloture1)}</p>
                      </div>
                    )}
                  </div>
                </div> */}
                <div>
                  <label className="font-medium text-gray-700">Date signature mission</label>

                  {isEditingInfos ? (
                    <Input type="date" value={infosDraft.dateSignatureMission} onChange={e => setDraft("dateSignatureMission", e.target.value)} />
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{renderDate(societeState.dateSignatureMission)}</p>
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
                      <p className="text-gray-900">{renderDate(societeState.dateRepriseMission)}</p>
                    </div>
                  )}
                </div>
                  <div className="flex flex-col gap-2">
                    <Label>Régime TVA</Label>
                    {isEditingInfos ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={infosDraft.regimeTva}
                      onChange={(e) => setDraft("regimeTva", e.target.value)}
                    >
                      <option value="">--</option>
                      <option value="MENSUEL">Mensuel</option>
                      <option value="TRIMESTRIEL">Trimestriel</option>
                      <option value="ANNUEL">Annuel</option>
                    </select>
                    ) : (
                      <p className="text-gray-900">{renderOrNull(societeState.regimeTva)}</p>
                    )}
                    
                  </div>
                <div>
                  <label className="font-medium text-gray-700">Régime imposition</label>
                  {isEditingInfos ? (
                     <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={infosDraft.regimeImposition}
                      onChange={(e) => setDraft("regimeImposition", e.target.value)}
                      >
                        <option value="">--</option>
                        <option value="IS">IS</option>
                        <option value="IR">IR</option>
                      </select>
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societeState.regimeImposition)}</p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Date début de la facturation</label>

                  {isEditingInfos ? (
                    <Input type="date" value={infosDraft.dateDebutFacturation} onChange={e => setDraft("dateDebutFacturation", e.target.value)} />
                  ) : (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-gray-900">{renderDate(societeState.dateDebutFacturation)}</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-medium text-gray-700">IBAN</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.iban} onChange={e => setDraft("iban", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societeState.iban)}</p>
                  )}
                </div>

                <div>
                  <label className="font-medium text-gray-700">BIC</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.bic} onChange={e => setDraft("bic", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societeState.bic)}</p>
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
                <>
                  <Input value={infosDraft.siegeSocial} onChange={e => setDraft("siegeSocial", e.target.value)} className={editErrors.siegeSocial ? "border-destructive" : ""} />
                  {editErrors.siegeSocial && <p className="text-sm text-destructive">{editErrors.siegeSocial}</p>}
                </>
              ) : (
                <p className="text-gray-900">{renderOrNull(societeState.siegeSocial)}</p>
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
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <Input placeholder="Prénom" value={infosDraft.dirigeantPrenom} onChange={e => setDraft("dirigeantPrenom", e.target.value)} className={editErrors.dirigeantPrenom ? "border-destructive" : ""} />
                        {editErrors.dirigeantPrenom && <p className="text-sm text-destructive">{editErrors.dirigeantPrenom}</p>}
                      </div>
                      <div>
                        <Input placeholder="Nom" value={infosDraft.dirigeantNom} onChange={e => setDraft("dirigeantNom", e.target.value)} className={editErrors.dirigeantNom ? "border-destructive" : ""} />
                        {editErrors.dirigeantNom && <p className="text-sm text-destructive">{editErrors.dirigeantNom}</p>}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-900">
                    {renderOrNull(societeState.dirigeantPrenom)} {renderOrNull(societeState.dirigeantNom)}
                  </p>
                )}
              </div>
              <div>
                <label className="font-medium text-gray-700">Email</label>
                {isEditingInfos ? (
                  <>
                    <Input type="email" value={infosDraft.email} onChange={e => setDraft("email", e.target.value)} className={editErrors.email ? "border-destructive" : ""} />
                    {editErrors.email && <p className="text-sm text-destructive">{editErrors.email}</p>}
                  </>
                ) : (
                  <p className="text-gray-900">{renderOrNull(societeState.email)}</p>
                )}
              </div>
              <div>
                <label className="font-medium text-gray-700">Téléphone</label>
                {isEditingInfos ? (
                  <>
                    <Input value={infosDraft.telephone} onChange={e => setDraft("telephone", e.target.value)} className={editErrors.telephone ? "border-destructive" : ""} />
                    {editErrors.telephone && <p className="text-sm text-destructive">{editErrors.telephone}</p>}
                  </>
                ) : (
                  <p className="text-gray-900">{renderOrNull(societeState.telephone)}</p>
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
                <div>
                  <label className="font-medium text-gray-700">Front Office</label>
                  {isEditingInfos ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <Input placeholder="Front Office" value={infosDraft.frontOffice} onChange={e => setDraft("frontOffice", e.target.value)} />
                    </div>
                  ) : (
                    <p className="text-gray-900">
                      {renderOrNull(societeState.frontOffice)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="font-medium text-gray-700">Ancien E.C.</label>
                  {isEditingInfos ? (
                    <Input value={infosDraft.ancienEC} onChange={e => setDraft("ancienEC", e.target.value)} />
                  ) : (
                    <p className="text-gray-900">{renderOrNull(societeState.ancienEC)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

        </TabsContent>

        {/* Onglet Documents */}
        <TabsContent value="documents" className="space-y-4">
          <SocieteDocuments societeId={societe.id} />
        </TabsContent>

        {/* Onglet Exercices */}
        <TabsContent value="exercices" className="space-y-4">
          <ExerciceSociete societeId={societe.id} />
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
