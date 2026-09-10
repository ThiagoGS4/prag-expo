import { Colors } from "@/constants/theme";
import { axiosInstance } from "@/services/api";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import * as SecureStore from "expo-secure-store";
import { StatusError } from "expo-server";
import { useEffect, useState } from "react";
import { useColorScheme } from "react-native";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "unspecified" ? "light" : scheme];

  const [isLogged, setIslogged] = useState(false);

  useEffect(() => {
    async function checkLogin() {
      const token = SecureStore.getItem("accessToken");

      if (token) {
        try {
          await axiosInstance.get("/me");
          setIslogged(true);
        } catch (error) {
          throw new StatusError(401, "Not logged or token expired");
        }
      }
    }

    checkLogin();
  }, []);

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
      hidden={!isLogged}
    >
      <NativeTabs.Trigger name="home">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/home.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="explore">
        <NativeTabs.Trigger.Icon
          src={require("@/assets/images/tabIcons/explore.png")}
          renderingMode="template"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
