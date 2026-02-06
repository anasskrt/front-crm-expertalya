/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Save } from "lucide-react";
import {
  activitesPrincipales,
  formatsJuridiques,
} from "@/data/mockData";
import { useToast } from "@/hooks/use-toast";
import { apiPost } from "@/lib/api";

export default function CreateSocieteForm() {
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);
  const [created, setCreated] = useState(false);
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
  const isSiret = (v: string) => /^\d{14}$/.test(v.replace(/\s/g, ""));
  const isNotEmpty = (v?: string | number) =>
    v !== undefined && v !== null && String(v).trim().length > 0;

  const validate = () => {
    const e: Record<string, string> = {};

    if (!isNotEmpty(societeData.name)) e.name = "Obligatoire";
    if (!isSiret(societeData.siret)) e.siret = "SIRET : 14 chiffres";
    if (!isNotEmpty(societeData.dirigeantPrenom)) e.dirigeantPrenom = "Obligatoire";
    if (!isNotEmpty(societeData.dirigeantNom)) e.dirigeantNom = "Obligatoire";
    if (!isNotEmpty(societeData.telephone)) e.telephone = "Obligatoire";
    if (!isEmail(societeData.email)) e.email = "Email invalide";
    if (!isNotEmpty(societeData.adresse_siege_social)) e.adresse_siege_social = "Obligatoire";
    if (!isNotEmpty(societeData.RCS_competent)) e.RCS_competent = "Obligatoire";
    if (!isNotEmpty(societeData.code_naf)) e.code_naf = "Obligatoire";
    if (!isNotEmpty(societeData.formatId)) e.formatId = "Obligatoire";
    if (!isNotEmpty(societeData.activiteId)) e.activiteId = "Obligatoire";
    if (!isNotEmpty(societeData.dateCloture1)) e.dateCloture1 = "Obligatoire";

    return e;
  };


  const [societeData, setSocieteData] = useState({
    name: "",
    adresse_siege_social: "",
    RCS_competent: "",
    siret: "",
    code_naf: "",
    formatId: 1,
    activiteId: 1,
    id_cabinet: 1,
    mode_paiement: 3,
    dateCloture1: "",
    dirigeantNom: "",
    dirigeantPrenom: "",
    telephone: "",
    email: "",

    // --- Optionnels ---
    regimeTva: "",
    regimeImposition: "",
    dateSignatureMission: "",
    dateRepriseMission: "",
    jedeclarecom: false,
    impotgouv: false,
    iban: "",
    bic: "",
    ancienEC: "",

    // --- gestion cabinet ---
    frontOffice: "",
    intervenant: "",
    collaborateurComptable: "",
    collaborateurSocial: "",
    responsable :"",
  });

  const handleSocieteChange = (field: any, value: any) => setSocieteData(prev => ({ ...prev, [field]: value }));

  const formeByFormatId: Record<number, "SARL" | "SAS" | "SASU" | "EURL" | "SCI" | "EI"> = {
    1: "SARL",
    2: "SAS",
    3: "SASU",
    4: "EURL",
    5: "SCI",
    6: "EI"
  };
  
  const handleSubmit = async () => {
    if (submitting || created) return;

    const v = validate();
    if (Object.keys(v).length > 0) {
      setErrors(v);
      toast({
        title: "Formulaire incomplet",
        description: "Merci de corriger les champs en rouge.",
        variant: "destructive",
      });
      return;
    }
    setErrors({}); // clear
    setSubmitting(true);

    const payload = {
      name: societeData.name.trim(),
      formeJuridique: formeByFormatId[societeData.formatId] ?? "SAS",
      siret: societeData.siret.trim(),
      rcs: societeData.RCS_competent.trim(),
      dirigeantNom: societeData.dirigeantNom.trim(),
      dirigeantPrenom: societeData.dirigeantPrenom.trim(),
      siegeSocial: societeData.adresse_siege_social.trim(),
      codeNaf: societeData.code_naf.trim(),
      activiteId: Number(societeData.activiteId),
      dateCreation: new Date().toISOString(),
      dateCloture1: new Date(`${societeData.dateCloture1}T00:00:00.000Z`).toISOString(),
      telephone: societeData.telephone.trim(),
      email: societeData.email.trim(),
  

      regimeTva: societeData.regimeTva || undefined,
      regimeImposition: societeData.regimeImposition || undefined,
      dateSignatureMission: societeData.dateSignatureMission
        ? new Date(`${societeData.dateSignatureMission}T00:00:00.000Z`).toISOString()
        : undefined,
      dateRepriseMission: societeData.dateRepriseMission
        ? new Date(`${societeData.dateRepriseMission}T00:00:00.000Z`).toISOString()
        : undefined,
      jedeclarecom: !!societeData.jedeclarecom,
      impotgouv: !!societeData.impotgouv,
      iban: societeData.iban.trim() || undefined,
      bic: societeData.bic.trim() || undefined,
      ancienEC: societeData.ancienEC.trim() || undefined,
      frontOffice: societeData.frontOffice.trim() || "",
      intervenant: societeData.intervenant.trim() || "",
      collaborateurComptable: societeData.collaborateurComptable.trim() || "",
      collaborateurSocial: societeData.collaborateurSocial.trim() || "",
      responsable : societeData.responsable.trim() || "",
    };

  
    try {
      await apiPost("/societe", payload);
      setCreated(true);
      toast({ title: "Société créée", description: "La nouvelle société a été créée." });
    } catch (err: any) {
      toast({
        title: "Erreur",
        description: err?.message || "Erreur lors de la création.",
        variant: "destructive",
      });
    }  finally {
      setSubmitting(false);
    }
  };
  
  
  
  const Req = () => <span className="text-destructive ml-1">*</span>;

  const renderStep = () => {
    return (
      <div className="space-y-6">
        {/* Dénomination & SIRET */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label>Dénomination sociale <Req /></Label>
            <Input
              id="name"
              placeholder="Ex: Ma société SARL"
              value={societeData.name}
              onChange={(e) => handleSocieteChange("name", e.target.value)}
              className={errors.name ? "border-destructive" : ""}
              aria-invalid={!!errors.name}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name}</p>
            )}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Numéro SIRET <Req /></Label>
            <Input
              id="siret"
              placeholder="Ex: 12345678900011"
              value={societeData.siret}
              onChange={(e) => handleSocieteChange("siret", e.target.value)}
              className={errors.siret ? "border-destructive" : ""}
              aria-invalid={!!errors.siret}
              inputMode="numeric"
              pattern="\d{14}"
            />
            {errors.siret && (
              <p className="text-sm text-destructive">{errors.siret}</p>
            )}
          </div>
        </div>
  
        {/* Dirigeant */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label>Prénom du dirigeant <Req /></Label>
            <Input
              id="dirigeantPrenom"
              placeholder="Ex: Jean"
              value={societeData.dirigeantPrenom}
              onChange={(e) => handleSocieteChange("dirigeantPrenom", e.target.value)}
              className={errors.dirigeantPrenom ? "border-destructive" : ""}
              aria-invalid={!!errors.dirigeantPrenom}
            />
            {errors.dirigeantPrenom && <p className="text-sm text-destructive">{errors.dirigeantPrenom}</p>}

          </div>
          <div className="flex flex-col gap-2">
            <Label>Nom du dirigeant <Req /></Label>
            <Input
              id="dirigeantNom"
              placeholder="Ex: Dupont"
              value={societeData.dirigeantNom}
              onChange={(e) => handleSocieteChange("dirigeantNom", e.target.value)}
              className={errors.dirigeantNom ? "border-destructive" : ""}
              aria-invalid={!!errors.dirigeantNom}
            />
            {errors.dirigeantNom && <p className="text-sm text-destructive">{errors.dirigeantNom}</p>}
          </div>
        </div>

        {/* Coordonnées obligatoires */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label>Téléphone <Req /></Label>
            <Input
              id="telephone"
              placeholder="Ex: 0102030405"
              value={societeData.telephone}
              onChange={(e) => handleSocieteChange("telephone", e.target.value)}
              className={errors.telephone ? "border-destructive" : ""}
              aria-invalid={!!errors.telephone}
            />
            {errors.telephone && <p className="text-sm text-destructive">{errors.telephone}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Email <Req /></Label>
            <Input
              id="email"
              type="email"
              placeholder="exemple@domaine.fr"
              value={societeData.email}
              onChange={(e) => handleSocieteChange("email", e.target.value)}
              className={errors.email ? "border-destructive" : ""}
              aria-invalid={!!errors.email}
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
        </div>
  
        {/* Adresse */}
        <div className="flex flex-col gap-2">
          <Label>Adresse du siège social <Req /></Label>
          <Input
            id="adresse_siege_social"
            placeholder="Ex: 21 rue de Paris, 75000 Paris"
            value={societeData.adresse_siege_social}
            onChange={(e) =>
              handleSocieteChange("adresse_siege_social", e.target.value)
            }
            className={errors.adresse_siege_social ? "border-destructive" : ""}
            aria-invalid={!!errors.adresse_siege_social}
          />
          {errors.adresse_siege_social && <p className="text-sm text-destructive">{errors.adresse_siege_social}</p>}
        </div>
  
        {/* RCS & NAF */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label>RCS compétent <Req /></Label>
            <Input
              id="RCS_competent"
              placeholder="Ex: Bordeaux"
              value={societeData.RCS_competent}
              onChange={(e) =>
                handleSocieteChange("RCS_competent", e.target.value)
              }
              className={errors.RCS_competent ? "border-destructive" : ""}
              aria-invalid={!!errors.RCS_competent}
            />
            {errors.RCS_competent && <p className="text-sm text-destructive">{errors.RCS_competent}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Code NAF <Req /></Label>
            <Input
              placeholder="Ex: 6201Z"
              value={societeData.code_naf}
              onChange={(e) =>
                handleSocieteChange("code_naf", e.target.value)
              }
              className={errors.code_naf ? "border-destructive" : ""}
              aria-invalid={!!errors.code_naf}
              id="code_naf"
            />
            {errors.code_naf && <p className="text-sm text-destructive">{errors.code_naf}</p>}
          </div>
        </div>
  
        {/* Format / Activité / Clôture */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label>Format juridique <Req /></Label>
            <select
              id="formatId"
              className={`w-full rounded-md border px-3 py-2 text-sm ${errors.formatId ? "border-destructive" : "border-input"} `}
              value={societeData.formatId}
              onChange={(e) =>
                handleSocieteChange("formatId", parseInt(e.target.value))
              }
              
            >
              {formatsJuridiques.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.format}
                </option>
              ))}
            </select>
            {errors.formatId && <p className="text-sm text-destructive">{errors.formatId}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Activité principale <Req /></Label>
            <select
            id="activiteId"
              className={`w-full rounded-md border px-3 py-2 text-sm ${errors.activiteId ? "border-destructive" : "border-input"} `}  value={societeData.activiteId}
              onChange={(e) =>
                handleSocieteChange("activiteId", parseInt(e.target.value))
              }
            >
              {activitesPrincipales.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.libelle}
                </option>
              ))}
            </select>
            {errors.activiteId && <p className="text-sm text-destructive">{errors.activiteId}</p>}

          </div>
          
        </div>
  
        {/* Cabinet & Paiement */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
            <Label>Date de clôture <Req /></Label>
            <Input
              id="dateCloture1"
              type="date"
              value={societeData.dateCloture1}
              onChange={(e) =>
                handleSocieteChange("dateCloture1", e.target.value)
              }
              className={errors.dateCloture1 ? "border-destructive" : ""}
              aria-invalid={!!errors.dateCloture1}
            />
            {errors.dateCloture1 && <p className="text-sm text-destructive">{errors.dateCloture1}</p>}
          </div>
          <div className="flex flex-col gap-2">
            <Label>Mode de paiement <Req /></Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={societeData.mode_paiement}
              onChange={(e) =>
                handleSocieteChange("mode_paiement", parseInt(e.target.value))
              }
            >
              <option value={1}>Virement</option>
              <option value={2}>Chèque</option>
              <option value={3}>Prélèvement</option>
              <option value={4}>Espèces</option>
            </select>
          </div>
        </div>

        {/* IBAN & BIC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
                <Label>IBAN <Req /></Label>
                <Input
                  id="iban"
                  placeholder="FR 14 2001 0101 1505 0001 3M02 606"
                  value={societeData.iban}
                  onChange={(e) =>
                    handleSocieteChange("iban", e.target.value)
                  }
                  className={errors.iban ? "border-destructive" : ""}
                  aria-invalid={!!errors.iban}
                />
                {errors.iban && <p className="text-sm text-destructive">{errors.iban}</p>}
            </div>
          
            <div className="flex flex-col gap-2">
              <Label>BIC <Req /></Label>
              <Input
                id="bic"
                placeholder="SOGEFRPPXXX"
                value={societeData.bic}
                onChange={(e) =>
                  handleSocieteChange("bic", e.target.value)
                }
                className={errors.bic ? "border-destructive" : ""}
                aria-invalid={!!errors.bic}
              />
              {errors.bic && <p className="text-sm text-destructive">{errors.bic}</p>}
          </div>
        </div>

        {/* Régimes fiscaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label>Régime TVA</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={societeData.regimeTva}
              onChange={(e) => handleSocieteChange("regimeTva", e.target.value)}
            >
              <option value="">--</option>
              <option value="MENSUEL">Mensuel</option>
              <option value="TRIMESTRIEL">Trimestriel</option>
              <option value="ANNUEL">Annuel</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <Label>Régime Imposition</Label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={societeData.regimeImposition}
              onChange={(e) => handleSocieteChange("regimeImposition", e.target.value)}
            >
              <option value="">--</option>
              <option value="IS">IS</option>
              <option value="IR">IR</option>
            </select>
          </div>
        </div>

        {/* Dates mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <Label>Date signature mission</Label>
            <Input
              type="date"
              value={societeData.dateSignatureMission}
              onChange={(e) =>
                handleSocieteChange("dateSignatureMission", e.target.value)
              }
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Date reprise mission</Label>
            <Input
              type="date"
              value={societeData.dateRepriseMission}
              onChange={(e) =>
                handleSocieteChange("dateRepriseMission", e.target.value)
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
                <Label>Front office</Label>
                <Input
                  id="frontOffice"
                  placeholder="Nom et prénom"
                  value={societeData.frontOffice}
                  onChange={(e) =>
                    handleSocieteChange("frontOffice", e.target.value)
                  }

                />
            </div>
          
            <div className="flex flex-col gap-2">
              <Label>Responsable</Label>
              <Input
                id="responsable"
                placeholder="Nom et prénom"
                value={societeData.responsable}
                onChange={(e) =>
                  handleSocieteChange("responsable", e.target.value)
                }

              />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
                <Label>Collaborateur Comptable</Label>
                <Input
                  id="collaborateurComptable"
                  placeholder="Nom et prénom"
                  value={societeData.collaborateurComptable}
                  onChange={(e) =>
                    handleSocieteChange("collaborateurComptable", e.target.value)
                  }
                />
            </div>
          
            <div className="flex flex-col gap-2">
              <Label>Collaborateur Social</Label>
              <Input
                id="collaborateurSocial"
                placeholder="Nom et prénom"
                value={societeData.collaborateurSocial}
                onChange={(e) =>
                  handleSocieteChange("collaborateurSocial", e.target.value)
                }
              />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
              <Label>Ancien E.C.</Label>
              <Input
                id="ancienEC"
                placeholder="Nom et prénom"
                value={societeData.ancienEC}
                onChange={(e) =>
                  handleSocieteChange("ancienEC", e.target.value)
                }
              />
          </div>

          <div className="flex flex-col gap-2">
              <Label>Intervenant</Label>
              <Input
                id="intervenant"
                placeholder="Nom et prénom"
                value={societeData.intervenant}
                onChange={(e) =>
                  handleSocieteChange("intervenant", e.target.value)
                }
              />
          </div>
        </div>

        {/* Booléens */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={societeData.jedeclarecom}
              onChange={(e) =>
                handleSocieteChange("jedeclarecom", e.target.checked)
              }
              className="h-4 w-4"
            />
            Jedeclare.com
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={societeData.impotgouv}
              onChange={(e) =>
                handleSocieteChange("impotgouv", e.target.checked)
              }
              className="h-4 w-4"
            />
            Impots.gouv
          </label>
        </div>
      </div>
    );
  };
  

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Ajouter une société
          </h1>
          <p className="text-sm text-muted-foreground">
            Renseignez les informations puis validez la création.
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Les champs marqués <span className="text-destructive">*</span> sont obligatoires.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 text-muted-foreground">
          <Building className="w-4 h-4" />
          <span className="text-sm">Nouvelle fiche</span>
        </div>
      </div>
  
      {/* Carte formulaire */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Informations générales</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">{renderStep()}</CardContent>
      </Card>
  
      {/* Barre d'action */}
      <div className="flex items-center justify-end gap-3">
        <Button onClick={handleSubmit} disabled={submitting} className="px-6">
          <Save className="mr-2 w-4 h-4" />
          {created ? "Société créée ✅" : submitting ? "Création..." : "Créer la société"}
        </Button>
      </div>
    </div>
  );
  
}
