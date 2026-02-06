import api from "@/lib/axiosClient";

export async function createMissionSociete(data: any, societeId: number) {
  const { data: res } = await api.post(`/mission/${societeId}`, data);
  return res;
}