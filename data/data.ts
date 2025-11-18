// types/societe.ts

import { fi } from "date-fns/locale"

export enum FormeJuridique {
    SARL = "SARL",
    SAS = "SAS",
    SASU = "SASU",
    EURL = "EURL",
    SCI = "SCI",
    EI = "EI",
}
  
export enum RegimeTva {
    MENSUEL = "MENSUEL",
    TRIMESTRIEL = "TRIMESTRIEL",
    ANNUEL = "ANNUEL",
}
  
export enum RegimeImposition {
    IS = "IS",
    IR = "IR",
}
  
export interface Activite {
    id: number
    name: string
    createdAt: string
    updatedAt: string
}
  
export interface SocieteDocuments {
    id: number
    societeId: number
    fichierFEC: boolean
    courrierDeontologique: boolean
    pieceIdentiteDirigeant: boolean
    ribProfessionnel: boolean
    statutsAJour: boolean
    extraitKbis: boolean
    lettreMissionSignee: boolean
}
  
export interface Societe {
  id: number
  name: string
  formeJuridique: FormeJuridique
  siret: string
  rcs: string
  dirigeantNom: string
  dirigeantPrenom: string
  siegeSocial: string
  codeNaf: string
  activiteId: number
  activite?: Activite
  createdAt: string
  updatedAt: string
  dateCreation: string
  dateCloture1: string
  
  tarifCompta?: number
  tarifSocial?: number
  tarifRattrapage?: number
  tarifAutres?: number
  
  regimeTva: RegimeTva
  regimeImposition: RegimeImposition
  
  telephone: string
  email: string
  
  dateSignatureMission?: string
  dateRepriseMission?: string
  
  jedeclarecom: boolean
  impotgouv: boolean
  
  documents?: SocieteDocuments
  cannaux?: Canal[];

  dateDebutFacturation?: string;

  responsable? : string;
  collaborateurCompta? : string;
  collaborateurSocial? : string;
  intervenant? : string;
  frontOffice? : string;

  ancienEC?: string;
}

export interface SocieteShort {
    id: number
    name: string
    formeJuridique: FormeJuridique
    siret: string
    dateCloture1: string
    activite?: Activite
    dirigeantNom: string
    dirigeantPrenom: string
    document: boolean
    dateCreation: string
    updatedAt: string
    siegeSocial : string
    hasOngoingTask: boolean
}
  

export enum CanalType {
  COMPTA = "COMPTA",
  SOCIALE = "SOCIALE",
  JURIDIQUE = "JURIDIQUE"
}

export interface Message {
  id: number;
  canalId: number;
  contenu: string;
  createdAt: string;
  user : User;
}

export interface Canal {
  id: number;
  societeId: number;
  type: CanalType;
  messages?: Message[];
}

export interface User {
  id: number;
  name: string;
  firstName: string;
  email: string;
  role: number;
  listeFavori: ListeFavori | null;
  cabinet : Cabinet
  tache : Tache[];
  createdAt: string;
  updatedAt: string;
}

export interface ListeFavori {
    id: number;
    userId: number;
    societes: Societe[];
    utilisateur: User;
    createdAt: string;
    updatedAt: string;
}

export interface Cabinet {
    id: number;
    name: string;
    utilisateur: User[];
    createdAt: string;
    updatedAt: string;
}

export interface Tache {
    id: number;
    titre: TypeTache;
    description: string;
    statut: string;
    type: string;
    dateEcheance: Date;
    createur? : {
      name : string,
      firstName: string;
    }
    societe: {
      id: number,
      name: string,
    }
    dateTache: Date;
    createdAt: string;
    urgente: boolean;
    tempsPasse: number;
    collaborateur? : {
      name: string,
      firstName: string
    }
    commentaires: Commentaire[];
}

export enum TypeTache {
  DEMANDE_INFO = "DEMANDE_INFO",
  FLUX_BANCAIRES = "FLUX_BANCAIRES",
  PAIEMENT_REJETE = "PAIEMENT_REJETE",
  EXCEPTION_SOCIALE = "EXCEPTION_SOCIALE",
  TVA = "TVA",
  REVISION_COMPTABLE = "REVISION_COMPTABLE",
  JURIDIQUE = "JURIDIQUE",
  AUTRE = "AUTRE",
}

export interface Activite {
    id: number;
    name: string;
    createdAt: string;
    updatedAt: string;
}

export enum Role {
    COLLABORATEUR = 0,
    ADMIN = 1,  
}
  
export interface UserCabinet {
  id: number;
  name: string;
  firstName: string;
}

export interface Commentaire {
  id: number;
  commentaire: string;
  createdAt: string;
}

export const ALL_STATUTS = ["EN_ATTENTE","EN_COURS","CLIENT","INPI","COLLAB","TERMINEE","ANNULEE"] as const;

export interface Tarif {
  id: number;
  dateFacturation: string; // ex: "2024", "2025-01", ou "2025"
  montantCompta?: number | null;
  montantSocial?: number | null;
  montantRattrapage?: number | null;
  montantAutres?: number | null;
  actif: boolean;
  createdAt?: string;
  updatedAt?: string;
}