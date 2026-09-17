import { axiosInstance } from "@/services/api";
import { DateTimePickerChangeEvent } from "@react-native-community/datetimepicker";
import {
  differenceInDays,
  differenceInSeconds,
  format,
  isToday,
  parseISO,
} from "date-fns";
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

export function parseDate(dataIso: string) {
  const formatedDate = format(parseISO(dataIso), "yyyy-MM-dd");
  return formatedDate;
}

export function getRandomHexColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function getDotDateColor(date: string, status: string) {
  const parsedDate = getFixedDateTime(date);
  const todayDate = getFixedDateTime(new Date().toISOString());
  let color = "";

  if (status === "Encerrado") {
    color = "green";
  } else if (differenceInDays(parsedDate, todayDate) >= 3) {
    color = "magenta";
  } else if (
    !isToday(parsedDate) &&
    differenceInSeconds(parsedDate, todayDate) >= 0
  ) {
    color = "blue";
  } else if (differenceInSeconds(parsedDate, todayDate) >= 0) {
    color = "orange";
  } else {
    color = "red";
  }
  return color;
}

export function getFixedDateTime(date: string) {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  const parsedDate = new Date(parseISO(date).getTime() - tzOffset);
  return parsedDate;
}

export function getDateStatus(date: string, status: string) {
  const parsedDate = getFixedDateTime(date);
  const todayDate = getFixedDateTime(new Date().toISOString());
  switch (status) {
    case "Encerrado":
      return { value: status, color: "#28c940" };
    case "Em progresso":
    case "Agendado":
      if (differenceInSeconds(parsedDate, todayDate) >= 0) {
        return { value: status, color: "#f4ae2c" };
      } else {
        return { value: status + "\n(em atraso)", color: "#fc1a1a" };
      }
  }
  return "";
}

export function timePickerConverter(time: DateTimePickerChangeEvent) {
  return new Date(time.nativeEvent.timestamp);
}

export function timePickerConverterPlus(time: DateTimePickerChangeEvent) {
  return new Date(
    time.nativeEvent.timestamp + time.nativeEvent.utcOffset * 60 * 1000,
  );
}

export function isIsoDateString(value: any): boolean {
  if (typeof value !== "string") return false;
  const isoRegex =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?$/;
  return isoRegex.test(value);
}
