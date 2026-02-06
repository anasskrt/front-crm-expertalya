/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axiosClient";

export async function getMessagesByCanal(canalId: number) {
  const { data } = await api.get(`/canal/${canalId}/messages`);
  return data;
}

export async function addMessage(canalId: number, contenu: any) {
  const { data } = await api.post(`/message/canal/${canalId}`, { contenu });
  return data;
}
