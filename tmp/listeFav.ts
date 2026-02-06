// src/api/favoris.ts
import api from "@/lib/axiosClient";

export async function getListeFav() {
  const { data } = await api.get("/user/favori");
  return data;
}

export async function addSocieteToFavoris(societeId: number) {
  const { data } = await api.patch("/user/favori", { societeId });
  return data;
}

export async function removeSocieteFromFavoris(societeId: number) {
  const { data } = await api.delete(`/user/favori/${societeId}`);
  return data;
}
