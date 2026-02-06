/* eslint-disable @typescript-eslint/no-explicit-any */
// src/api/taches.ts
import api from "@/lib/axiosClient";

export type TaskStatusFilter = "EN_ATTENTE" | "EN_COURS" | "TERMINEE" | 'CLIENT' | 'INPI' | 'COLLAB' | '';

export async function getTache(statuses?: string[]) {
  const allowed: TaskStatusFilter[] = ["EN_ATTENTE", "EN_COURS", "TERMINEE", 'CLIENT', 'INPI', 'COLLAB'];
  const safe = (statuses ?? [])
    .map((s) => s.toUpperCase().trim())
    .filter((s): s is TaskStatusFilter => allowed.includes(s as TaskStatusFilter));

  const params = safe.length ? { status: safe.join(",") } : {};
  console.log(params);
  const { data } = await api.get("/task", { params });
  return data;
}

export async function getTacheByCollabo(collaborateurId: number, statuses?: string[]) {
  const allowed: TaskStatusFilter[] = ["EN_ATTENTE", "EN_COURS", "TERMINEE", 'CLIENT', 'INPI', 'COLLAB'];
  const safe = (statuses ?? [])
    .map((s) => s.toUpperCase().trim())
    .filter((s): s is TaskStatusFilter => allowed.includes(s as TaskStatusFilter));

  const params = safe.length ? { status: safe.join(",") } : {};
  const { data } = await api.get(`/task/${collaborateurId}`, { params });
  return data;
}

export async function getTacheForSociete(societeId: number) {
  const { data } = await api.get(`/task/societe/${societeId}`);
  return data;
}

export async function createTache(payload: any) {
  const { data } = await api.post("/task", payload);
  return data;
}

export async function updateTacheById(
  id: number,
  payload: { statut: string; tempsPasse?: number }
) {
  const { data } = await api.patch(`/task/${id}`, payload);
  return data;
}

export async function updateTachesBatch(updatedTaches: { id: number; statut: boolean }[]) {
  const { data } = await api.patch("/task/batch", updatedTaches);
  return data;
}
