import { AnimatedIcon } from "@/components/animated-icon";
import { LogResModal } from "@/components/log_res_modal";
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
  const [modal, setModal] = useState(false);
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
        setModal(false);
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
        <View style={styles.heroSection}>
          <AnimatedIcon />
          <ThemedText type="title" style={styles.title}>
            Domus Target
          </ThemedText>
        </View>
        <Pressable onTouchEnd={() => setModal(true)} style={styles.button}>
          <Text>Registrar</Text>
        </Pressable>
        <ThemedText type="code" style={styles.code}>
          Já tem conta?{" "}
          <Text
            style={{ color: "blue", textDecorationLine: "underline" }}
            onPress={() => router.push("/login")}
          >
            ir para login
          </Text>
        </ThemedText>

        <LogResModal
          openModal={modal}
          onAction={() => setRegister()}
          onClose={() => setModal(false)}
          isRegister={true}
        >
          <TextInput
            placeholder="usuário"
            onChangeText={(texto) =>
              setRegisterForm((prev) => ({ ...prev, username: texto }))
            }
            value={registerForm.username}
            style={styles.inputBox}
          />
          <TextInput
            placeholder="senha"
            onChangeText={(texto) =>
              setRegisterForm((prev) => ({ ...prev, password: texto }))
            }
            value={registerForm.password}
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
