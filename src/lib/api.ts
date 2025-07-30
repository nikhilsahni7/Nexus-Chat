// src/lib/api.ts
import { useAuthStore } from "@/store/authStore";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;

export const verifyEmail = (email: string, otp: string) =>
  api.post("/auth/verify-email", { email, otp });

export const resendOTP = (email: string) =>
  api.post("/auth/resend-otp", { email });

export const forgotPassword = (email: string) =>
  api.post("/auth/forgot-password", { email });

export const resetPassword = (
  email: string,
  otp: string,
  newPassword: string
) => api.post("/auth/reset-password", { email, otp, newPassword });
