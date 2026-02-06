import api from "@/lib/axiosClient";

export async function getCabinets() {
  const { data } = await api.get("/cabinet");
  return data;
}
