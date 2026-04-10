import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api";

// Interface Mission (anciennement Exercice dans l'ancien système)
export interface Mission {
  id: number;
  exerciceId: number;
  typeMissionId: number;
  typeMission: {
    id: number;
    libelle: string;
  };
  dateEcheance: string | null;
  terminer: boolean;
  dateTerminer: string | null;
  collaborateurId: number | null;
  managerId: number | null;
  collaborateur?: {
    id: number;
    name: string;
    firstName: string;
  };
  manager?: {
    id: number;
    name: string;
    firstName: string;
  };
  exercice?: {
    id: number;
    dateDeCloture: string;
    dateMiseEnCloture: string | null;
    societe: {
      id: number;
      name: string;
    };
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateMissionDto {
  exerciceId: number;
  typeMissionId: number;
  dateEcheance?: string;
  terminer?: boolean;
  collaborateurId?: number;
  managerId?: number;
}

export interface UpdateMissionDto {
  dateEcheance?: string;
  terminer?: boolean;
  collaborateurId?: number;
  managerId?: number;
}

// Récupérer toutes les missions du cabinet
export async function getAllMissions(): Promise<Mission[]> {
  return apiGet<Mission[]>("/mission");
}

// Récupérer les missions d'un exercice
export async function getMissionsByExercice(exerciceId: number): Promise<Mission[]> {
  return apiGet<Mission[]>(`/mission/exercice/${exerciceId}`);
}

// Récupérer une mission par ID
export async function getMissionById(id: number): Promise<Mission> {
  return apiGet<Mission>(`/mission/${id}`);
}

// Récupérer mes missions (collaborateur connecté)
export async function getMyMissions(): Promise<Mission[]> {
  return apiGet<Mission[]>("/mission/toMe");
}

// Récupérer les missions d'un collaborateur (pour managers/admins)
export async function getMissionsByCollaborateur(collaborateurId: number): Promise<Mission[]> {
  return apiGet<Mission[]>(`/mission/manager/${collaborateurId}`);
}

// Créer une mission
export async function createMission(dto: CreateMissionDto): Promise<Mission> {
  return apiPost<Mission>("/mission", dto);
}

// Mettre à jour une mission
export async function updateMission(id: number, dto: UpdateMissionDto): Promise<Mission> {
  return apiPatch<Mission>(`/mission/${id}`, dto);
}

// Valider ou invalider une mission (endpoint dédié)
// La dateDeCloture est automatiquement définie/effacée par le backend
export async function toggleMissionTerminer(id: number, terminer: boolean): Promise<Mission> {
  return apiPatch<Mission>(`/mission/${id}/terminer`, { terminer });
}

// Supprimer une mission
export async function deleteMission(id: number): Promise<{ message: string }> {
  return apiDelete<{ message: string }>(`/mission/${id}`);
}

