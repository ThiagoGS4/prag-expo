import { AnimatedIcon } from "@/components/animated-icon";
import DivisorBar from "@/components/divisor-bar";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { axiosInstance } from "@/services/api";
import * as Device from "expo-device";
import { router } from "expo-router";
import { useCallback, useState } from "react";
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
  const [registerForm, setRegisterForm] = useState<{
    username: string;
    password: string;
    roles: [];
  }>({
    username: "",
    password: "",
    roles: [],
  });

  const setRegister = useCallback(() => {
    async function handleRegister() {
      try {
        await axiosInstance.post("/registrar", registerForm);
        router.push("/(auth)/login");
      } catch (error) {
        console.log("error ->", error);
      }
    }

    handleRegister();
  }, [registerForm]);

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.heroSection}>
            <AnimatedIcon />
            <ThemedText type="title" style={styles.title}>
              Domus Target
            </ThemedText>

            <View style={styles.loginInputs}>
              <TextInput
                placeholder="Usuário"
                onChangeText={(texto) =>
                  setRegisterForm((prev) => ({ ...prev, username: texto }))
                }
                value={registerForm.username}
                style={styles.inputBox}
              />
              <TextInput
                placeholder="Senha"
                onChangeText={(texto) =>
                  setRegisterForm((prev) => ({ ...prev, password: texto }))
                }
                value={registerForm.password}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.inputBox}
              />
            </View>
          </View>
          <View style={styles.actionsView}>
            <Pressable onTouchEnd={() => setRegister()} style={styles.button}>
              <Text
                style={{
                  color: "#FFFFFF",
                  textDecorationLine: "underline",
                }}
              >
                Registrar
              </Text>
            </Pressable>

            <DivisorBar label="ou" />

            <ThemedText type="code" style={styles.code}>
              Já tem conta?{" "}
              <Text
                style={{
                  color: "#1F6F5B",
                  textDecorationLine: "underline",
                }}
                onPress={() => router.push("/login")}
              >
                Ir para login
              </Text>
            </ThemedText>
          </View>
        </View>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  content: { paddingTop: 100 },
  heroSection: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  title: {
    textAlign: "center",
    color: "#000000",
    fontSize: 28,
    zIndex: 101,
  },
  loginInputs: {
    gap: Spacing.two,
  },
  code: {
    textTransform: "uppercase",
    color: "#000000",
  },
  actionsView: { flex: 1, alignItems: "center", gap: Spacing.two },
  button: {
    borderRadius: 10,
    borderStyle: "solid",
    borderColor: "#000000",
    borderWidth: 1.5,
    padding: 6,
    paddingLeft: 12,
    paddingRight: 12,
    width: 320,
    height: 50,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1F6F5B",
  },
  inputBox: {
    padding: 8,
    height: 40,
    width: 320,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#E5E5E5",
  },
});
