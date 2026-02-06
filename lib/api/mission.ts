/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axiosClient";

export async function createMissionSociete(data: any, societeId: number) {
  const { data: res } = await api.post(`/mission/${societeId}`, data);
  return res;
}
