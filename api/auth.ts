import api from "@/lib/axiosClient";

export async function login(email: string, password: string) {
  const response = await api.post(
    `/auth/login`,
    { email, password }
  );
  return response.data;
}

export async function logout() {
  const response = await api.post("/auth/logout");
  return response.data;
}

export async function getRoles() {
  const { data } = await api.get("/auth/whoIAm");
  return data;
}
