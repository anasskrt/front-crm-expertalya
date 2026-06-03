/** Types locaux partagés dans le module emailListe (non exposés à l'API) */

export interface SocieteShort {
  id: number;
  name: string;
  dirigeantNom?: string;
  dirigeantPrenom?: string;
}
