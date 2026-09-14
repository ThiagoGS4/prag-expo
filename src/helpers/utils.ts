import { axiosInstance } from "@/services/api";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusError } from "expo-server";

export async function checkLogin() {
  const token = SecureStore.getItem("accessToken");

  if (token) {
    try {
      await axiosInstance.get("/me");
      return true;
    } catch (error) {
      SecureStore.deleteItemAsync("accessToken");
      router.push("/(auth)/login");
      throw new StatusError(401, "Not logged or token expired");
    }
  }
}

export const extractTokenClaims = (token: string | null) => {
  try {
    const base64Url = token ? token.split(".")[1] : "";

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");

    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );

    const username = JSON.parse(jsonPayload).sub;

    return username ?? "";
  } catch (error) {
    console.error("Failed to parse token claims:", error);
    return null;
  }
};
