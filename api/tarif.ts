// src/api/users.ts
import api from "@/lib/axiosClient";

export async function createTarif(societeId: number, data: any) {
    const { data: res } = await api.post(`/tarif/${societeId}`, data);
    return res;
  }
  