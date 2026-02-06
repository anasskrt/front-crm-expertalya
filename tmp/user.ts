// src/api/users.ts
import api from "@/lib/axiosClient";

export async function getUtilisateurs() {
  const { data } = await api.get("/user");
  return data;
}

export async function getUserCab() {
  const { data } = await api.get("/user/cabinet");
  return data;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function createUtilisateur(payload: any) {
  const { data } = await api.post("/user", payload);
  return data;
}

export async function deleteUser(id: number) {
  const { data } = await api.delete(`/user/${id}`);
  return data;
}

export async function upgradeUser(id: number) {
  const { data } = await api.patch(`/user/${id}`, {});
  return data;
}

export async function updateUserCabinet(userId: number, cabinetId: number) {
  const { data } = await api.patch(`/user/${userId}/cabinet`, { cabinet: cabinetId });
  return data;
}
