import { apiGet, apiPatch } from "@/lib/api";

export interface Notification {
  id: number;
  userId: number;
  message: string;
  lu: boolean;
  type: "MISSION" | "INFO" | string;
  createdAt: string;
}

export async function getNotifications(): Promise<Notification[]> {
  return apiGet<Notification[]>("/notification");
}

export async function getNotificationsNonLues(): Promise<number> {
  return apiGet<number>("/notification/non-lues");
}

export async function marquerCommeLue(id: number): Promise<{ count: number }> {
  return apiPatch<{ count: number }>(`/notification/${id}/lire`, {});
}

export async function marquerToutCommeLu(): Promise<{ count: number }> {
  return apiPatch<{ count: number }>("/notification/lire-tout", {});
}
