import api from "@/lib/axiosClient";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function login(email: string, password: string) {
  const response = await axios.post(`${API_URL}/auth/login`, {
    email,
    password,
  });
  return response.data;
}

export async function getRoles() {
  const { data } = await api.get("/auth/whoIAm");
  return data;
}
