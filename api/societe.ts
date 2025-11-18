import api from "@/lib/axiosClient";

export async function searchSocietes(filters: Record<string, any>) {
  const { data } = await api.get("/societe/", { params: filters });
  return data;
}

export async function createSocieteWithContact(data: any) {
  const { data: res } = await api.post("/societe", data);
  return res;
}

export async function getSocieteById(id: number) {
  const { data } = await api.get(`/societe/${id}`);
  return data;
}

export async function getSocieteNomId() {
  const { data } = await api.get("/societe/nom/id");
  return data;
}

export async function deleteSociete(id: number) {
  const { data } = await api.delete(`/societe/${id}`);
  return data;
}

export async function getSocieteDocument(id: number) {
  const { data } = await api.get(`/societe/${id}/documents`);
  return data;
}

export async function sendSocieteDocument(id: number, payload: any) {
  const { data } = await api.patch(`/societe/${id}/documents`, payload);
  return data;
}

export async function updateSociete(id: number, payload: any) {
  const { data } = await api.patch(`/societe/${id}`, payload);
  return data;
}


export async function searchSocieteArchivercietes(filters: Record<string, any>) {
  const { data } = await api.get("/societe/archiver", { params: filters });
  return data;
}

export async function setArchiveSocieteById(
  id: number,
  payload: { archive: boolean;  }
) {
  const { data } = await api.patch(`/societe/${id}/archiver`, payload);
  return data;
}