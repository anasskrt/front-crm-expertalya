/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";

interface SocieteFormProps {
  societe?: any;
  onSave: (data: any) => void;
  onCancel: () => void;
}

export default function SocieteForm({ societe, onSave, onCancel }: SocieteFormProps) {
  const [formData, setFormData] = useState({
    denomination_sociale: societe?.denomination_sociale || "",
    adresse_siege_social: societe?.adresse_siege_social || "",
    RCS_competent: societe?.RCS_competent || "",
    numero_siret: societe?.numero_siret || "",
    code_naf: societe?.code_naf || "",
    mode_paiement: societe?.mode_paiement?.toString() || "3",
    id_cabinet: societe?.id_cabinet?.toString() || "1",
    document: societe?.document || false,
    activiteId: societe?.activiteId?.toString() || "1",
    formatId: societe?.formatId?.toString() || "1",
    dateCloture: societe?.dateCloture
      ? new Date(societe.dateCloture).toISOString().split("T")[0]
      : "",
    contact: {
      id: societe?.contact?.id || 0,
      nom_dirigeant: societe?.contact?.nom_dirigeant || "",
      prenom_dirigeant: societe?.contact?.prenom_dirigeant || "",
      adresse_dirigeant: societe?.contact?.adresse_dirigeant || "",
      email_dirigeant: societe?.contact?.email_dirigeant || "",
      tel_dirigeant: societe?.contact?.tel_dirigeant || "",
      id_status_contact: societe?.contact?.id_status_contact?.toString() || "1",
    },
  });
  const [date, setDate] = useState<Date | undefined>(
    societe?.dateCloture ? new Date(societe.dateCloture) : undefined
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    // Correction pour le champ checkbox
    const checked = (e.target as HTMLInputElement).checked;
    if (name.startsWith("contact.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        contact: {
          ...prev.contact,
          [field]: value,
        },
      }));
    } else if (type === "checkbox") {
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="denomination_sociale">Dénomination Sociale</Label>
          <Input
            id="denomination_sociale"
            name="denomination_sociale"
            value={formData.denomination_sociale}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="adresse_siege_social">Adresse Siège Social</Label>
          <Input
            id="adresse_siege_social"
            name="adresse_siege_social"
            value={formData.adresse_siege_social}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="RCS_competent">RCS Compétent</Label>
          <Input
            id="RCS_competent"
            name="RCS_competent"
            value={formData.RCS_competent}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="numero_siret">Numéro SIRET</Label>
          <Input
            id="numero_siret"
            name="numero_siret"
            value={formData.numero_siret}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="code_naf">Code NAF</Label>
          <Input
            id="code_naf"
            name="code_naf"
            value={formData.code_naf}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="mode_paiement">Mode de Paiement</Label>
          <Select
            value={formData.mode_paiement}
            onValueChange={(v) =>
              setFormData((p) => ({ ...p, mode_paiement: v }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Option 1</SelectItem>
              <SelectItem value="2">Option 2</SelectItem>
              <SelectItem value="3">Option 3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_cabinet">Cabinet</Label>
          <Select
            value={formData.id_cabinet}
            onValueChange={(v) => setFormData((p) => ({ ...p, id_cabinet: v }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Cabinet A</SelectItem>
              <SelectItem value="2">Cabinet B</SelectItem>
              <SelectItem value="3">Cabinet C</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="document">Document</Label>
          <Input
            type="checkbox"
            id="document"
            name="document"
            checked={formData.document}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="activiteId">Activité Principale</Label>
          <Select
            value={formData.activiteId}
            onValueChange={(v) =>
              setFormData((p) => ({ ...p, activiteId: v }))
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">Commerce de détail</SelectItem>
              <SelectItem value="2">Services aux entreprises</SelectItem>
              <SelectItem value="3">Industrie manufacturière</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="formatId">Format Juridique</Label>
          <Select
            value={formData.formatId}
            onValueChange={(v) => setFormData((p) => ({ ...p, formatId: v }))}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">SARL</SelectItem>
              <SelectItem value="2">SAS</SelectItem>
              <SelectItem value="3">EURL</SelectItem>
              <SelectItem value="4">SASU</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="dateCloture">Date de Clôture</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[280px] justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact.nom_dirigeant">Nom du Dirigeant</Label>
          <Input
            id="contact.nom_dirigeant"
            name="contact.nom_dirigeant"
            value={formData.contact.nom_dirigeant}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="contact.prenom_dirigeant">Prénom du Dirigeant</Label>
          <Input
            id="contact.prenom_dirigeant"
            name="contact.prenom_dirigeant"
            value={formData.contact.prenom_dirigeant}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact.adresse_dirigeant">Adresse du Dirigeant</Label>
          <Input
            id="contact.adresse_dirigeant"
            name="contact.adresse_dirigeant"
            value={formData.contact.adresse_dirigeant}
            onChange={handleChange}
          />
        </div>
        <div>
          <Label htmlFor="contact.email_dirigeant">Email du Dirigeant</Label>
          <Input
            type="email"
            id="contact.email_dirigeant"
            name="contact.email_dirigeant"
            value={formData.contact.email_dirigeant}
            onChange={handleChange}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="contact.tel_dirigeant">Téléphone du Dirigeant</Label>
        <Input
          type="tel"
          id="contact.tel_dirigeant"
          name="contact.tel_dirigeant"
          value={formData.contact.tel_dirigeant}
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onCancel}>Annuler</Button>
        <Button type="submit">Enregistrer</Button>
      </div>
    </form>
  );
}
