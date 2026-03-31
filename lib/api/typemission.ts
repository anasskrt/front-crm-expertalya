import { apiGet, apiPost, apiDelete } from "@/lib/api";

export interface TypeMissionItem {
  id: number;
  libelle: string;
  createdAt: string;
  updatedAt: string;
}

export async function getTypeMissions(): Promise<TypeMissionItem[]> {
  return apiGet<TypeMissionItem[]>("/typemission");
}

export async function createTypeMission(libelle: string): Promise<TypeMissionItem> {
  return apiPost<TypeMissionItem>("/typemission", { libelle });
}

export async function deleteTypeMission(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/typemission/${id}`);
}
