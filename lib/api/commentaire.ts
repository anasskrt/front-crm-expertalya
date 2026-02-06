import api from "@/lib/axiosClient";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createCommentaire(missionId: number, commentaire: any) {
  const { data } = await api.post(`/commentaire/${missionId}`, { commentaire });
  return data;
}
