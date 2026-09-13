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
