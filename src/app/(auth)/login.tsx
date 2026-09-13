import { AnimatedIcon } from "@/components/animated-icon";
import { LogResModal } from "@/components/log_res_modal";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { checkLogin } from "@/helpers/utils";
import { axiosInstance } from "@/services/api";
import * as Device from "expo-device";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useCallback, useEffect, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function getDevMenuHint() {
  if (Platform.OS === "web") {
    return <ThemedText type="small">use browser devtools</ThemedText>;
  }
  if (Device.isDevice) {
    return (
      <ThemedText type="small">
        shake device or press <ThemedText type="code">m</ThemedText> in terminal
      </ThemedText>
    );
  }
  const shortcut = Platform.OS === "android" ? "cmd+m (or ctrl+m)" : "cmd+d";
  return (
    <ThemedText type="small">
      press <ThemedText type="code">{shortcut}</ThemedText>
    </ThemedText>
  );
}

export default function HomeScreen() {
  const [isLogged, setIslogged] = useState(false);
  const [modal, setModal] = useState(false);
  const [loginForm, setLoginForm] = useState<{
    username: string;
    password: string;
  }>({
    username: "",
    password: "",
  });

  const setLogin = useCallback(() => {
    async function handleLogin() {
      try {
        const res = await axiosInstance.post("/logar", loginForm);
        SecureStore.setItem("accessToken", res.data.accessToken);
        setModal(false);
        router.push("/(tabs)/home");
        return res.data;
      } catch (error) {
        console.log("error ->", error);
      }
    }

    handleLogin();
  }, [loginForm]);

  useEffect(() => {
    const verify = async () => {
      const check = await checkLogin();
      if (check) {
        router.push("/(tabs)/home");
      }
    };

    verify();
  }, []);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Domus Target aa
          </ThemedText>
        </View>

        <ThemedText>teste</ThemedText>

        <ThemedText type="code" style={styles.code}>
          tesasdadaaa
        </ThemedText>

        <Pressable onTouchEnd={() => setModal(true)} style={styles.button}>
          <Text>Fazer login</Text>
        </Pressable>

        <ThemedText type="code" style={styles.code}>
          não tem conta?{" "}
          <Text
            style={{ color: "blue", textDecorationLine: "underline" }}
            onPress={() => router.push("/register")}
          >
            Registre-se
          </Text>
        </ThemedText>

        <LogResModal
          openModal={modal}
          onClose={() => setModal(false)}
          onAction={() => setLogin()}
        >
          <TextInput
            placeholder="usuário"
            onChangeText={(texto) =>
              setLoginForm((prev) => ({ ...prev, username: texto }))
            }
            value={loginForm.username}
            style={styles.inputBox}
          />
          <TextInput
            placeholder="senha"
            onChangeText={(texto) =>
              setLoginForm((prev) => ({ ...prev, password: texto }))
            }
            value={loginForm.password}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.inputBox}
          />
        </LogResModal>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    experimental_backgroundImage: "linear-gradient(45deg, #1F8A5D, #0E56A0)",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.four,
  },
  title: {
    textAlign: "center",
  },
  code: {
    textTransform: "uppercase",
  },
  button: {
    borderRadius: 10,
    borderStyle: "solid",
    borderColor: "#000000",
    borderWidth: 1.5,
    padding: 6,
    paddingLeft: 12,
    paddingRight: 12,
    backgroundColor: "#FFFFFF",
  },
  inputBox: {
    padding: 7,
    height: 32,
    borderWidth: 1,
    borderRadius: 10,
  },
});
