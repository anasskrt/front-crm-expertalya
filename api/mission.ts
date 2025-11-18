import api from "@/lib/axiosClient";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function createMissionSociete(data: any, societeId: number) {
  const { data: res } = await api.post(`/mission/${societeId}`, data);
  return res;
}