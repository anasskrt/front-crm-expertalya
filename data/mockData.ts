// Formats juridiques
export const formatsJuridiques = [
  { id: 1, format: "SARL" },
  { id: 2, format: "SAS" },
  { id: 3, format: "SASU" },
  { id: 4, format: "EURL" },
  { id: 5, format: "SCI" },
  { id: 6, format: "EI" },
];

// Modes de paiement
export const modesPaiement = [
  { id: 1, label: "Virement" },
  { id: 2, label: "Chèque" },
  { id: 3, label: "Prélèvement" },
  { id: 4, label: "Espèces" },
];

// Cabinets
export const cabinets = [
  { id: 4, nom: "En ligne" },
  { id: 5, nom: "Bordeaux" },
  { id: 6, nom: "Paris" },
  { id: 7, nom: "Nantes" },
];

// Statuts de contact
export const statusContacts = [
  { id: 1, status: "Dirigeant" },
  { id: 2, status: "President" },
];

export const regimesImposition = ['IS', 'IR'] as const;
export type RegimeImposition = typeof regimesImposition[number];

export const regimesImpositionOptions = [
  { value: 'IS', label: 'IS – Impôt sur les sociétés' },
  { value: 'IR', label: 'IR – Impôt sur le revenu' },
] as const;

export const isRegimeImposition = (v: any): v is RegimeImposition =>
  (regimesImposition as readonly string[]).includes(v);

export interface Cabinet {
    id: number;
    nom: string;
  }
  
  export interface Contact {
    id: number;
    nom_dirigeant: string;
    prenom_dirigeant: string;
    adresse_dirigeant: string;
    email_dirigeant: string;
    tel_dirigeant: string;
    id_status_contact: number;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface FormatJuridique {
    id: number;
    format: string;
  }
  
  export interface ActivitePrincipale {
    id: number;
    libelle: string;
  }
  
  export enum Role {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    COLLABORATEUR = "COLLABORATEUR",
  }
  
  export interface Utilisateur {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    role: Role;
    cabinet: Cabinet;
    tags: Tag[];
    listeFavori: ListeFavori | null;
    createdAt: string;
    updatedAt: string;
  }
  
  
  export interface Societe {
    id: number;
    denomination_sociale: string;
    adresse_siege_social: string;
    RCS_competent: string;
    numero_siret: string;
    code_naf: string;
    mode_paiement: number;
    id_cabinet: number;
    document: boolean;
    activiteId: number;
    formatId: string;
    dateCloture: string;
    cabinet?: Cabinet;
    format: string;
    contact: Contact;
    activite: string ;
    tags: Tag[];
    createdAt: string;
    updatedAt: string;
    estDansFavoris: boolean
  }
  
  export interface Tag {
    id: number;
    libelle: string;
    utilisateurId: number;
    societeId?: number;
    utilisateur: Utilisateur;
    societes?: Societe[];
    createdAt: string;
    updatedAt: string;
  }
  
  export interface ListeFavori {
    id: number;
    utilisateurId: number;
    societes: Societe[];
    utilisateur: Utilisateur;
    createdAt: string;
    updatedAt: string;
  }
  
  export const mockCabinets: Cabinet[] = [
    { id: 1, nom: "Cabinet A"   },
    { id: 2, nom: "Cabinet B"  },
    { id: 3, nom: "Cabinet C" },
  ];
  
  export const mockContacts: Contact[] = [
    {
      id: 1,
      nom_dirigeant: "Doe",
      prenom_dirigeant: "John",
      adresse_dirigeant: "123 Main St",
      email_dirigeant: "john.doe@example.com",
      tel_dirigeant: "123-456-7890",
      id_status_contact: 1,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
    {
      id: 2,
      nom_dirigeant: "Smith",
      prenom_dirigeant: "Jane",
      adresse_dirigeant: "456 Elm St",
      email_dirigeant: "jane.smith@example.com",
      tel_dirigeant: "987-654-3210",
      id_status_contact: 2,
      createdAt: "2024-01-01T00:00:00.000Z",
      updatedAt: "2024-01-01T00:00:00.000Z",
    },
  ];
  
  export const mockFormatsJuridiques: FormatJuridique[] = [
    { id: 1, format: "SARL" },
    { id: 2, format: "SAS" },
    { id: 3, format: "EURL" },
    { id: 4, format: "SASU" },
  ];

  
  export const mockStatusContacts: StatusContact[] = [
    { id: 1, status: "Actif", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: 2, status: "Inactif", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: 3, status: "En attente", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" },
    { id: 4, status: "Suspendu", createdAt: "2024-01-01T00:00:00.000Z", updatedAt: "2024-01-01T00:00:00.000Z" }
  ];
  
  export const mockMissionsPrincipales: MissionPrincipale[] = [
    { id: 1, mission: "Tenue de comptabilité" },
    { id: 2, mission: "Révision comptable" },
    { id: 3, mission: "Établissement des comptes annuels" },
    { id: 4, mission: "Déclarations fiscales" },
    { id: 5, mission: "Déclarations sociales" },
    { id: 6, mission: "Audit légal" },
    { id: 7, mission: "Conseil juridique" },
    { id: 8, mission: "Gestion de paie" }
  ];
  
  // Ajout des nouveaux types pour les nouvelles entités
  export interface StatusContact {
    id: number;
    status: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface MissionPrincipale {
    id: number;
    mission: string;
  }
  
  export interface MissionSociete {
    id: number;
    status: boolean;
    date_debut: string;
    date_fin?: string;
    missionId: number;
    id_societe: number;
    mission: MissionPrincipale;
    societe: Societe;
  }
  
  export interface Paiement {
    id: number;
    tarif_compta: number;
    tarif_sociale: number;
    prestation_exceptionnelle: number;
    sepa: boolean;
    iban: string;
    bic: string;
    id_societe: number;
    societe: Societe;
    createdAt: string;
    updatedAt: string;
  }
  
  // Add the missing mockCurrentUser export
