import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export type StatutPlanification = "PLANIFIE" | "ENVOYE" | "ANNULE";

export interface EmailListeContact {
  id: number;
  email: string;
  nom: string | null;
  societeId: number | null;
  societe: { id: number; name: string } | null;
  createdAt: string;
}

export interface EmailListePlanification {
  id: number;
  dateEnvoi: string;
  statut: StatutPlanification;
  template: { id: number; nom: string; type: string };
}

export interface EmailListe {
  id: number;
  titre: string;
  description: string | null;
  actif: boolean;
  _count: { contacts: number };
  contacts: EmailListeContact[];
  planifications: EmailListePlanification[];
  createdAt: string;
  updatedAt: string;
}

export interface EmailListeSummary {
  id: number;
  titre: string;
  description: string | null;
  actif: boolean;
  _count: { contacts: number };
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmailListeDto {
  titre: string;
  description?: string;
  actif: boolean;
}

export interface AddContactDto {
  email: string;
  nom?: string;
  societeId?: number;
}

export interface SendResult {
  total: number;
  envoyes: number;
  echecs: number;
}

export type FrequenceEmail = "MENSUEL" | "TRIMESTRIEL" | "SEMESTRIEL" | "ANNUEL";

export interface EmailListeRegle {
  id: number;
  listeId: number;
  jourDuMois: number;
  frequence: FrequenceEmail;
  actif: boolean;
  prochainEnvoi: string; // YYYY-MM-DD, calculé par le backend, lecture seule
  template: { nom: string; type: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegleDto {
  templateId: number;
  jourDuMois: number;
  frequence: FrequenceEmail;
  actif?: boolean;
}

export interface SocieteListeSummary {
  listeId: number;
  listeTitre: string;
  listeActif: boolean;
  contactId: number;
  contactEmail: string;
}

export async function getAllEmailListes(): Promise<EmailListeSummary[]> {
  return apiGet<EmailListeSummary[]>("/email-liste");
}

export async function getEmailListeDetail(id: number): Promise<EmailListe> {
  return apiGet<EmailListe>(`/email-liste/${id}`);
}

export async function createEmailListe(data: CreateEmailListeDto): Promise<EmailListeSummary> {
  return apiPost<EmailListeSummary>("/email-liste", data);
}

export async function updateEmailListe(
  id: number,
  data: Partial<CreateEmailListeDto>
): Promise<EmailListeSummary> {
  return apiPatch<EmailListeSummary>(`/email-liste/${id}`, data);
}

export async function deleteEmailListe(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/email-liste/${id}`);
}

export async function addContactToListe(id: number, data: AddContactDto): Promise<EmailListeContact> {
  return apiPost<EmailListeContact>(`/email-liste/${id}/contact`, data);
}

export async function removeContactFromListe(
  id: number,
  contactId: number
): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/email-liste/${id}/contact/${contactId}`);
}

/** dateEnvoi : format YYYY-MM-DD uniquement (ex: "2026-06-15") — pas d'heure */
export async function planifierEnvoi(
  id: number,
  data: { templateId: number; dateEnvoi: string }
): Promise<EmailListePlanification> {
  return apiPost<EmailListePlanification>(`/email-liste/${id}/planification`, data);
}

export async function annulerPlanification(
  id: number,
  planifId: number
): Promise<EmailListePlanification> {
  return apiPatch<EmailListePlanification>(`/email-liste/${id}/planification/${planifId}/annuler`, {});
}

export async function getListesBySociete(societeId: number): Promise<SocieteListeSummary[]> {
  return apiGet<SocieteListeSummary[]>(`/email-liste/societe/${societeId}`);
}

export async function envoyerMaintenant(
  id: number,
  templateId: number
): Promise<SendResult> {
  return apiPost<SendResult>(`/email-liste/${id}/envoyer/${templateId}`, {});
}

export async function getRegles(id: number): Promise<EmailListeRegle[]> {
  return apiGet<EmailListeRegle[]>(`/email-liste/${id}/regle`);
}

export async function createRegle(id: number, data: CreateRegleDto): Promise<EmailListeRegle> {
  return apiPost<EmailListeRegle>(`/email-liste/${id}/regle`, data);
}

export async function updateRegle(
  id: number,
  regleId: number,
  data: Partial<CreateRegleDto>
): Promise<EmailListeRegle> {
  return apiPatch<EmailListeRegle>(`/email-liste/${id}/regle/${regleId}`, data);
}

export async function deleteRegle(id: number, regleId: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/email-liste/${id}/regle/${regleId}`);
}
