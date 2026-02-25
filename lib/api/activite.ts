import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

export interface Activite {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export async function getAllActivites(): Promise<Activite[]> {
  return apiGet<Activite[]>("/activite");
}

export async function getActiviteById(id: number): Promise<Activite> {
  return apiGet<Activite>(`/activite/${id}`);
}

export async function createActivite(name: string): Promise<Activite> {
  return apiPost<Activite>("/activite", { name });
}

export async function updateActivite(id: number, name: string): Promise<Activite> {
  return apiPatch<Activite>(`/activite/${id}`, { name });
}

export async function deleteActivite(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/activite/${id}`);
}
