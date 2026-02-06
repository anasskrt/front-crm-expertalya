import api from "@/lib/axiosClient";

export async function getProfil() {
  const { data } = await api.get("/user/profil");
  return data;
}
