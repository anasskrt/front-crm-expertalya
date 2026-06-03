import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export interface Tarif {
  id: number;
  societeId: number;
  compta: number;
  sociale: number;
  exceptionnel: number;
  autre: number;
  dateDebut: string;
  actif: boolean;
  commentaire: string | null;
  createdAt: string;
}

export interface CreateTarifDto {
  societeId: number;
  compta: number;
  sociale: number;
  exceptionnel: number;
  autre: number;
  dateDebut: string;
}

export async function getTarifsBySociete(societeId: number): Promise<Tarif[]> {
  return apiGet<Tarif[]>(`/tarif/societe/${societeId}`);
}

export async function createTarif(data: CreateTarifDto): Promise<Tarif> {
  return apiPost<Tarif>("/tarif", data);
}

export async function updateTarifCommentaire(
  id: number,
  commentaire: string | null
): Promise<Tarif> {
  return apiPatch<Tarif>(`/tarif/${id}/commentaire`, { commentaire });
}

export async function deleteTarif(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/tarif/${id}`);
}
