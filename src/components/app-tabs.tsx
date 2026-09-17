import { Colors } from "@/constants/theme";
import { axiosInstance } from "@/services/api";
import { Feather as Icon } from "@react-native-vector-icons/feather";
import { router, Tabs } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { StatusError } from "expo-server";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export async function handleLogout() {
  try {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    router.replace("/(auth)/login");
  } catch (error) {
    console.error("Erro ao fazer logout:", error);
  }
}

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const [isLogged, setIslogged] = useState(false);

  const tabScreens = [
    { name: "home", label: "Início", icon: "home" },
    { name: "schedules", label: "Agenda", icon: "calendar" },
    { name: "customers", label: "Clientes", icon: "users" },
    { name: "properties", label: "Locais", icon: "map-pin" },
    { name: "audit-log", label: "Auditoria", icon: "clipboard" },
    { name: "data-options", label: "Opções", icon: "settings" },
  ];

  async function checkLogin() {
    const token = SecureStore.getItem("accessToken");

    if (token) {
      try {
        await axiosInstance.get("/me");
        setIslogged(true);
      } catch (error) {
        await handleLogout();
        throw new StatusError(401, "Not logged or token expired");
      }
    } else {
      router.replace("/(auth)/login");
    }
  }

  useEffect(() => {
    checkLogin();
  }, []);

  if (!isLogged) return null;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopWidth: 1,
          borderTopColor: "#E0E5EC",
        },
      }}
    >
      {tabScreens.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: ({ color, size }) => (
              <Icon name={tab.icon} size={size} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
