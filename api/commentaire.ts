import api from "@/lib/axiosClient";

export async function createCommentaire(missionId: number, commentaire: any) {
    const { data } = await api.post(`/commentaire/${missionId}`, { commentaire });
    return data;
}
