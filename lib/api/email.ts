import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export type TypeEmailTemplate =
  | "RELANCE_TVA"
  | "FACTURE_IMPAYEE"
  | "CLOTURE_PROCHE"
  | "RELANCE_DOCUMENT"
  | "LIBRE";

export type StatutEmail = "EN_ATTENTE" | "ENVOYE" | "ECHEC";
export type DeclencheurEmail = "MANUEL" | "AUTOMATIQUE";

export const TYPE_TEMPLATE_LABELS: Record<TypeEmailTemplate, string> = {
  RELANCE_TVA: "Relance TVA",
  FACTURE_IMPAYEE: "Facture impayée",
  CLOTURE_PROCHE: "Clôture proche",
  RELANCE_DOCUMENT: "Relance document",
  LIBRE: "Libre",
};

export const VARIABLES_EMAIL = [
  { label: "Nom société",        value: "{{societe_name}}" },
  { label: "Nom dirigeant",      value: "{{dirigeant_nom}}" },
  { label: "Prénom dirigeant",   value: "{{dirigeant_prenom}}" },
  { label: "Nom cabinet",        value: "{{cabinet_name}}" },
  { label: "Mois échéance",      value: "{{mois_echeance}}" },
  { label: "Date échéance",      value: "{{date_echeance}}" },
];

export interface EmailTemplate {
  id: number;
  nom: string;
  sujet: string;
  corps: string;
  type: TypeEmailTemplate;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmailHistorique {
  id: number;
  destinataire: string;
  sujet: string;
  corps: string;
  statut: StatutEmail;
  declencheur: DeclencheurEmail;
  envoyeAt: string | null;
  erreur: string | null;
  createdAt: string;
  template: { nom: string; type: string };
}

export interface CreateTemplateDto {
  nom: string;
  sujet: string;
  corps: string;
  type: TypeEmailTemplate;
  actif: boolean;
}

export interface UpdateTemplateDto extends Partial<CreateTemplateDto> {}

export async function getTemplates(): Promise<EmailTemplate[]> {
  return apiGet<EmailTemplate[]>("/email/template");
}

export async function createTemplate(data: CreateTemplateDto): Promise<EmailTemplate> {
  return apiPost<EmailTemplate>("/email/template", data);
}

export async function updateTemplate(id: number, data: UpdateTemplateDto): Promise<EmailTemplate> {
  return apiPatch<EmailTemplate>(`/email/template/${id}`, data);
}

export async function deleteTemplate(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/email/template/${id}`);
}

export async function sendEmail(data: {
  templateId: number;
  societeId: number;
  destinataire?: string;
}): Promise<{ message: string }> {
  return apiPost<{ message: string }>("/email/send", data);
}

export async function getHistoriqueEmails(societeId: number): Promise<EmailHistorique[]> {
  return apiGet<EmailHistorique[]>(`/email/historique/${societeId}`);
}
