import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export type TypeFacture = "COMPTA" | "SOCIALE" | "EXCEPTIONNEL" | "AUTRE";

export const TYPE_FACTURE_LABELS: Record<TypeFacture, string> = {
  COMPTA: "Compta",
  SOCIALE: "Sociale",
  EXCEPTIONNEL: "Exceptionnel",
  AUTRE: "Autre",
};

export interface Facture {
  id: number;
  societeId: number;
  montant: number;
  dateFacture: string;
  typeFacture: TypeFacture;
  payer: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFactureDto {
  societeId: number;
  montant: number;
  dateFacture: string;
  typeFacture: TypeFacture;
  payer: boolean;
}

export interface UpdateFactureDto {
  montant?: number;
  dateFacture?: string;
  typeFacture?: TypeFacture;
  payer?: boolean;
}

export async function getFacturesBySociete(societeId: number): Promise<Facture[]> {
  return apiGet<Facture[]>(`/facture/societe/${societeId}`);
}

export async function createFacture(data: CreateFactureDto): Promise<Facture> {
  return apiPost<Facture>("/facture", data);
}

export async function updateFacture(id: number, data: UpdateFactureDto): Promise<Facture> {
  return apiPatch<Facture>(`/facture/${id}`, data);
}

export async function deleteFacture(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/facture/${id}`);
}

export interface BilanDetail {
  du: number;
  paye: number;
  solde: number;
}

export interface BilanFacture {
  societeId: number;
  dateDebutFacturation: string | null;
  dateDebut: string | null;
  mensualiteActuelle: number;
  totalDu: number;
  totalPaye: number;
  solde: number;
  detail: {
    compta: BilanDetail;
    sociale: BilanDetail;
    exceptionnel: BilanDetail;
    autre: BilanDetail;
  };
}

export async function getBilanFacture(societeId: number): Promise<BilanFacture> {
  return apiGet<BilanFacture>(`/facture/societe/${societeId}/bilan`);
}

export type AlertePaiement =
  | "A_JOUR"
  | "SANS_TARIF"
  | "SANS_FACTURE"
  | "SOLDE_IMPAYE"
  | "FACTURES_EN_ATTENTE";

export interface DashboardSociete {
  id: number;
  name: string;
  formeJuridique: string;
  siret: string;
  dateDebutFacturation: string | null;
  dateDebut: string | null;
  mensualiteActuelle: number;
  totalDu: number;
  totalPaye: number;
  solde: number;
  nbFacturesImpayees: number;
  alertes: AlertePaiement[];
}

export async function getDashboardPaiements(): Promise<DashboardSociete[]> {
  return apiGet<DashboardSociete[]>("/facture/dashboard");
}
