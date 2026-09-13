import { Colors } from "@/constants/theme";
import { axiosInstance } from "@/services/api";
import { router } from "expo-router";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import * as SecureStore from "expo-secure-store";
import { StatusError } from "expo-server";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];
  const [isLogged, setIslogged] = useState(false);

  const tabScreens = [
    {
      name: "home",
      label: "Home",
      icon: require("@/assets/images/tabIcons/home.png"),
    },
    {
      name: "schedules",
      label: "Schedules",
      icon: require("@/assets/images/tabIcons/explore.png"),
    },
    {
      name: "customers",
      label: "Customers",
      icon: require("@/assets/images/tabIcons/explore.png"),
    },
  ];

  async function checkLogin() {
    const token = SecureStore.getItem("accessToken");

    if (token) {
      try {
        await axiosInstance.get("/me");
        setIslogged(true);
      } catch (error) {
        SecureStore.deleteItemAsync("accessToken");
        router.push("/(auth)/login");
        throw new StatusError(401, "Not logged or token expired");
      }
    }
  }

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
      hidden={!isLogged}
    >
      {tabScreens.map((tab) => (
        <NativeTabs.Trigger key={tab.name} name={tab.name}>
          {tab.label && (
            <NativeTabs.Trigger.Label>{tab.label}</NativeTabs.Trigger.Label>
          )}
          <NativeTabs.Trigger.Icon src={tab.icon} renderingMode="template" />
        </NativeTabs.Trigger>
      ))}
    </NativeTabs>
  );
}
