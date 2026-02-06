import api from "@/lib/axiosClient";

export async function exportAllSociete() {
  const { data } = await api.get(`/googleapi/societes`);
  return data;
}

export async function exportAllTask() {
  const { data } = await api.get(`/googleapi/tasks/by-collaborator`);
  return data;
}
