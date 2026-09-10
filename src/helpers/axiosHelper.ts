import type { AxiosError } from "axios";

type ApiErrorResponse = {
  status?: number;
  message?: string;
  errors?: Record<string, string>;
};

type DefaultError = {
  error: string;
  path: string;
  status: number;
  timestamp: string;
}


export function getErrorMessage(error: unknown, fallback: string) {
  const axiosError = error as AxiosError<ApiErrorResponse & DefaultError>;
  const data = axiosError.response?.data;

  if (!data) return fallback;

  if (data.errors) {
    const details = Object.values(data.errors).join(" | ");
    return data.message ? `${data.message}: ${details}` : details;
  }
  
  return data.error
}