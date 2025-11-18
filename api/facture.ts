import api from "@/lib/axiosClient";

interface FactureModel {
  montantCompta: number;
  montantSocial: number;
  montantRattrapage: number;
  montantAutres: number;
  date: string;
  paye: boolean;
  commentaire: string;
}


export async function getAllFactures(societeId: number) {
  const { data } = await api.get(`/facture/all/${societeId}`);
  return data;
}

export async function getAllFacturesForSos(societeId: number) {
  const { data } = await api.get(`/facture/${societeId}`);
  return data;
}

export async function getAnalyseAll() {
  const { data } = await api.get(`/facture/analyseAll`);
  console.log("Analyse all factures data:", data);
  return data;
}

export async function createFacture(
  societeId: number,
  payload: {
    date: string; // "YYYY-MM-DD"
    montantCompta: number;
    montantSocial: number;
    montantRattrapage: number;
    montantAutres: number;
    paye: boolean; // true = payée
  }
) {
  const { data } = await api.post(`/facture/${societeId}`, payload);
  return data;
}

export async function updateFacture(
  factureId: number,
  payload: {     
    date: string; // "YYYY-MM-DD"
    montantCompta: number;
    montantSocial: number;
    montantRattrapage: number;
    montantAutres: number;
    paye: boolean; // true = payée  
    commentaire: string;
  }) {
  const { data } = await api.patch(`/facture/${factureId}`, payload);
  return data;
}