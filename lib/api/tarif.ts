/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axiosClient";

export async function createTarif(societeId: number, data: any) {
  const { data: res } = await api.post(`/tarif/${societeId}`, data);
  return res;
}
