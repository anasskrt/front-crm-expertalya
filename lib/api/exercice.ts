import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";
import { Mission } from "./mission";

// Enum StatutExercice
export enum StatutExercice {
  EN_COURS = "EN_COURS",
  TERMINE = "TERMINE",
}

export const STATUT_EXERCICE_LABELS: Record<StatutExercice, string> = {
  [StatutExercice.EN_COURS]: "En cours",
  [StatutExercice.TERMINE]: "Terminé",
};

// Interface Exercice (période comptable)
export interface Exercice {
  id: number;
  societeId: number;
  dateDeCloture: string;
  dateMiseEnCloture: string | null;
  statut: StatutExercice;
  missions: Mission[];
  societe?: {
    id: number;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateExerciceDto {
  societeId: number;
  dateDeCloture: string;
  dateMiseEnCloture?: string;
  statut?: StatutExercice;
}

export interface UpdateExerciceDto {
  dateDeCloture?: string;
  dateMiseEnCloture?: string;
  statut?: StatutExercice;
}

// Récupérer tous les exercices du cabinet
export async function getAllExercices(): Promise<Exercice[]> {
  return apiGet<Exercice[]>("/exercice");
}

// Récupérer les exercices d'une société
export async function getExercicesBySociete(societeId: number): Promise<Exercice[]> {
  return apiGet<Exercice[]>(`/exercice/societe/${societeId}`);
}

// Récupérer un exercice par ID
export async function getExerciceById(id: number): Promise<Exercice> {
  return apiGet<Exercice>(`/exercice/${id}`);
}

// Créer un exercice (crée automatiquement les 9 missions)
export async function createExercice(dto: CreateExerciceDto): Promise<Exercice> {
  return apiPost<Exercice>("/exercice", dto);
}

// Mettre à jour un exercice
export async function updateExercice(id: number, dto: UpdateExerciceDto): Promise<Exercice> {
  return apiPatch<Exercice>(`/exercice/${id}`, dto);
}

// Supprimer un exercice (et ses missions)
export async function deleteExercice(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/exercice/${id}`);
}
